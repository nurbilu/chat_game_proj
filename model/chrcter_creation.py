from flask import Flask, request, jsonify, make_response, Blueprint
from flask_caching import Cache
from pymongo import MongoClient
from bson.json_util import dumps, loads
from flask_cors import CORS
import logging

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})  # Configure CORS more securely
    app.config['MONGO_URI'] = 'mongodb://localhost:27017/DnD_AI_DB'
    app.register_blueprint(character_blueprint, url_prefix='/api')
    return app

character_blueprint = Blueprint('character', __name__)
mongo_client = MongoClient('mongodb://localhost:27017/')
db = mongo_client['DnD_AI_DB']

@character_blueprint.route('/characters', methods=['POST', 'OPTIONS'])
def create_character():
    if request.method == 'OPTIONS':
        return build_cors_preflight_response()
    elif request.method == 'POST':
        character_data = request.json
        required_fields = ['name', 'gameStyle', 'race', 'username']
        if not all(field in character_data for field in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        try:
            db.character_creation_users.insert_one(character_data)
            return jsonify({'message': 'Character created successfully'}), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@character_blueprint.route('/races', methods=['GET'])
def get_races():
    try:
        races = list(db.races.find({}, {'_id': 0}))
        return jsonify(races), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def build_cors_preflight_response():
    response = make_response()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=6500, debug=True)