from flask import Blueprint, request, jsonify
from services.matching_service import rank_donors
from models.blood_request import BloodRequest

matching_bp = Blueprint('matching', __name__)

@matching_bp.route('/match', methods=['POST'])
def match_donors():
    data = request.get_json()
    blood_request_id = data.get('blood_request_id')
    blood_request = BloodRequest.query.get(blood_request_id)

    if not blood_request:
        return jsonify({'success': False, 'message': 'Blood request not found.'}), 404

    ranked_donors = rank_donors(blood_request)
    return jsonify({'success': True, 'data': ranked_donors}), 200
