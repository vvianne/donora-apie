from sqlalchemy import Column, Integer, String, ForeignKey
from database import db

class BloodRequest(db.Model):
    __tablename__ = 'blood_requests'
    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey('hospitals.id'), nullable=False)
    blood_type = Column(String(10), nullable=False)
    status = Column(String(20), nullable=False)
