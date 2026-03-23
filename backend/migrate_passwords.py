from db_config import db
from app import app
from models import User
from werkzeug.security import generate_password_hash

def migrate():
    with app.app_context():
        print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print(f"DB Engine URL: {db.engine.url}")
        
        users = User.query.all()
        count = 0
        for u in users:
            is_hashed = u.password.startswith('pbkdf2:sha256:') or u.password.startswith('scrypt:')
            if not is_hashed:
                print(f"Hashing password for: {u.email} (Current: {u.password})")
                u.password = generate_password_hash(u.password)
                count += 1
        
        if count > 0:
            db.session.commit()
            print(f"\nSuccessfully migrated {count} users.")
        else:
            print("\nNo unhashed users found.")

if __name__ == "__main__":
    migrate()
