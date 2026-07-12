import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database import db
from flask_jwt_extended import create_access_token
from models.user import User
from models.donor_response import DonorResponse
from models.blood_request import BloodRequest

def run_tests():
    with app.app_context():
        # Setup some prerequisite data
        hospital = User.query.filter_by(role='HOSPITAL').first()
        if not hospital:
            hospital = User(username='test_hospital', password_hash='hash', role='HOSPITAL')
            db.session.add(hospital)
            db.session.commit()
            
        br = BloodRequest(hospital_id=1, blood_type='O+', quantity=1)
        db.session.add(br)
        db.session.commit()
        
        donor = User.query.filter_by(role='DONOR').first()
        dr = DonorResponse(blood_request_id=br.id, donor_id=donor.id, status='approved')
        db.session.add(dr)
        db.session.commit()

        transporter = User.query.filter_by(role='TRANSPORTER').first()

        dr_id = dr.id
        transporter_id = transporter.id
        access_token = create_access_token(identity=str(transporter.id))

    client = app.test_client()
    
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    print("--- Testing API Endpoints ---")

    # Test 1: Assign transport
    data = {
        'donor_response_id': dr_id,
        'transporter_id': transporter_id,
        'pickup_location': 'Donor Location',
        'dropoff_location': 'Hospital Location'
    }
    
    resp = client.post('/transportation/assign', json=data, headers=headers)
    print("1. Assign task response:", resp.status_code, resp.json)

    if resp.status_code == 201:
        task_id = resp.json.get('task_id')

        # Test 2: Get all tasks
        resp = client.get('/transportation/tasks', headers=headers)
        print("2. Get tasks response:", resp.status_code, resp.json)

        # Test 3: Get my tasks
        resp = client.get('/transportation/my-tasks', headers=headers)
        print("3. Get my tasks response:", resp.status_code, resp.json)

        # Test 4: Update task status
        resp = client.patch(f'/transportation/tasks/{task_id}/status', json={'status': 'in_transit'}, headers=headers)
        print("4. Update task response:", resp.status_code, resp.json)
        
        # Test 5: Get task by ID
        resp = client.get(f'/transportation/tasks/{task_id}', headers=headers)
        print("5. Get task response:", resp.status_code, resp.json)

if __name__ == '__main__':
    run_tests()
