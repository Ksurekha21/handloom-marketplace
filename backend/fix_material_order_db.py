from db_config import db
from app import app
from models import MaterialOrder
from sqlalchemy import inspect, text

with app.app_context():
    inspector = inspect(db.engine)
    if 'material_order' not in inspector.get_table_names():
        print("Table 'material_order' does NOT exist.")
    else:
        columns = [c['name'] for c in inspector.get_columns('material_order')]
        print(f"Columns in 'material_order': {columns}")
        
        if 'estimated_delivery' not in columns:
            print("Missing 'estimated_delivery' column. Attempting to add...")
            try:
                db.session.execute(text("ALTER TABLE material_order ADD COLUMN estimated_delivery VARCHAR(100)"))
                db.session.commit()
                print("Column 'estimated_delivery' added successfully.")
            except Exception as e:
                print(f"Error adding column: {e}")
        else:
            print("Column 'estimated_delivery' already exists.")
