from app import app, db
from models import Order, Saree, User

with app.app_context():
    print("Checking database v5 status...")
    users = User.query.all()
    sarees = Saree.query.all()
    orders = Order.query.all()
    
    print(f"Users: {len(users)}")
    for u in users:
        print(f" - {u.id}: {u.name} ({u.role})")
        
    print(f"Sarees: {len(sarees)}")
    for s in sarees:
        print(f" - {s.id}: {s.title} (Weaver ID: {s.weaver_id})")
        
    print(f"Orders: {len(orders)}")
    for o in orders:
        print(f" - ID: {o.id}, Buyer: {o.buyer_id}, Saree: {o.saree_id}, Status: {o.status}")
