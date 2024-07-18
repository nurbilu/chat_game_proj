from flask import Blueprint, request, jsonify
from pymongo import MongoClient

logout_user_blueprint = Blueprint('logout_user', __name__)

client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB

@logout_user_blueprint.route('/logout', methods=['POST'])
def logout_user():
    username = request.json.get('username', 'default_username')
    session = db.sessions.find_one({"username": username})
    if session:
        last_prompt = session.get('last_prompt', "No chatbot response found.")
        return jsonify({"last_prompt": last_prompt})
    return jsonify({"message": "No session data available."})