from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.user import User
from models.donation_history import DonationHistory
from models.hospital import Hospital
from models.blood_bank import BloodBank
from models.blood_request import BloodRequest

donor_bp = Blueprint('donor', __name__)

@donor_bp.route('/availability', methods=['POST'])
def update_availability():
    data = request.get_json()
    donor_id = data.get('donor_id')
    available = data.get('available')

    donor = User.query.get(donor_id)
    if not donor or donor.role != 'DONOR':
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404

    donor.available = available
    db.session.commit()

    return jsonify({'success': True, 'message': 'Availability updated successfully.'}), 200

@donor_bp.route('/profile/<int:donor_id>', methods=['GET'])
@jwt_required()
def view_profile(donor_id):
    donor = User.query.get(donor_id)
    if not donor or donor.role != 'DONOR':
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404
    return jsonify({'success': True, 'data': donor.serialize()}), 200

@donor_bp.route('/location', methods=['POST'])
def update_location():
    data = request.get_json()
    donor_id = data.get('donor_id')
    location = data.get('location')

    donor = User.query.get(donor_id)
    if not donor or donor.role != 'DONOR':
        return jsonify({'success': False, 'message': 'Donor not found.'}), 404

    donor.location = location
    db.session.commit()

    return jsonify({'success': True, 'message': 'Location updated successfully.'}), 200

@donor_bp.route('/donation_history', methods=['GET'])
@jwt_required()
def view_donation_history():
    user_id = int(get_jwt_identity())
    history = DonationHistory.query.filter_by(donor_id=user_id).all()
    return jsonify({'success': True, 'data': [h.serialize() for h in history]}), 200

@donor_bp.route('/nearby', methods=['GET'])
@jwt_required()
def view_nearby():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'success': False, 'message': 'User not found.'}), 404

    hospitals = Hospital.query.all()
    blood_banks = BloodBank.query.all()
    requests = BloodRequest.query.filter_by(status='Pending').all()

    nearby_requests = []
    for request_item in requests:
        hospital = Hospital.query.get(request_item.hospital_id)
        nearby_requests.append({
            'id': request_item.id,
            'hospital_name': hospital.name if hospital else 'Unknown hospital',
            'blood_type': request_item.blood_type,
            'location': hospital.location if hospital else (user.location or 'Location not set'),
            'quantity': request_item.quantity,
            'status': request_item.status,
        })

    return jsonify({
        'success': True,
        'data': {
            'profile': user.serialize(),
            'hospitals': [
                {'id': hospital.id, 'name': hospital.name, 'location': hospital.location}
                for hospital in hospitals
            ],
            'blood_banks': [
                {'id': blood_bank.id, 'name': blood_bank.name, 'location': blood_bank.location}
                for blood_bank in blood_banks
            ],
            'requests': nearby_requests,
        }
    }), 200
