from db_config import db
from app import app
from sqlalchemy import inspect

with app.app_context(), open('schema_audit.txt', 'w') as f:
    inspector = inspect(db.engine)
    f.write(f"Database: {db.engine.url}\n")
    for table_name in inspector.get_table_names():
        f.write(f"\nTable: {table_name}\n")
        columns = inspector.get_columns(table_name)
        for column in columns:
            f.write(f" - {column['name']} ({column['type']})\n")
    print("Done. Check schema_audit.txt")
