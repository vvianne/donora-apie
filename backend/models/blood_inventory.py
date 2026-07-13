from sqlalchemy import CheckConstraint, Column, Integer, String, ForeignKey
from database import db

class BloodInventory(db.Model):
    __tablename__ = 'blood_inventory'
    __table_args__ = (
        CheckConstraint(
            '(hospital_id IS NOT NULL AND blood_bank_id IS NULL) OR '
            '(hospital_id IS NULL AND blood_bank_id IS NOT NULL)',
            name='ck_blood_inventory_exactly_one_owner',
        ),
    )

    id = Column(Integer, primary_key=True)
    hospital_id = Column(Integer, ForeignKey('hospitals.id'), nullable=True)
    blood_bank_id = Column(Integer, ForeignKey('blood_banks.id'), nullable=True)
    blood_type = Column(String(10), nullable=False)
    quantity = Column(Integer, nullable=False)

    def serialize(self):
        owner_type = 'hospital' if self.hospital_id is not None else 'blood_bank'
        facility = self.hospital if owner_type == 'hospital' else self.blood_bank
        return {
            'id': self.id,
            'hospital_id': self.hospital_id,
            'blood_bank_id': self.blood_bank_id,
            'blood_type': self.blood_type,
            'quantity': self.quantity,
            'owner_type': owner_type,
            'facility_name': facility.name if facility else None,
            'location': facility.location if facility else None,
        }
