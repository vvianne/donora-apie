import os
import sys

# Add parent directory to path so we can import app and database
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database import db
from models.user import User
from models.hospital import Hospital
from models.blood_bank import BloodBank
from werkzeug.security import generate_password_hash
import random

def seed_data():
    with app.app_context():
        # Drop all tables and recreate them to ensure a fresh schema
        db.drop_all()
        db.create_all()
        
        # Generate donors
        pwd = generate_password_hash('password123')
        for i in range(1, 6):
            donor = User(username=f'donor{i}', password_hash=pwd, role='DONOR')
            db.session.add(donor)

        # Generate hospitals
        for i in range(1, 4):
            hospital_user = User(username=f'hospital{i}', password_hash=pwd, role='HOSPITAL')
            db.session.add(hospital_user)
            hospital = Hospital(name=f'Hospital{i}', location=f'Location{i}')
            db.session.add(hospital)

        # Generate blood banks
        for i in range(1, 4):
            bb_user = User(username=f'bloodbank{i}', password_hash=pwd, role='BLOOD_BANK')
            db.session.add(bb_user)
            blood_bank = BloodBank(name=f'BloodBank{i}', location=f'Location{i}')
            db.session.add(blood_bank)

        # Generate transportation services
        for i in range(1, 4):
            transport = User(username=f'transporter{i}', password_hash=pwd, role='transportation')
            db.session.add(transport)

        db.session.commit()
        print("Database seeded successfully.")

if __name__ == '__main__':
    seed_data()
