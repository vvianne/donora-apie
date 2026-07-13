from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from database import db
from models.user import User
from models.donation_history import DonationHistory
from models.hospital import Hospital
from models.blood_bank import BloodBank
from models.blood_request import BloodRequest
from models.donor_response import DonorResponse
from services.blood_request_workflow import transition_response


donor_bp = Blueprint('donor', __name__)

OPEN_REQUEST_STATUSES = ('pending', 'open', 'urgent', 'active')


def _current_donor():
    donor = User.query.get(int(get_jwt_identity()))
    if not donor or donor.role.upper() != 'DONOR':
        return None
    return donor


def _normalized_location(value):
    return ' '.join((value or '').strip().lower().split())


def _request_payloads(donor_id):
    """The single request query/serialization used by Nearby and Dashboard."""
    donor = User.query.get(donor_id)
    if not donor or not donor.blood_type or not _normalized_location(donor.location):
        return []
    responses = (
        DonorResponse.query.filter_by(donor_id=donor_id)
        .order_by(DonorResponse.created_at.desc(), DonorResponse.id.desc())
        .all()
    )
    response_by_request = {}
    for response in responses:
        response_by_request.setdefault(response.blood_request_id, response)
    rows = (
        db.session.query(BloodRequest, Hospital)
        .outerjoin(Hospital, Hospital.id == BloodRequest.hospital_id)
        .filter(func.lower(BloodRequest.status).in_(OPEN_REQUEST_STATUSES))
        .filter(func.upper(func.trim(BloodRequest.blood_type)) == donor.blood_type.strip().upper())
        .filter(
            func.lower(func.trim(Hospital.location))
            == _normalized_location(donor.location)
        )
        .order_by(BloodRequest.created_at.desc(), BloodRequest.id.desc())
        .all()
    )
    return [
        {
            'id': blood_request.id,
            'hospital_name': hospital.name if hospital else 'Unknown hospital',
            'blood_type': blood_request.blood_type,
            'location': hospital.location if hospital else 'Location not set',
            'quantity': blood_request.quantity,
            'status': blood_request.status,
            'created_at': blood_request.created_at.isoformat() if blood_request.created_at else None,
            'responded': blood_request.id in response_by_request,
            'response_status': (
                response_by_request[blood_request.id].status
                if blood_request.id in response_by_request else None
            ),
        }
        for blood_request, hospital in rows
    ]


def _history_payloads(donor_id):
    history = (
        DonationHistory.query.filter_by(donor_id=donor_id)
        .order_by(DonationHistory.id.desc())
        .all()
    )
    return [item.serialize() for item in history]


def _activity_payloads(donor_id):
    response_rows = (
        db.session.query(DonorResponse, BloodRequest, Hospital)
        .join(BloodRequest, BloodRequest.id == DonorResponse.blood_request_id)
        .outerjoin(Hospital, Hospital.id == BloodRequest.hospital_id)
        .filter(DonorResponse.donor_id == donor_id)
        .order_by(DonorResponse.created_at.desc(), DonorResponse.id.desc())
        .all()
    )
    activities = [
        {
            'id': f'response-{response.id}',
            'type': 'emergency_response',
            'title': 'Emergency Request Response',
            'place': hospital.name if hospital else 'Unknown hospital',
            'date': response.created_at.isoformat() if response.created_at else None,
            'status': response.status,
            'blood_request_id': blood_request.id,
        }
        for response, blood_request, hospital in response_rows
    ]

    for donation in _history_payloads(donor_id):
        activities.append({
            'id': f'donation-{donation["id"]}',
            'type': 'donation',
            'title': 'Blood Donation',
            'place': donation.get('hospital_name') or donation.get('location') or 'Recorded donation',
            'date': donation.get('donation_date'),
            'status': 'completed',
        })

    return sorted(activities, key=lambda item: item.get('date') or '', reverse=True)


