from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import db

class Hospital(db.Model):
    __tablename__ = 'hospitals'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)

    # Relationships
    blood_requests = relationship('BloodRequest', backref='hospital', lazy=True)
