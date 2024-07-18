from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import json

handle_data_blueprint = Blueprint('handle_data', __name__)

client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB

@handle_data_blueprint.route('/fetch_game_data', methods=['POST'])
def fetch_game_data():
    username = request.json['username']
    collections = ['races', 'spells', 'equipment', 'monsters', 'game_styles']
    game_data = {}
    for collection in collections:
        game_data[collection] = list(db[collection].find({}, {'_id': 0}))
    return jsonify(game_data)


@handle_data_blueprint.route('/save_session', methods=['POST'])
def save_session():
    session_data = request.json
    db.sessions.update_one({"username": session_data['username']}, {"$set": session_data}, upsert=True)
    return jsonify({"status": "Session saved"})