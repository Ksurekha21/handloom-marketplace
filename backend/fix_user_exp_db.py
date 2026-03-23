from app import app
from db_config import db
from sqlalchemy import text

def fix_db():
    with app.app_context():
        try:
            # Add years_experience to user table
            db.session.execute(text("ALTER TABLE user ADD COLUMN years_experience INTEGER"))
            db.session.commit()
            print("Successfully added years_experience column to user table!")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding column: {e}")

if __name__ == "__main__":
    fix_db()
