from flask_sqlalchemy import SQLAlchemy
from .user import User
from .hospital import Hospital
from .blood_bank import BloodBank
from .blood_inventory import BloodInventory
from .blood_request import BloodRequest
from .donor_response import DonorResponse
from .transportation_task import TransportationTask
from .donation_history import DonationHistory
from .notification import Notification

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
