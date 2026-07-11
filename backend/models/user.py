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
    blood_type = Column(String(10), nullable=True)
    available = Column(Integer, default=1) # 1=available, 0=not available
    # location = Column(String(255), nullable=True)
    location_lat = db.Column(db.String(50))
    location_lon = db.Column(db.String(50))
    # created_at = Column(DateTime, default=datetime.utcnow)
