from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

# Load environment variables from .env file
load_dotenv()

logout_user_blueprint = Blueprint('logout_user', __name__)

try:
    client = MongoClient(os.getenv('MONGO_ATLAS'), server_api=ServerApi('1'))
    db = client[os.getenv('DB_NAME_MONGO')]
except Exception as e:
    print(f"Failed to connect to MongoDB: {str(e)}")
    raise e

@logout_user_blueprint.route('/logout', methods=['POST'])
def logout_user():
    username = request.json.get('username', 'default_username')
    session = db.sessions.find_one({"username": username})
    if session:
        last_prompt = session.get('last_prompt', "No chatbot response found.")
        return jsonify({"last_prompt": last_prompt})
    return jsonify({"message": "No session data available."})