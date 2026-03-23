from app import app, db
from models import User

with app.app_context():
    users = User.query.all()
    with open('users_dump_utf8.txt', 'w', encoding='utf-8') as f:
        f.write(f"TOTAL USERS: {len(users)}\n")
        for u in users:
            f.write(f"ID: {u.id} | EMAIL: {u.email} | ROLE: {u.role} | PWD: {u.password}\n")
