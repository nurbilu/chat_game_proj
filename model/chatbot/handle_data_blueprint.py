from flask import Blueprint, request, jsonify, current_app as app
from pymongo import MongoClient
import json
from bson import json_util
from .GEM_cnnction import generate_gemini_response

handle_data_blueprint = Blueprint('handle_data', __name__)

client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB

@handle_data_blueprint.route('/fetch_game_data', methods=['POST'])
def fetch_game_data():
    username = request.json['username']
    collections = ['races', 'spells', 'equipment', 'monsters', 'game_styles']
    game_data = {}
    for collection in collections:
        game_data[collection] = json.loads(json_util.dumps(list(db[collection].find())))
    return jsonify(game_data)

@handle_data_blueprint.route('/save_session', methods=['POST'])
def save_session():
    session_data = request.json
    db.sessions.update_one({"username": session_data['username']}, {"$set": session_data}, upsert=True)
    return jsonify({"status": "Session saved"})

@handle_data_blueprint.route('/generate_text', methods=['POST'])
def generate_text():
    try:
        data = request.json
        prompt = data.get('prompt', '').strip()
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Connect to the database
        client = MongoClient('mongodb://localhost:27017/mike')
        db = client.DnD_AI_DB
        
        # Assuming a simplified session handling and response generation
        session_data = db.sessions.find_one({"username": data.get('username', 'Anonymous')}) or {}
        enriched_prompt = f"{prompt}\n\nSession Data:\n{json.dumps(session_data)}"
        
        response_text = generate_gemini_response(enriched_prompt, db)
        return jsonify({'response': response_text})
    except Exception as e:
        app.logger.exception("Error generating text")
        return jsonify({'error': str(e)}), 500