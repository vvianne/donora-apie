from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import db
from models.transportation_task import TransportationTask
from models.user import User

transportation_bp = Blueprint('transportation', __name__)

@transportation_bp.route('/assign', methods=['POST'])
@jwt_required()
def assign_transport():
    data = request.get_json()
    donor_response_id = data.get('donor_response_id')
    transport_id = data.get('transport_id')

    new_task = TransportationTask(donor_response_id=donor_response_id, transport_id=transport_id, status='Assigned')
    db.session.add(new_task)
    db.session.commit()

    return jsonify({'success': True, 'message': 'Transport assigned successfully.'}), 201

@transportation_bp.route('/delivery/<int:task_id>/accept', methods=['POST'])
@jwt_required()
def accept_delivery(task_id):
    task = TransportationTask.query.get(task_id)
    if not task:
        return jsonify({'success': False, 'message': 'Task not found.'}), 404
    task.status = 'Accepted'
    db.session.commit()
    return jsonify({'success': True, 'message': 'Delivery accepted successfully.'}), 200

@transportation_bp.route('/delivery/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_status(task_id):
    data = request.get_json()
    task = TransportationTask.query.get(task_id)
    if not task:
        return jsonify({'success': False, 'message': 'Task not found.'}), 404
    task.status = data.get('status', task.status)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Status updated successfully.'}), 200
