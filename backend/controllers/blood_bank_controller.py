from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.blood_inventory import BloodInventory
from models.blood_bank import BloodBank
from models.blood_request import BloodRequest
from models.user import User

blood_bank_bp = Blueprint('blood_bank', __name__)

def _current_blood_bank():
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role.lower() != 'blood_bank':
        return None
    bank = BloodBank.query.filter_by(name=user.full_name, location=user.location).first()
    if not bank:
        bank = BloodBank(name=user.full_name or user.username, location=user.location or 'Unknown')
        db.session.add(bank)
        db.session.flush()
    return bank

@blood_bank_bp.route('/inventory', methods=['POST'])
@jwt_required()
def add_inventory():
    data = request.get_json(silent=True) or {}
    blood_bank = _current_blood_bank()
    if not blood_bank:
        return jsonify({'success': False, 'message': 'Blood bank account required.'}), 403

    blood_type = data.get('blood_type')
    quantity = data.get('quantity')

    if not blood_type or quantity is None:
        return jsonify({'success': False, 'message': 'Blood type and quantity are required.'}), 400

    new_inventory = BloodInventory(blood_bank_id=blood_bank.id, blood_type=blood_type, quantity=quantity)
    db.session.add(new_inventory)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Inventory added successfully.'}), 201

@blood_bank_bp.route('/inventory/<int:inventory_id>', methods=['PUT'])
@jwt_required()
def update_inventory(inventory_id):
    bank = _current_blood_bank()
    data = request.get_json()
    inventory = BloodInventory.query.get(inventory_id)
    if not inventory or not bank or inventory.blood_bank_id != bank.id:
        return jsonify({'success': False, 'message': 'Inventory not found.'}), 404
    inventory.quantity = data.get('quantity', inventory.quantity)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Inventory updated successfully.'}), 200

@blood_bank_bp.route('/inventory/<int:inventory_id>', methods=['DELETE'])
@jwt_required()
def delete_inventory(inventory_id):
    bank = _current_blood_bank()
    inventory = BloodInventory.query.get(inventory_id)
    if not inventory or not bank or inventory.blood_bank_id != bank.id:
        return jsonify({'success': False, 'message': 'Inventory not found.'}), 404
    db.session.delete(inventory)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Inventory deleted successfully.'}), 200

@blood_bank_bp.route('/inventory', methods=['GET'])
@jwt_required()
def view_inventory():
    bank = _current_blood_bank()
    if not bank:
        # Hospitals may read aggregate stock but cannot mutate it.
        user = User.query.get(int(get_jwt_identity()))
        if not user or user.role.lower() != 'hospital':
            return jsonify({'success': False, 'message': 'Unauthorized.'}), 403
        inventory = BloodInventory.query.all()
    else:
        inventory = BloodInventory.query.filter_by(blood_bank_id=bank.id).all()
    return jsonify({'success': True, 'data': [inv.serialize() for inv in inventory]}), 200

@blood_bank_bp.route('/requests', methods=['GET'])
@jwt_required()
def view_requests():
    if not _current_blood_bank():
        return jsonify({'success': False, 'message': 'Blood bank account required.'}), 403
    items = BloodRequest.query.order_by(BloodRequest.created_at.desc()).all()
    return jsonify({'success': True, 'data': [item.serialize() for item in items]}), 200
