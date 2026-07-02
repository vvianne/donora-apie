from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import db

class User(db.Model):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(20), nullable=False)
    blood_type = Column(String(10), nullable=True)
    available = Column(Integer, nullable=True)
    location_lat = Column(String(50), nullable=True)
    location_lon = Column(String(50), nullable=True)

    # Relationships
    # blood_requests = relationship('BloodRequest', backref='user', lazy=True)
    donor_responses = relationship('DonorResponse', backref='user', lazy=True)
    transportation_tasks = relationship('TransportationTask', backref='user', lazy=True)
    donation_history = relationship('DonationHistory', backref='user', lazy=True)
    notifications = relationship('Notification', backref='user', lazy=True)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'blood_type': self.blood_type,
            'available': self.available,
            'location_lat': self.location_lat,
            'location_lon': self.location_lon
        }
