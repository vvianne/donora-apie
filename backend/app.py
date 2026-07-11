from dotenv import load_dotenv
load_dotenv()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db

# Import blueprints
from controllers.auth_controller import auth_bp
from controllers.hospital_controller import hospital_bp
from controllers.blood_bank_controller import blood_bank_bp
from controllers.donor_controller import donor_bp
from controllers.matching_controller import matching_bp
from controllers.transportation_controller import transportation_bp
from controllers.notification_controller import notification_bp

from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(hospital_bp, url_prefix='/hospital')
    app.register_blueprint(blood_bank_bp, url_prefix='/blood_bank')
    app.register_blueprint(donor_bp, url_prefix='/donor')
    app.register_blueprint(matching_bp, url_prefix='/matching')
    app.register_blueprint(transportation_bp, url_prefix='/transportation')
    app.register_blueprint(notification_bp, url_prefix='/notification')

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)