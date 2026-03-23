from flask import Blueprint, jsonify

ai_logic_bp = Blueprint('ai', __name__)

@ai_logic_bp.route('/compare', methods=['GET'])
def ai_compare():
    # Mock AI response
    return jsonify({
        "insight": "Fair price based on market value.",
        "market_average": 8500,
        "rating": "Good"
    }), 200
