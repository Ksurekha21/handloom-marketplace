import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from db_config import db
from models import RawMaterial, MaterialOrder
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
load_dotenv()  # Load .env file if present
import cloudinary
import cloudinary.uploader

CLOUDINARY_ENABLED = bool(
    os.getenv("CLOUD_NAME") and os.getenv("API_KEY") and os.getenv("API_SECRET")
)
if CLOUDINARY_ENABLED:
    cloudinary.config(
        cloud_name=os.getenv("CLOUD_NAME"),
        api_key=os.getenv("API_KEY"),
        api_secret=os.getenv("API_SECRET"),
        secure=True
    )

supplier_bp = Blueprint('supplier', __name__)

@supplier_bp.route('/material-orders/<int:supplier_id>', methods=['GET'])
def get_material_orders(supplier_id):
    try:
        # Get all materials owned by this supplier
        my_materials = RawMaterial.query.filter_by(supplier_id=supplier_id).all()
        material_ids = [m.id for m in my_materials]
        
        # Get orders for those materials
        orders = MaterialOrder.query.filter(MaterialOrder.material_id.in_(material_ids)).order_by(MaterialOrder.created_at.desc()).all()
        
        results = []
        for o in orders:
            results.append({
                "id": o.id,
                "material_name": o.material.material_type,
                "weaver_name": o.weaver.name,
                "quantity": o.quantity,
                "total_price": o.total_price,
                "status": o.status,
                "payment_method": o.payment_method,
                "address": o.address,
                "phone": o.phone,
                "estimated_delivery": o.estimated_delivery,
                "created_at": o.created_at.isoformat()
            })
        return jsonify({"orders": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@supplier_bp.route('/material-order/<int:order_id>/status', methods=['PATCH'])
def update_order_status(order_id):
    data = request.json
    try:
        order = MaterialOrder.query.get(order_id)
        if not order:
            return jsonify({"error": "Order not found"}), 404
        
        if 'status' in data:
            order.status = data['status']
        if 'estimated_delivery' in data:
            order.estimated_delivery = data['estimated_delivery']
            
        db.session.commit()
        return jsonify({"message": f"Order status updated to {order.status}"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

UPLOAD_FOLDER = 'uploads'

@supplier_bp.route('/material', methods=['POST'])
def add_material():
    try:
        image_url = None

        # Handle image upload — Cloudinary if configured, else local storage
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename != '':
                if CLOUDINARY_ENABLED:
                    result = cloudinary.uploader.upload(file)
                    image_url = result["secure_url"]
                else:
                    # Fallback: save locally and return full URL
                    filename = secure_filename(file.filename)
                    upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
                    os.makedirs(upload_folder, exist_ok=True)
                    save_path = os.path.join(upload_folder, filename)
                    file.save(save_path)
                    # Build full URL so frontend can load it from the correct port
                    host = request.host_url.rstrip('/')
                    image_url = f"{host}/uploads/{filename}"

        material = RawMaterial(
            supplier_id=request.form['supplier_id'],
            material_type=request.form['material_type'],
            category=request.form['category'],
            quantity=request.form['quantity'],
            price=request.form['price'],
            image_url=image_url
        )
        db.session.add(material)
        db.session.commit()

        return jsonify({"message": "Material added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@supplier_bp.route('/materials', methods=['GET'])
def get_materials():
    materials = RawMaterial.query.all()
    results = []
    for m in materials:
        # Fix legacy relative image paths stored before the full-URL fix
        img = m.image_url
        if img and img.startswith('/uploads/'):
            img = f"http://localhost:5000{img}"
        results.append({
            "id": m.id,
            "supplier_id": m.supplier_id,
            "type": m.material_type,
            "category": m.category,
            "price": m.price,
            "quantity": m.quantity,
            "image_url": img,
            "created_at": m.created_at.isoformat() if m.created_at else None
        })
    return jsonify({"materials": results}), 200
