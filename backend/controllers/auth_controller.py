# from flask import Blueprint, request, jsonify
# from werkzeug.security import generate_password_hash, check_password_hash
# from flask_jwt_extended import create_access_token
# from database import db
# from models.user import User

# auth_bp = Blueprint('auth', __name__)

# @auth_bp.route('/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')
#     role = data.get('role')

#     if User.query.filter_by(username=username).first():
#         return jsonify({'success': False, 'message': 'User already exists.'}), 400

#     hashed_password = generate_password_hash(password)
#     new_user = User(username=username, password_hash=hashed_password, role=role)
#     db.session.add(new_user)
#     db.session.commit()

#     return jsonify({'success': True, 'message': 'User registered successfully.'}), 201

# @auth_bp.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     username = data.get('username')
#     password = data.get('password')

#     user = User.query.filter_by(username=username).first()

#     if not user or not check_password_hash(user.password_hash, password):
#         return jsonify({'success': False, 'message': 'Invalid credentials.'}), 401

#     # access_token = create_access_token(identity={'username': user.username, 'role': user.role})
#     access_token = create_access_token(identity=user.username, additional_claims={"role": user.role})
#     return jsonify({'success': True, 'access_token': access_token}), 200

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from datetime import datetime, timedelta
from database import db
from models.user import User
from models.hospital import Hospital
from models.blood_bank import BloodBank

auth_bp = Blueprint('auth', __name__)

JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

ALLOWED_ROLES = [
    "donor",
    "hospital",
    "blood_bank",
    "transportation"
]

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    username = data.get('username', '').strip()
    password = data.get('password', '')
    role = data.get('role', '')
    name = data.get("name", "").strip()
    location = data.get("location", "").strip()

    if not username or not password or not role:
        return jsonify({
            "success": False,
            "message": "All fields are required."
        }), 400

    if role not in ALLOWED_ROLES:
        return jsonify({
            "success": False,
            "message": "Invalid role."
        }), 400

    if role in ["hospital", "blood_bank"]:
        if not name or not location:
            return jsonify({
                "success": False,
                "message": "Name and location are required."
            }), 400
    
    

    if User.query.filter_by(username=username).first():
        return jsonify({
            "success": False,
            "message": "Username already exists."
        }), 400

    hashed_password = generate_password_hash(password)

    new_user = User(
        username=username,
        password_hash=hashed_password,
        role=role
    )

    db.session.add(new_user)
    db.session.commit()

    if role == "hospital":
        hospital = Hospital(
            name=name,
            location=location
        )
        db.session.add(hospital)

    elif role == "blood_bank":
        blood_bank = BloodBank(
            name=name,
            location=location
        )
        db.session.add(blood_bank)

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Registration successful."
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username', '').strip()
    password = data.get('password', '')

    user = User.query.filter_by(username=username).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({
            "success": False,
            "message": "Invalid username or password."
        }), 401

    access_token = create_access_token(
        identity=user.username,
        additional_claims={
            "role": user.role
        }
    )

    return jsonify({
        "success": True,
        "access_token": access_token,
        "username": user.username,
        "role": user.role
    }), 200