from sqlalchemy import Column, Integer, String, ForeignKey
from database import db

class TransportationTask(db.Model):
    __tablename__ = 'transportation_tasks'
    id = Column(Integer, primary_key=True)
    donor_response_id = Column(Integer, ForeignKey('donor_responses.id'), nullable=False)
    transport_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String(20), nullable=False)
