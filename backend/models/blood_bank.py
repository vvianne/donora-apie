from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import db

class BloodBank(db.Model):
    __tablename__ = 'blood_banks'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)

    # Relationships
    blood_inventory = relationship('BloodInventory', backref='blood_bank', lazy=True)
    # blood_requests = relationship('BloodRequest', backref='blood_bank', lazy=True)
