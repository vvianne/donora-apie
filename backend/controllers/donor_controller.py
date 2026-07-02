from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.user import User
from models.donation_history import DonationHistory

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

@donor_bp.route('/donation_history/<int:donor_id>', methods=['GET'])
@jwt_required()
def view_donation_history(donor_id):
    history = DonationHistory.query.filter_by(donor_id=donor_id).all()
    return jsonify({'success': True, 'data': [h.serialize() for h in history]}), 200
