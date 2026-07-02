from sqlalchemy import Column, Integer, String, ForeignKey
from database import db

class DonationHistory(db.Model):
    __tablename__ = 'donation_history'
    id = Column(Integer, primary_key=True)
    donor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    donation_date = Column(String(20), nullable=False)
    blood_type = Column(String(10), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'donor_id': self.donor_id,
            'donation_date': self.donation_date,
            'blood_type': self.blood_type
        }
