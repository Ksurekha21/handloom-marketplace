from db_config import db
from app import app
from models import RawMaterial

with app.app_context():
    print([{ 'id': m.id, 'type': m.material_type, 'price': m.price } for m in RawMaterial.query.all()])
