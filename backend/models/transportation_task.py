from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import db
from datetime import datetime

class TransportationTask(db.Model):
    __tablename__ = 'transportation_tasks'
    id = Column(Integer, primary_key=True)
    donor_response_id = Column(Integer, ForeignKey('donor_responses.id'), nullable=False)
    transporter_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    pickup_location = Column(String(255), nullable=False)
    dropoff_location = Column(String(255), nullable=False)
    status = Column(String(20), default='assigned') # 'assigned', 'in_transit', 'completed', 'cancelled'
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    donor_response = relationship("DonorResponse")
    transporter = relationship("User")
