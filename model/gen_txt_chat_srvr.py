import os
import json
import logging
from flask import Flask, request, jsonify, make_response
from flask_caching import Cache
from flask_socketio import SocketIO, emit
from flask_caching.backends.base import BaseCache
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson.json_util import dumps, loads
from datetime import datetime
import random  # For dice rolls
from chatbot_model import ChatbotModel  # Import ChatbotModel
from GEM_cnnction import GeminiConnection

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # This allows all domains. Adjust if necessary for security.

socketio = SocketIO(app, cors_allowed_origins="http://localhost:4200")  # Ensure SocketIO also respects CORS

# Create a custom logger
app_logger = logging.getLogger('app_logger')
app_logger.setLevel(logging.DEBUG)  # Set the logging level

# Create file handler which logs even debug messages
fh = logging.FileHandler('log1.log')
fh.setLevel(logging.DEBUG)

# Create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)

# Add the handlers to the logger
app_logger.addHandler(fh)

# Decorator for logging function calls
def logger(func):
    def wrapper(*args, **kwargs):
        try:
            app_logger.debug(f"Calling {func.__name__} with args: {args}, kwargs: {kwargs}")
            result = func(*args, **kwargs)
            app_logger.debug(f"{func.__name__} returned: {result}")
            return result
        except Exception as e:
            app_logger.error(f"Error in {func.__name__}: {str(e)}")
            raise
    return wrapper

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/mike')
db = client['DnD_AI_DB']

# Fetch fireball prompts
fireball_prompts = list(db.fireball.find({}))

# Define the MongoDB cache class
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

    def delete(self, key):
        self.collection.delete_one({"key": key})

    def clear(self):
        self.collection.delete_many({})

# Configure Flask to use the custom MongoDB cache
app.config['CACHE_TYPE'] = 'chrcter_creation.MongoDBCache'  # Adjusted to correct import path
cache = Cache(app)

@app.route('/generate_text', methods=['POST', 'OPTIONS'])
@cross_origin(origin='*', headers=['Content-Type', 'Authorization'], supports_credentials=True)
def generate_text():
    user_input = request.json.get('text')
    player_name = request.json.get('username', 'Anonymous')

    session_data = db.sessions.find_one({"username": player_name}) or {"username": player_name, "history": [], "use_gemini_api": True}
    chatbot = ChatbotModel(session_data)
    response_text = chatbot.handle_player_input(user_input)

    if "Failed to connect to Gemini API" in response_text:
        return jsonify({'error': 'API Error', 'message': response_text}), 503

    session_data['history'].append({"user": user_input, "bot": response_text, "timestamp": datetime.now()})
    db.sessions.update_one({"username": player_name}, {"$set": session_data}, upsert=True)
    return jsonify({'text': response_text, 'username': player_name}), 200

@app.route('/logout', methods=['POST'], endpoint='logout_post')
def logout():
    player_name = request.json.get('username', 'default_username')
    session_data = db.sessions.find_one({"username": player_name})
    chatbot = ChatbotModel(session_data)
    last_prompt = chatbot.logout_user()
    return jsonify({"last_prompt": last_prompt}), 200

@app.route('/game_data/<data_type>', methods=['GET'])
def get_game_data(data_type):
    collections = {
        'races': db.races,
        'spells': db.spells,
        'equipment': db.equipment,
        'monsters': db.monsters,
        'game_styles': db.game_styles
    }
    if data_type in collections:
        data = list(collections[data_type].find({}, {'_id': 0}))  # Exclude MongoDB's _id from results
        return jsonify(data), 200
    else:
        return jsonify({'error': 'Invalid data type requested'}), 404

@socketio.on('connect')
def handle_connect():
    emit('response', {'message': 'Connected to the chat server!'})

@socketio.on('send_message')
def handle_message(data):
    try:
        player_name = data.get('username', 'Anonymous')
        user_input = data.get('text', '').strip()

        chatbot = ChatbotModel(db.sessions.find_one({"username": player_name}) or {})
        response_text = chatbot.handle_player_input(user_input)

        emit('response', {'text': response_text, 'username': player_name})
        chatbot.save_session(player_name, chatbot.session_data)  # Ensure session is saved after handling
    except Exception as e:
        emit('error', {'error': str(e)})

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

if __name__ == '__main__':
    socketio.run(app, debug=True)