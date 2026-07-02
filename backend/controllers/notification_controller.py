from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.notification_service import create_notification, get_notification_history

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/notify', methods=['POST'])
@jwt_required()
def notify_user():
    data = request.get_json()
    user_id = data.get('user_id')
    message = data.get('message')

    create_notification(user_id, message)
    return jsonify({'success': True, 'message': 'Notification created successfully.'}), 201

@notification_bp.route('/history/<int:user_id>', methods=['GET'])
@jwt_required()
def notification_history(user_id):
    history = get_notification_history(user_id)
    return jsonify({'success': True, 'data': [h.serialize() for h in history]}), 200
