import os
import sys
import json
import logging
from flask import Flask, request, jsonify, make_response , Blueprint
from flask_caching import Cache
from flask_socketio import SocketIO, emit
from flask_caching.backends.base import BaseCache
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson.json_util import dumps, loads
from datetime import datetime
import random  # For dice rolls
from chatbot import handle_data_blueprint, game_mchnics_blueprint, logout_user_blueprint, GEM_cnnction

# Configure basic logging at the entry point
logging.basicConfig(filename='app.log', level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})  # This allows all domains. Adjust if necessary for security.

socketio = SocketIO(app, cors_allowed_origins="http://localhost:4200")  # Ensure SocketIO also respects CORS

handle_data_blueprint = Blueprint('handle_data', __name__)
game_mchnics_blueprint = Blueprint('game_mchnics', __name__)
logout_user_blueprint = Blueprint('logout_user', __name__)
GEM_cnnction = Blueprint('GEM_cnnction', __name__)

# Create a custom logger
app_logger = logging.getLogger('app_logger')
app_logger.setLevel(logging.DEBUG)  # Set the logging level

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

@socketio.on('connect')
def handle_connect():
    emit('response', {'message': 'Connected to the chat server!'})

@socketio.on('send_message')
def handle_message(data):
    try:
        player_name = data.get('username', 'Anonymous')
        user_input = data.get('text', '').strip()

        # Assuming a simplified session handling and response generation
        session_data = db.sessions.find_one({"username": player_name}) or {}
        response_text = "Response based on " + user_input  # Simplified response logic

        emit('response', {'text': response_text, 'username': player_name})
        db.sessions.update_one({"username": player_name}, {"$set": session_data}, upsert=True)  # Ensure session is saved after handling
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