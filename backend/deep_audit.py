from app import app
from db_config import db
from models import Order, User

with app.app_context():
    print("--- USERS ---")
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id} NAME: {u.name} EMAIL: {u.email} ROLE: {u.role}")
    
    print("\n--- ORDERS ---")
    orders = Order.query.all()
    for o in orders:
        print(f"ORDER: {o.id} BUYER: {o.buyer_id} SAREE: {o.saree_id} STATUS: {o.status}")
