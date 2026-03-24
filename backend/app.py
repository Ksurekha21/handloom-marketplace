from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db_config import db
from flask_migrate import Migrate
import os
from auth import auth_bp
from weaver import weaver_bp
from supplier import supplier_bp
from buyer import buyer_bp
from ai_logic import ai_logic_bp
import models
from flask_cors import CORS
import cloudinary
import cloudinary.uploader


app = Flask(__name__)
cloudinary.config(
    cloud_name=os.environ.get("CLOUD_NAME"),
    api_key=os.environ.get("API_KEY"),
    api_secret=os.environ.get("API_SECRET")
)
UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


CORS(app, resources={r"/*":{"origins":"*"}})

database_url = os.environ.get("DATABASE_URL")

if database_url:
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://","postgresql://",1)
else:
    database_url = "sqlite:///handloom.db"   # fallback for local testing

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
migrate = Migrate(app, db)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(weaver_bp, url_prefix='/api/weaver')
app.register_blueprint(supplier_bp, url_prefix='/api/supplier')
app.register_blueprint(buyer_bp, url_prefix='/api/buyer')
app.register_blueprint(ai_logic_bp, url_prefix='/api/ai')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('uploads', filename)

@app.route("/ping")
def ping():
    return {"status": "ok", "database": str(db.engine.url)}

@app.route("/")
def home():
    return {"message": "Handloom Connect Backend Running"}

with app.app_context():
    
    db.create_all()
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)