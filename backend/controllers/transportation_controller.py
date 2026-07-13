from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import db
from models.transportation_task import TransportationTask
from models.donor_response import DonorResponse
from models.user import User
from models.hospital import Hospital
from services.blood_request_workflow import transition_response

transportation_bp = Blueprint('transportation', __name__)

@transportation_bp.route('/assign', methods=['POST'])
@jwt_required()
def assign_transport():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Restrict assignment to admin or hospital users
    if not user or user.role not in ['admin', 'hospital', 'blood_bank']:
        return jsonify({'message': 'Unauthorized. Only admin, hospital, or blood bank can assign tasks'}), 403
    
    data = request.get_json()
    donor_response_id = data.get('donor_response_id')
    transporter_id = data.get('transporter_id')
    pickup_location = data.get('pickup_location')
    dropoff_location = data.get('dropoff_location')

    if not all([donor_response_id, transporter_id, pickup_location, dropoff_location]):
        return jsonify({'message': 'Missing required fields'}), 400

    # Verify transporter
    transporter = User.query.get(transporter_id)
    if not transporter or transporter.role.lower() not in ('transporter', 'transportation'):
        return jsonify({'message': 'Invalid transporter'}), 400

    # Verify donor response
    donor_response = DonorResponse.query.get(donor_response_id)
    if not donor_response:
        return jsonify({'message': 'Invalid donor response'}), 400

    new_task = TransportationTask(
        donor_response_id=donor_response_id,
        transporter_id=transporter_id,
        pickup_location=pickup_location,
        dropoff_location=dropoff_location,
        status='pending'
    )
    
    # Update donor response status
    transition_response(donor_response, 'transporting')

    db.session.add(new_task)
    db.session.commit()

    return jsonify({'message': 'Transportation task assigned successfully', 'task_id': new_task.id}), 201

@transportation_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_all_tasks():
    tasks = TransportationTask.query.all()
    result = []
    for t in tasks:
        result.append({
            'id': t.id,
            'donor_response_id': t.donor_response_id,
            'transporter_id': t.transporter_id,
            'pickup_location': t.pickup_location,
            'dropoff_location': t.dropoff_location,
            'status': t.status,
            'notes': t.notes,
            'created_at': t.created_at.isoformat() if t.created_at else None
        })
    return jsonify({'tasks': result}), 200

@transportation_bp.route('/my-tasks', methods=['GET'])
@jwt_required()
def get_my_tasks():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role.lower() not in ('transporter', 'transportation'):
        return jsonify({'message': 'Unauthorized. Must be a transporter'}), 403

    tasks = TransportationTask.query.filter_by(transporter_id=user_id).all()
    result = []
    for t in tasks:
        # Get related data for each task
        donor_response = DonorResponse.query.get(t.donor_response_id)
        blood_request = None
        hospital = None
        blood_type = None
        units_required = None
        priority = None
        
        if donor_response:
            blood_request = donor_response.blood_request
            if blood_request:
                blood_type = blood_request.blood_type
                units_required = blood_request.quantity
                priority = blood_request.priority
                hospital = Hospital.query.get(blood_request.hospital_id)
        
        result.append({
            'id': t.id,
            'donor_response_id': t.donor_response_id,
            'pickup_location': t.pickup_location,
            'dropoff_location': t.dropoff_location,
            'status': t.status,
            'notes': t.notes,
            'created_at': t.created_at.isoformat() if t.created_at else None,
            'hospital_name': hospital.name if hospital else 'Unknown',
            'blood_request_id': blood_request.id if blood_request else None,
            'blood_type': blood_type,
            'units_required': units_required,
            'priority': priority
        })
    return jsonify({'tasks': result}), 200

@transportation_bp.route('/tasks/<int:task_id>/status', methods=['PATCH'])
@jwt_required()
def update_task_status(task_id):
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.role.lower() not in ('transporter', 'transportation'):
        return jsonify({'message': 'Unauthorized. Must be a transporter'}), 403

    data = request.get_json()
    new_status = data.get('status')
    notes = data.get('notes')

    if not new_status or new_status not in ['pending', 'accepted', 'on_the_way', 'completed']:
        return jsonify({'message': 'Invalid status'}), 400

    task = TransportationTask.query.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if str(task.transporter_id) != str(user_id):
        return jsonify({'message': 'Forbidden. Not your task'}), 403

    task.status = new_status
    if notes:
        task.notes = notes

    if new_status == 'completed':
        donor_response = DonorResponse.query.get(task.donor_response_id)
        if donor_response:
            transition_response(donor_response, 'completed')
    elif new_status == 'cancelled':
        donor_response = DonorResponse.query.get(task.donor_response_id)
        if donor_response:
            transition_response(donor_response, 'cancelled')

    db.session.commit()

    return jsonify({'message': f'Task status updated to {new_status}'}), 200

@transportation_bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    task = TransportationTask.query.get(task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404
    
    # Get related data
    donor_response = DonorResponse.query.get(task.donor_response_id)
    blood_request = None
    hospital = None
    blood_type = None
    units_required = None
    priority = None
    
    if donor_response:
        blood_request = donor_response.blood_request
        if blood_request:
            blood_type = blood_request.blood_type
            units_required = blood_request.quantity
            priority = blood_request.priority
            hospital = Hospital.query.get(blood_request.hospital_id)
    
    result = {
        'id': task.id,
        'donor_response_id': task.donor_response_id,
        'transporter_id': task.transporter_id,
        'pickup_location': task.pickup_location,
        'dropoff_location': task.dropoff_location,
        'status': task.status,
        'notes': task.notes,
        'created_at': task.created_at.isoformat() if task.created_at else None,
        'hospital_name': hospital.name if hospital else 'Unknown',
        'blood_request_id': blood_request.id if blood_request else None,
        'blood_type': blood_type,
        'units_required': units_required,
        'priority': priority
    }
    return jsonify(result), 200
