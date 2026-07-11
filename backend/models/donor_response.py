from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import db
from datetime import datetime

class DonorResponse(db.Model):
    __tablename__ = 'donor_responses'
    id = Column(Integer, primary_key=True)
    blood_request_id = Column(Integer, ForeignKey('blood_requests.id'), nullable=False)
    donor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='accepted') # 'accepted', 'completed', 'transporting', 'cancelled'
    created_at = Column(DateTime, default=datetime.utcnow)

    blood_request = relationship("BloodRequest")
    donor = relationship("User")
