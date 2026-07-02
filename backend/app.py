from dotenv import load_dotenv
load_dotenv()

# from flask import Flask
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database import db
from controllers.auth_controller import auth_bp
from controllers.hospital_controller import hospital_bp
from controllers.blood_bank_controller import blood_bank_bp
from controllers.donor_controller import donor_bp
from controllers.matching_controller import matching_bp
from controllers.transportation_controller import transportation_bp
from controllers.notification_controller import notification_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://user:password@localhost/donora'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:my$q1Nit3sh-@localhost/donora'

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(hospital_bp)
app.register_blueprint(blood_bank_bp)
app.register_blueprint(donor_bp)
app.register_blueprint(matching_bp)
app.register_blueprint(transportation_bp)
app.register_blueprint(notification_bp)

@app.route('/')
def index():
    return {'success': True, 'message': 'Donora API is running. Access /health for health check.'}, 200

@app.route('/health')
def health_check():
    return {'success': True, 'message': 'Server is running.'}, 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)