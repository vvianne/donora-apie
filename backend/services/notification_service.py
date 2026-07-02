from database import db
from models.notification import Notification
from datetime import datetime

# Function to create a notification
def create_notification(user_id, message):
    new_notification = Notification(user_id=user_id, message=message, created_at=datetime.now().isoformat())
    db.session.add(new_notification)
    db.session.commit()

# Function to get notification history for a user
def get_notification_history(user_id):
    return Notification.query.filter_by(user_id=user_id).all()
