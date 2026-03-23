from db_config import db
from app import app
from models import User
from sqlalchemy import inspect

with app.app_context(), open('auth_diag.txt', 'w') as f:
    inspector = inspect(db.engine)
    columns = inspector.get_columns('user')
    f.write("User table columns:\n")
    for column in columns:
        f.write(f" - {column['name']} ({column['type']})\n")

    users = User.query.all()
    f.write(f"\nTotal users: {len(users)}\n")
    for u in users:
        is_hashed = u.password.startswith('pbkdf2:sha256:') or u.password.startswith('scrypt:')
        f.write(f"User: {u.email}, Role: {u.role}, Password Hashed: {is_hashed}\n")
    print("Done. Check auth_diag.txt")