@donor_bp.route('/availability', methods=['POST'])
@jwt_required()
def update_availability():
    donor = _current_donor()
    if not donor:
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404
    data = request.get_json(silent=True) or {}
    donor.available = bool(data.get('available'))
    db.session.commit()
    return jsonify({'success': True, 'message': 'Availability updated successfully.'}), 200


@donor_bp.route('/profile/<int:donor_id>', methods=['GET'])
@jwt_required()
def view_profile(donor_id):
    donor = User.query.get(donor_id)
    if not donor or donor.role.upper() != 'DONOR':
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404
    return jsonify({'success': True, 'data': donor.serialize()}), 200


@donor_bp.route('/location', methods=['POST'])
@jwt_required()
def update_location():
    donor = _current_donor()
    if not donor:
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404
    data = request.get_json(silent=True) or {}
    donor.location = data.get('location', donor.location)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Location updated successfully.'}), 200


@donor_bp.route('/donation_history', methods=['GET'])
@jwt_required()
def view_donation_history():
    donor = _current_donor()
    if not donor:
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404
    return jsonify({'success': True, 'data': _history_payloads(donor.id)}), 200


@donor_bp.route('/nearby', methods=['GET'])
@jwt_required()
def view_nearby():
    donor = _current_donor()
    if not donor:
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404

    return jsonify({'success': True, 'data': {
        'profile': donor.serialize(),
        'hospitals': [
            {'id': item.id, 'name': item.name, 'location': item.location}
            for item in Hospital.query.all()
        ],
        'blood_banks': [
            {'id': item.id, 'name': item.name, 'location': item.location}
            for item in BloodBank.query.all()
        ],
        'requests': _request_payloads(donor.id),
    }}), 200


@donor_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def view_dashboard():
    donor = _current_donor()
    if not donor:
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404
    history = _history_payloads(donor.id)
    return jsonify({'success': True, 'data': {
        'profile': donor.serialize(),
        'requests': _request_payloads(donor.id),
        'donation_history': history,
        'statistics': {
            'completed_donations': len(history),
            'lives_saved': len(history),
        },
        'recent_activities': _activity_payloads(donor.id)[:10],
    }}), 200


@donor_bp.route('/response', methods=['POST'])
@jwt_required()
def respond_to_request():
    donor = _current_donor()
    if not donor:
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404
    data = request.get_json(silent=True) or {}
    request_id = data.get('blood_request_id')
    blood_request = BloodRequest.query.get(request_id) if request_id else None
    if not blood_request:
        return jsonify({'success': False, 'message': 'Blood request not found.'}), 404
    if (blood_request.status or '').lower() not in OPEN_REQUEST_STATUSES:
        return jsonify({'success': False, 'message': 'This request is no longer active.'}), 409
    if (donor.blood_type or '').strip().upper() != (blood_request.blood_type or '').strip().upper():
        return jsonify({'success': False, 'message': 'Blood type is not compatible with this request.'}), 409
    hospital = blood_request.hospital
    if not hospital or _normalized_location(donor.location) != _normalized_location(hospital.location):
        return jsonify({'success': False, 'message': 'This request is not in the donor location.'}), 409

    existing = DonorResponse.query.filter_by(
        donor_id=donor.id, blood_request_id=blood_request.id
    ).first()
    if existing:
        if (existing.status or '').lower() == 'pending':
            transition_response(existing, 'completed')
            db.session.commit()
        return jsonify({'success': True, 'message': 'Response already recorded.', 'data': {
            'id': existing.id,
            'status': existing.status,
            'request_status': blood_request.status,
        }}), 200

    response = DonorResponse(
        donor_id=donor.id,
        blood_request_id=blood_request.id,
        status='pending',
        blood_request=blood_request,
    )
    db.session.add(response)
    transition_response(response, 'completed')
    db.session.commit()
    return jsonify({'success': True, 'message': 'Response sent successfully.', 'data': {
        'id': response.id, 'status': response.status,
        'request_status': blood_request.status,
    }}), 201
