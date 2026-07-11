from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.blood_inventory import BloodInventory
from models.blood_bank import BloodBank

blood_bank_bp = Blueprint('blood_bank', __name__)

@blood_bank_bp.route('/inventory', methods=['POST'])
@jwt_required()
def add_inventory():
    data = request.get_json()
    blood_bank_id = data.get('blood_bank_id')
    blood_type = data.get('blood_type')
    quantity = data.get('quantity')

    new_inventory = BloodInventory(blood_bank_id=blood_bank_id, blood_type=blood_type, quantity=quantity)
    db.session.add(new_inventory)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Inventory added successfully.'}), 201

@blood_bank_bp.route('/inventory/<int:inventory_id>', methods=['PUT'])
@jwt_required()
def update_inventory(inventory_id):
    data = request.get_json()
    inventory = BloodInventory.query.get(inventory_id)
    if not inventory:
        return jsonify({'success': False, 'message': 'Inventory not found.'}), 404
    inventory.quantity = data.get('quantity', inventory.quantity)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Inventory updated successfully.'}), 200

@blood_bank_bp.route('/inventory/<int:inventory_id>', methods=['DELETE'])
@jwt_required()
def delete_inventory(inventory_id):
    inventory = BloodInventory.query.get(inventory_id)
    if not inventory:
        return jsonify({'success': False, 'message': 'Inventory not found.'}), 404
    db.session.delete(inventory)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Inventory deleted successfully.'}), 200

@blood_bank_bp.route('/inventory', methods=['GET'])
@jwt_required()
def view_inventory():
    inventory = BloodInventory.query.all()
    return jsonify({'success': True, 'data': [inv.serialize() for inv in inventory]}), 200
