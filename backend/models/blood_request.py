from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import db
from datetime import datetime

class BloodRequest(db.Model):
    __tablename__ = 'blood_requests'
    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey('hospitals.id'), nullable=False)
    blood_type = Column(String(10), nullable=False)
    quantity = Column(Integer, nullable=False)
    status = Column(String(20), default='pending') # 'pending', 'fulfilled', 'cancelled'
    created_at = Column(DateTime, default=datetime.utcnow)