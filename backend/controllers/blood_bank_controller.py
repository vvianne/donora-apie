from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db
from models.blood_inventory import BloodInventory
from models.blood_bank import BloodBank
from models.blood_request import BloodRequest
from models.hospital import Hospital
from models.user import User


blood_bank_bp = Blueprint('blood_bank', __name__)


def _normalize_location(value):
    return (value or '').strip().lower()


def _current_user():
    return User.query.get(int(get_jwt_identity()))


def _current_facility(user=None):
    user = user or _current_user()
    role = (user.role or '').lower() if user else ''
    if role == 'hospital':
        model = Hospital
    elif role == 'blood_bank':
        model = BloodBank
    else:
        return None, None

    facility = next(
        (
            item for item in model.query.filter_by(name=user.full_name).all()
            if _normalize_location(item.location) == _normalize_location(user.location)
        ),
        None,
    )
    if not facility:
        facility = model(
            name=user.full_name or user.username,
            location=user.location or 'Unknown',
        )
        db.session.add(facility)
        db.session.flush()
    return role, facility


def _current_blood_bank():
    role, facility = _current_facility()
    return facility if role == 'blood_bank' else None


def _valid_quantity(data):
    quantity = data.get('quantity')
    if isinstance(quantity, bool) or not isinstance(quantity, int):
        return None, 'Quantity must be an integer.'
    if quantity < 0:
        return None, 'Quantity cannot be negative.'
    return quantity, None


def _is_owned_by(inventory, owner_type, facility_id):
    if owner_type == 'hospital':
        return inventory.hospital_id == facility_id
    if owner_type == 'blood_bank':
        return inventory.blood_bank_id == facility_id
    return False


def _serialize_inventory(inventory, owner_type, facility_id):
    payload = inventory.serialize()
    payload['owner_id'] = inventory.hospital_id or inventory.blood_bank_id
    payload['is_owned_by_current_user'] = _is_owned_by(
        inventory, owner_type, facility_id
    )
    return payload


@blood_bank_bp.route('/inventory', methods=['POST'])
@jwt_required()
def add_inventory():
    user = _current_user()
    owner_type, facility = _current_facility(user)
    if not facility:
        return jsonify({
            'success': False,
            'message': 'Only Hospital and Blood Bank users can create inventory.'
        }), 403

    data = request.get_json(silent=True) or {}
    blood_type = (data.get('blood_type') or '').strip().upper()
    quantity, quantity_error = _valid_quantity(data)
    if not blood_type or 'quantity' not in data:
        return jsonify({
            'success': False,
            'message': 'Blood type and quantity are required.'
        }), 400
    if quantity_error:
        return jsonify({'success': False, 'message': quantity_error}), 400

    inventory = BloodInventory(
        hospital_id=facility.id if owner_type == 'hospital' else None,
        blood_bank_id=facility.id if owner_type == 'blood_bank' else None,
        blood_type=blood_type,
        quantity=quantity,
    )
    db.session.add(inventory)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Inventory added successfully.',
        'data': _serialize_inventory(inventory, owner_type, facility.id),
    }), 201


@blood_bank_bp.route('/inventory/<int:inventory_id>', methods=['PUT'])
@jwt_required()
def update_inventory(inventory_id):
    inventory = BloodInventory.query.get(inventory_id)
    if not inventory:
        return jsonify({'success': False, 'message': 'Inventory not found.'}), 404

    owner_type, facility = _current_facility()
    if not facility:
        return jsonify({
            'success': False,
            'message': 'Inventory access is not permitted for your role.'
        }), 403
    if not _is_owned_by(inventory, owner_type, facility.id):
        return jsonify({
            'success': False,
            'message': 'You can only update inventory owned by your facility.'
        }), 403

    data = request.get_json(silent=True) or {}
    quantity, quantity_error = _valid_quantity(data)
    if quantity_error:
        return jsonify({'success': False, 'message': quantity_error}), 400

    blood_type = (data.get('blood_type') or inventory.blood_type).strip().upper()
    if not blood_type:
        return jsonify({'success': False, 'message': 'Blood type is required.'}), 400

    inventory.blood_type = blood_type
    inventory.quantity = quantity
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Inventory updated successfully.',
        'data': _serialize_inventory(inventory, owner_type, facility.id),
    }), 200


@blood_bank_bp.route('/inventory/<int:inventory_id>', methods=['DELETE'])
@jwt_required()
def delete_inventory(inventory_id):
    inventory = BloodInventory.query.get(inventory_id)
    if not inventory:
        return jsonify({'success': False, 'message': 'Inventory not found.'}), 404

    owner_type, facility = _current_facility()
    if not facility:
        return jsonify({
            'success': False,
            'message': 'Inventory access is not permitted for your role.'
        }), 403
    if not _is_owned_by(inventory, owner_type, facility.id):
        return jsonify({
            'success': False,
            'message': 'You can only delete inventory owned by your facility.'
        }), 403

    db.session.delete(inventory)
    db.session.commit()
    return jsonify({
        'success': True,
        'message': 'Inventory deleted successfully.'
    }), 200


@blood_bank_bp.route('/inventory', methods=['GET'])
@jwt_required()
def view_inventory():
    user = _current_user()
    owner_type, facility = _current_facility(user)
    if not facility:
        return jsonify({
            'success': False,
            'message': 'Inventory access is not permitted for your role.'
        }), 403

    location = _normalize_location(user.location)
    inventory = [
        item for item in BloodInventory.query.all()
        if _normalize_location(item.serialize().get('location')) == location
    ]

    totals = {}
    for item in inventory:
        totals[item.blood_type] = totals.get(item.blood_type, 0) + item.quantity

    return jsonify({
        'success': True,
        'location': (user.location or '').strip(),
        'data': [
            _serialize_inventory(item, owner_type, facility.id)
            for item in inventory
        ],
        'totals': totals,
    }), 200


@blood_bank_bp.route('/requests', methods=['GET'])
@jwt_required()
def view_requests():
    if not _current_blood_bank():
        return jsonify({
            'success': False,
            'message': 'Blood bank account required.'
        }), 403
    items = BloodRequest.query.order_by(BloodRequest.created_at.desc()).all()
    return jsonify({
        'success': True,
        'data': [item.serialize() for item in items]
    }), 200
