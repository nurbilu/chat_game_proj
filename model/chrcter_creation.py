from flask import Flask, request, jsonify, make_response, Blueprint
from flask_caching import Cache
from pymongo import MongoClient
from bson.json_util import dumps, loads
from flask_cors import CORS
import logging
from flask_caching.backends.base import BaseCache
from pymongo import MongoClient
from bson.json_util import loads, dumps
import requests
from logging.handlers import RotatingFileHandler
from bson import ObjectId

class MongoDBCache(BaseCache):
    def __init__(self, default_timeout=300, host='localhost', port=27017, db_name='DnD_AI_DB', collection='cache'):
        self.default_timeout = default_timeout
        self.client = MongoClient(host, port)
        self.db = self.client[db_name]
        self.collection = self.db[collection]
        super(MongoDBCache, self).__init__(default_timeout)

    def get(self, key):
        item = self.collection.find_one({"key": key})
        if item:
            return loads(item['value'])
        return None

    def set(self, key, value, timeout=None):
        self.collection.update_one({"key": key}, {"$set": {"value": dumps(value), "timeout": timeout}}, upsert=True)

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
        try:
            character_data = request.json
            required_fields = ['name', 'gameStyle', 'race', 'username']
            if not all(field in character_data for field in required_fields):
                return jsonify({'error': 'Missing required fields'}), 400

            # Insert character data into MongoDB
            result = db.character_creation_users.insert_one(character_data)
            # Convert ObjectId to string for the response
            character_data['_id'] = str(result.inserted_id)

            # Send data to chat server and Gemini API
            response = requests.post('http://127.0.0.1:5000/api/character_data', json=character_data)
            return jsonify({'message': 'Character created', 'chat_response': response.json()}), 201
        except Exception as e:
            app.logger.error(f"Failed to create character: {str(e)}")
            return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

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
    handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=1)
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)
    app.run(host='0.0.0.0', port=6500, debug=True)