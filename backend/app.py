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


app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///C:\\handloom-connect\\backend\\instance\\handloom_v7.db'
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

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000)
