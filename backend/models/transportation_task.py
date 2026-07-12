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
    status = Column(String(20), default='pending') # 'pending', 'accepted', 'on_the_way', 'completed'
    notes = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    donor_response = relationship("DonorResponse")
    transporter = relationship("User")

    def serialize(self):
        return {
            'id': self.id,
            'donor_response_id': self.donor_response_id,
            'transporter_id': self.transporter_id,
            'pickup_location': self.pickup_location,
            'dropoff_location': self.dropoff_location,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
