from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
from database import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(128), nullable=False)
    role = Column(String(20), nullable=False) # 'DONOR', 'HOSPITAL', 'BLOOD_BANK', 'TRANSPORTER', 'ADMIN'
    full_name = Column(String(100), nullable=True)
    phone = Column(String(30), nullable=True)
    blood_type = Column(String(10), nullable=True)
    location = Column(String(255), nullable=True)
    verification_status = Column(String(20), nullable=False, default='verified')
    available = Column(Integer, default=1) # 1=available, 0=not available
    location_lat = db.Column(db.String(50))
    location_lon = db.Column(db.String(50))
    # created_at = Column(DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'full_name': self.full_name or self.username,
            'phone': self.phone,
            'blood_type': self.blood_type,
            'location': self.location,
            'verification_status': self.verification_status,
            'available': self.available,
        }
