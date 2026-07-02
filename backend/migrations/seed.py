from models import db, User, Hospital, BloodBank, BloodInventory, BloodRequest, DonorResponse, TransportationTask, DonationHistory, Notification
import random

# Seed script to generate initial data

def seed_data():
    # Generate donors
    for _ in range(20):
        donor = User(username=f'donor{_}', password_hash='hashed_password', role='DONOR')
        db.session.add(donor)

    # Generate hospitals
    for _ in range(3):
        hospital = Hospital(name=f'Hospital{_}', location=f'Location{_}')
        db.session.add(hospital)

    # Generate blood banks
    for _ in range(5):
        blood_bank = BloodBank(name=f'BloodBank{_}', location=f'Location{_}')
        db.session.add(blood_bank)

    # Generate transportation services
    for _ in range(5):
        transport = User(username=f'transport{_}', password_hash='hashed_password', role='TRANSPORT')
        db.session.add(transport)

    db.session.commit()

if __name__ == '__main__':
    seed_data()
