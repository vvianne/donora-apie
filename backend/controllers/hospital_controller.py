from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.blood_request import BloodRequest
from models.hospital import Hospital

hospital_bp = Blueprint('hospital', __name__)

@hospital_bp.route('/request', methods=['POST'])
@jwt_required()
def create_request():
    data = request.get_json()
    hospital_id = data.get('hospital_id')
    blood_type = data.get('blood_type')
    status = 'Pending'

    new_request = BloodRequest(hospital_id=hospital_id, blood_type=blood_type, status=status)
    db.session.add(new_request)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Request created successfully.'}), 201

@hospital_bp.route('/request/<int:request_id>', methods=['GET'])
@jwt_required()
def view_request(request_id):
    blood_request = BloodRequest.query.get(request_id)
    if not blood_request:
        return jsonify({'success': False, 'message': 'Request not found.'}), 404
    return jsonify({'success': True, 'data': blood_request}), 200

@hospital_bp.route('/request/<int:request_id>', methods=['PUT'])
def update_request(request_id):
    data = request.get_json()
    blood_request = BloodRequest.query.get(request_id)
    if not blood_request:
        return jsonify({'success': False, 'message': 'Request not found.'}), 404
    blood_request.blood_type = data.get('blood_type', blood_request.blood_type)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Request updated successfully.'}), 200

@hospital_bp.route('/request/<int:request_id>', methods=['DELETE'])
@jwt_required()
def cancel_request(request_id):
    blood_request = BloodRequest.query.get(request_id)
    if not blood_request:
        return jsonify({'success': False, 'message': 'Request not found.'}), 404
    db.session.delete(blood_request)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Request canceled successfully.'}), 200
