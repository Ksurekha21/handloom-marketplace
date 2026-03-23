from flask import Blueprint, request, jsonify
from db_config import db
from models import User
from werkzeug.security import generate_password_hash, check_password_hash


import os
from werkzeug.utils import secure_filename

auth_bp = Blueprint('auth', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@auth_bp.route('/register', methods=['POST'])
def register():
    # Switch to request.form for multi-part (file upload) support
    # or handle both JSON and Form data for flexibility
    if request.is_json:
        data = request.json
    else:
        data = request.form

    email = data.get('email')
    
    # 1. 🛑 CHECK IF EMAIL EXISTS
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered. Please login."}), 400

    # 2. 📂 HANDLE FILE UPLOAD (ID Proof)
    id_proof_path = None
    if 'idProof' in request.files:
        file = request.files['idProof']
        if file.filename != '':
            filename = secure_filename(f"{email}_{file.filename}")
            id_proof_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(id_proof_path)

    try:
        user = User(
            name=data.get('name'),
            role=data.get('role'),
            state=data.get('state'),
            email=email,
            password=generate_password_hash(data.get('password')),
            id_proof_path=id_proof_path,
            weaver_material=data.get('weaver_material'),
            weaver_saree_type=data.get('weaver_saree_type'),
            years_experience=data.get('years_experience')
        )
        db.session.add(user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"ERROR in /register: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

    return jsonify({
        "message": "Registered successfully",
        "role": user.role,
        "name": user.name,
        "id": user.id,
        "email": user.email,
        "weaver_material": user.weaver_material,
        "weaver_saree_type": user.weaver_saree_type,
        "years_experience": user.years_experience
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    user = User.query.filter_by(email=data['email']).first()

    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"error": "Invalid credentials"}), 401

    return jsonify({
        "message": "Login successful",
        "role": user.role,
        "name": user.name,
        "id": user.id,
        "email": user.email,
        "weaver_material": user.weaver_material,
        "weaver_saree_type": user.weaver_saree_type,
        "years_experience": user.years_experience
    })
