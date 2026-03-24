from flask import Blueprint, request, jsonify
from db_config import db
from models import Saree, RawMaterial, User, MaterialOrder, Order


weaver_bp = Blueprint('weaver', __name__)

@weaver_bp.route('/order-material', methods=['POST'])
def place_material_order():
    data = request.json
    try:
        order = MaterialOrder(
            weaver_id=data['weaver_id'],
            material_id=data['material_id'],
            quantity=data.get('quantity'),
            total_price=float(data['total_price']),
            payment_method=data['payment_method'],
            address=data['address'],
            phone=data['phone']
        )
        db.session.add(order)
        db.session.commit()
        return jsonify({"message": "Order placed successfully", "id": order.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@weaver_bp.route('/resources', methods=['GET'])
def get_resources():
    # Creative Hub: Get all materials and tools for weavers
    materials = RawMaterial.query.all()
    results = [{
        "id": m.id,
        "type": m.material_type,
        "category": m.category,
        "price": m.price,
        "quantity": m.quantity,
        "description": m.description,
        "image_url": m.image_url,
        "supplier_name": m.supplier.name if m.supplier else "Verified Supplier"
    } for m in materials]
    return jsonify({"resources": results}), 200

@weaver_bp.route('/product', methods=['POST'])
def add_product():
    data = request.json
    saree = Saree(
        weaver_id=data['weaver_id'],
        title=data['title'],
        category=data.get('category', 'Saree'),
        price=data['price'],
        description=data.get('description', ''),
        image_url=data.get('image_url', ''),
        color=data.get('color'),
        days_to_weave=data.get('days_to_weave'),
        raw_material_cost=data.get('raw_material_cost')
    )
    db.session.add(saree)
    db.session.commit()
    return jsonify({"message": "Product added successfully", "id": saree.id}), 201

@weaver_bp.route('/products/<int:weaver_id>', methods=['GET'])
def get_products(weaver_id):
    sarees = Saree.query.filter_by(weaver_id=weaver_id).all()
    products = [{
        "id": s.id, "title": s.title, "price": s.price, 
        "category": s.category, "description": s.description,
        "image_url": s.image_url,
        "color": s.color,
        "days_to_weave": s.days_to_weave,
        "raw_material_cost": s.raw_material_cost
    } for s in sarees]
    return jsonify({"products": products}), 200

@weaver_bp.route('/material-orders/<int:weaver_id>', methods=['GET'])
def get_my_material_orders(weaver_id):
    try:
        orders = MaterialOrder.query.filter_by(weaver_id=weaver_id).order_by(MaterialOrder.created_at.desc()).all()
        results = []
        for o in orders:
            results.append({
                "id": o.id,
                "material_name": o.material.material_type,
                "supplier_name": o.material.supplier.name if o.material.supplier else "Verified Supplier",
                "quantity": o.quantity,
                "total_price": o.total_price,
                "status": o.status,
                "address": o.address,
                "estimated_delivery": o.estimated_delivery,
                "created_at": o.created_at.isoformat()
            })
        return jsonify({"orders": results}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@weaver_bp.route('/buyer-orders/<int:weaver_id>', methods=['GET'])
def get_buyer_orders(weaver_id):

    orders = db.session.query(Order,Saree,User)\
    .join(Saree,Order.saree_id==Saree.id)\
    .join(User,Order.buyer_id==User.id)\
    .filter(Saree.weaver_id==weaver_id)\
    .all()

    results=[]

    for order,saree,buyer in orders:

        results.append({

        "id":order.id,
        "saree_title":saree.title,
        "price":saree.price,
        "buyer_name":buyer.name,
        "status":order.status,
        "date":order.created_at.isoformat()

        })

    return jsonify({"orders":results})
@weaver_bp.route('/accept-order/<int:order_id>',methods=['POST'])
def accept_order(order_id):

    order=Order.query.get(order_id)

    if not order:
        return jsonify({"error":"Order not found"}),404

    order.status="Accepted"

    db.session.commit()

    return jsonify({"message":"Order accepted"})

@weaver_bp.route('/update-buyer-order-status/<int:order_id>',methods=['POST'])

def update_buyer_order_status(order_id):

    data=request.json

    order=Order.query.get(order_id)

    order.status=data['status']

    if 'estimated_delivery' in data:

        order.estimated_delivery=data['estimated_delivery']

    db.session.commit()

    return jsonify({
        "message":"Updated"
    })