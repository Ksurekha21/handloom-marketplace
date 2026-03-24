from db_config import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(50), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.Text)
    id_proof_path = db.Column(db.String(500), nullable=True)
    weaver_material = db.Column(db.String(100), nullable=True)
    weaver_saree_type = db.Column(db.String(100), nullable=True)
    years_experience = db.Column(db.Integer, nullable=True)
    
class Saree(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    weaver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    
    # 🎨 Detailed Fields for Buyer Flow
    color = db.Column(db.String(50), nullable=True)
    days_to_weave = db.Column(db.Integer, nullable=True)
    raw_material_cost = db.Column(db.Float, nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    weaver = db.relationship('User', backref=db.backref('sarees', lazy=True))

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    saree_id = db.Column(db.Integer, db.ForeignKey('saree.id'), nullable=False)
    status = db.Column(db.String(50), default="Pending") 
    # Pending, Accepted, InProgress, Shipped, Delivered
    payment_method = db.Column(db.String(50), nullable=False) # COD, PhonePe, GPay
    estimated_delivery = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    saree = db.relationship('Saree', backref=db.backref('orders', lazy=True))
    buyer = db.relationship('User', backref=db.backref('orders', lazy=True))

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    saree_id = db.Column(db.Integer, db.ForeignKey('saree.id'), nullable=False)
    buyer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1-5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RawMaterial(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    material_type = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False, default="Fabric") # Tool, Fabric
    quantity = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    supplier = db.relationship('User', backref=db.backref('raw_materials', lazy=True))

class MaterialOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    weaver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    material_id = db.Column(db.Integer, db.ForeignKey('raw_material.id'), nullable=False)
    quantity = db.Column(db.String(50), nullable=True) # e.g. "50 kg"
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="Pending") # Pending, Accepted, Shipped, Delivered
    payment_method = db.Column(db.String(50), nullable=False) # COD, PhonePe, GPay
    address = db.Column(db.Text, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    estimated_delivery = db.Column(db.String(100), nullable=True) # e.g. "2024-03-25"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    material = db.relationship('RawMaterial', backref=db.backref('orders', lazy=True))
    weaver = db.relationship('User', backref=db.backref('raw_material_orders', lazy=True))
