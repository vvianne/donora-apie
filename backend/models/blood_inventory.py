from sqlalchemy import Column, Integer, String, ForeignKey
from database import db

class BloodInventory(db.Model):
    __tablename__ = 'blood_inventory'
    id = Column(Integer, primary_key=True)
    blood_bank_id = Column(Integer, ForeignKey('blood_banks.id'), nullable=False)
    blood_type = Column(String(10), nullable=False)
    quantity = Column(Integer, nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'blood_bank_id': self.blood_bank_id,
            'blood_type': self.blood_type,
            'quantity': self.quantity
        }
