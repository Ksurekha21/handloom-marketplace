from app import app, db
from models import Order, User, Saree
with app.app_context():
    os = Order.query.all()
    print(f"TOTAL_ORDERS: {len(os)}")
    for o in os:
        print(f"ORDER: {o.id} BUYER: {o.buyer_id} SAREE: {o.saree_id}")
    us = User.query.all()
    print(f"TOTAL_USERS: {len(us)}")
    for u in us:
        print(f"USER: {u.id} NAME: {u.name}")
