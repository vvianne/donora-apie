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
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta
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
        if role in ["hospital", "blood_bank"]:
            if not name or not location:
                return jsonify({
                    "success": False,
                    "message": "Name and location are required."
                }), 400
        return jsonify({
            "success": False,
            "message": "Invalid role."
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
        role=role,
        full_name=name or username,
        location=location or None,
        verification_status='verified'
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
        identity=str(user.id),
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


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    return jsonify({"success": True, "data": user.serialize()}), 200


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    data = request.get_json(silent=True) or {}

    old_full_name = user.full_name
    old_phone = user.phone
    old_blood_type = user.blood_type
    old_location = user.location

    if "full_name" in data and data.get("full_name") is not None:
        user.full_name = data.get("full_name", "").strip() or user.full_name

    if "phone" in data and data.get("phone") is not None:
        user.phone = data.get("phone", "").strip() or None

    if "blood_type" in data and data.get("blood_type") is not None:
        user.blood_type = data.get("blood_type", "").strip().upper() or None

    if "location" in data and data.get("location") is not None:
        user.location = data.get("location", "").strip() or None

    changed_fields = []
    if "full_name" in data and data.get("full_name") is not None and data.get("full_name", "").strip() != (old_full_name or ""):
        changed_fields.append("full_name")
    if "phone" in data and data.get("phone") is not None and data.get("phone", "").strip() != (old_phone or ""):
        changed_fields.append("phone")
    if "blood_type" in data and data.get("blood_type") is not None and data.get("blood_type", "").strip().upper() != (old_blood_type or ""):
        changed_fields.append("blood_type")
    if "location" in data and data.get("location") is not None and data.get("location", "").strip() != (old_location or ""):
        changed_fields.append("location")

    if changed_fields:
        user.verification_status = 'pending'

    db.session.commit()

    return jsonify({"success": True, "message": "Profile updated successfully.", "data": user.serialize()}), 200