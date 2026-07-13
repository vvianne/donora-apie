from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from database import db
from models.blood_request import BloodRequest
from models.donor_response import DonorResponse
from models.hospital import Hospital
from models.user import User
from services.blood_request_workflow import transition_response
from services.matching_service import matching_donors
from models.notification import Notification
from datetime import datetime


hospital_bp = Blueprint('hospital', __name__)


def _current_hospital():
    user = User.query.get(int(get_jwt_identity()))
    if not user or user.role.lower() != 'hospital':
        return None, None
    hospital = Hospital.query.filter_by(
        name=user.full_name, location=user.location
    ).first()
    if not hospital:
        hospital = Hospital(name=user.full_name or user.username, location=user.location or 'Unknown')
        db.session.add(hospital)
        db.session.flush()
    return user, hospital


def _serialize_request(item):
    payload = item.serialize()
    payload['hospital_name'] = item.hospital.name if item.hospital else 'Unknown hospital'
    payload['responses'] = [
        {
            'id': response.id,
            'donor_id': response.donor_id,
            'donor_name': response.donor.full_name or response.donor.username,
            'blood_type': response.donor.blood_type,
            'location': response.donor.location,
            'status': response.status,
            'created_at': response.created_at.isoformat() if response.created_at else None,
        }
        for response in DonorResponse.query.filter_by(blood_request_id=item.id)
        .order_by(DonorResponse.created_at.desc()).all()
    ]
    return payload


@hospital_bp.route('/request', methods=['POST'])
@jwt_required()
def create_request():
    _, hospital = _current_hospital()
    if not hospital:
        return jsonify({'success': False, 'message': 'Hospital account required.'}), 403
    data = request.get_json(silent=True) or {}
    blood_type = (data.get('blood_type') or '').upper()
    try:
        quantity = int(data.get('quantity', 1))
    except (TypeError, ValueError):
        quantity = 0
    if not blood_type or quantity < 1:
        return jsonify({'success': False, 'message': 'Valid blood type and quantity are required.'}), 400

    item = BloodRequest(
        hospital_id=hospital.id,
        blood_type=blood_type,
        quantity=quantity,
        status='pending',
    )
    db.session.add(item)
    db.session.flush()
    for donor in matching_donors(item):
        db.session.add(Notification(
            user_id=donor.id,
            message=f'{hospital.name} needs {item.blood_type} blood in {hospital.location}.',
            created_at=datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S'),
        ))
    db.session.commit()
    return jsonify({'success': True, 'message': 'Request created successfully.', 'data': _serialize_request(item)}), 201


@hospital_bp.route('/request', methods=['GET'])
@jwt_required()
def view_all_requests():
    _, hospital = _current_hospital()
    if not hospital:
        return jsonify({'success': False, 'message': 'Hospital account required.'}), 403
    items = BloodRequest.query.filter_by(hospital_id=hospital.id).order_by(
        BloodRequest.created_at.desc(), BloodRequest.id.desc()
    ).all()
    return jsonify({'success': True, 'data': [_serialize_request(item) for item in items]}), 200


@hospital_bp.route('/request/<int:request_id>', methods=['GET'])
@jwt_required()
def view_request(request_id):
    _, hospital = _current_hospital()
    item = BloodRequest.query.get(request_id)
    if not hospital or not item or item.hospital_id != hospital.id:
        return jsonify({'success': False, 'message': 'Request not found.'}), 404
    return jsonify({'success': True, 'data': _serialize_request(item)}), 200


@hospital_bp.route('/request/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_request(request_id):
    _, hospital = _current_hospital()
    item = BloodRequest.query.get(request_id)
    if not hospital or not item or item.hospital_id != hospital.id:
        return jsonify({'success': False, 'message': 'Request not found.'}), 404
    if (item.status or '').lower() not in ('pending', 'open', 'urgent', 'active'):
        return jsonify({'success': False, 'message': 'Only active requests can be edited.'}), 409
    data = request.get_json(silent=True) or {}
    item.blood_type = (data.get('blood_type') or item.blood_type).upper()
    item.quantity = int(data.get('quantity', item.quantity))
    db.session.commit()
    return jsonify({'success': True, 'message': 'Request updated successfully.', 'data': _serialize_request(item)}), 200


@hospital_bp.route('/request/<int:request_id>', methods=['DELETE'])
@jwt_required()
def cancel_request(request_id):
    _, hospital = _current_hospital()
    item = BloodRequest.query.get(request_id)
    if not hospital or not item or item.hospital_id != hospital.id:
        return jsonify({'success': False, 'message': 'Request not found.'}), 404
    item.status = 'cancelled'
    for response in DonorResponse.query.filter_by(blood_request_id=item.id).all():
        response.status = 'cancelled'
    db.session.commit()
    return jsonify({'success': True, 'message': 'Request cancelled successfully.'}), 200


@hospital_bp.route('/response/<int:response_id>/status', methods=['PATCH'])
@jwt_required()
def update_response_status(response_id):
    _, hospital = _current_hospital()
    response = DonorResponse.query.get(response_id)
    if not hospital or not response or response.blood_request.hospital_id != hospital.id:
        return jsonify({'success': False, 'message': 'Response not found.'}), 404
    data = request.get_json(silent=True) or {}
    try:
        transition_response(response, data.get('status'))
        db.session.commit()
    except ValueError as exc:
        return jsonify({'success': False, 'message': str(exc)}), 400
    return jsonify({'success': True, 'message': 'Workflow status updated.', 'data': {
        'response_status': response.status,
        'request_status': response.blood_request.status,
    }}), 200
