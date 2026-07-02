from sqlalchemy import Column, Integer, String, ForeignKey
from database import db

class DonorResponse(db.Model):
    __tablename__ = 'donor_responses'
    id = Column(Integer, primary_key=True)
    blood_request_id = Column(Integer, ForeignKey('blood_requests.id'), nullable=False)
    donor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), nullable=False)
