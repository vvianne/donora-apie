from sqlalchemy import Column, Integer, String, ForeignKey
from database import db

class DonationHistory(db.Model):
    __tablename__ = 'donation_history'
    id = Column(Integer, primary_key=True)
    donor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    request_id = Column(Integer, ForeignKey('blood_requests.id'), nullable=True, unique=True)
    hospital_id = Column(Integer, ForeignKey('hospitals.id'), nullable=True)
    donation_date = Column(String(20), nullable=False)
    blood_type = Column(String(10), nullable=False)
    status = Column(String(20), nullable=False, default='completed')
    location = Column(String(200), nullable=True)

    def serialize(self):
        hospital = self.hospital if self.hospital_id else None
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'request_id': self.request_id,
            'hospital_id': self.hospital_id,
            'hospital_name': hospital.name if hospital else None,
            'donation_date': self.donation_date,
            'blood_type': self.blood_type,
            'status': self.status,
            'location': self.location or (hospital.location if hospital else None),
        }

    hospital = db.relationship('Hospital')
