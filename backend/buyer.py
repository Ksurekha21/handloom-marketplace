from flask import Blueprint, request, jsonify
from db_config import db
from models import Saree, User, Order, Review

buyer_bp = Blueprint('buyer', __name__)

@buyer_bp.route('/products', methods=['GET'])
def get_all_products():
    sarees = Saree.query.all()
    products = []
    for s in sarees:
        products.append({
            "id": s.id, 
            "title": s.title, 
            "price": s.price, 
            "category": s.category, 
            "description": s.description,
            "weaver_id": s.weaver_id,
            "image_url": s.image_url,
            "color": s.color,
            "days_to_weave": s.days_to_weave,
            "raw_material_cost": s.raw_material_cost,
            "weaver_name": s.weaver.name if s.weaver else "Unknown",
            "weaver_state": s.weaver.state if s.weaver else "Unknown",
            "weaver_experience": s.weaver.years_experience if s.weaver else 0
        })
    return jsonify({"products": products}), 200

@buyer_bp.route('/order', methods=['POST'])
def place_order():

    data = request.json

    saree_id = data['saree_id']

    # Defensive check
    if isinstance(saree_id,str) and not saree_id.isdigit():

        return jsonify({
        "error":"Invalid product"
        }),400


    order = Order(

        buyer_id=int(data['buyer_id']),

        saree_id=int(saree_id),

        payment_method=data['payment_method'],

        status="Pending",              # ADD THIS

        estimated_delivery=None       # ADD THIS

    )

    db.session.add(order)

    db.session.commit()

    return jsonify({

        "message":"Order placed successfully",

        "id":order.id

    }),201
@buyer_bp.route('/orders/<int:buyer_id>')
def get_orders(buyer_id):

    orders = db.session.query(Order,Saree)\
    .join(Saree,Order.saree_id==Saree.id)\
    .filter(Order.buyer_id==buyer_id)\
    .all()

    results=[]

    for order,saree in orders:

        results.append({

        "id":order.id,

        "saree_title":saree.title,

        "status":order.status,

        "price":saree.price,

        "estimated_delivery":
        order.estimated_delivery,

        "created_at":
        order.created_at.isoformat()


        })

    return jsonify({
    "orders":results
    }),200

@buyer_bp.route('/review', methods=['POST'])
def add_review():
    data = request.json
    review = Review(
        saree_id=data['saree_id'],
        buyer_id=data['buyer_id'],
        rating=data['rating'],
        comment=data.get('comment', '')
    )
    db.session.add(review)
    db.session.commit()
    return jsonify({"message": "Review added successfully"}), 201

@buyer_bp.route('/reviews/<int:saree_id>', methods=['GET'])
def get_reviews(saree_id):
    reviews = Review.query.filter_by(saree_id=saree_id).all()
    result = []
    for r in reviews:
        result.append({
            "id": r.id,
            "buyer_name": r.buyer.name if r.buyer else "Anonymous",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.strftime("%Y-%m-%d")
        })
    return jsonify({"reviews": result}), 200
