from sqlalchemy import Column, Integer, String, ForeignKey
from database import db

class Notification(db.Model):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message = Column(String(255), nullable=False)
    created_at = Column(String(20), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'message': self.message,
            'created_at': self.created_at
        }
