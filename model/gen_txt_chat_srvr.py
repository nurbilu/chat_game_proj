import os
import signal
import sys
import json
import logging
from logging.handlers import TimedRotatingFileHandler
from flask import Flask, request, jsonify, make_response, Blueprint
from flask_caching import Cache
from flask_caching.backends.base import BaseCache
from flask_socketio import SocketIO, emit
from flask_caching.backends.base import BaseCache
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson.json_util import dumps, loads
from datetime import datetime
import random  # For dice rolls
from chatbot import handle_data_blueprint, game_mchnics_blueprint, logout_user_blueprint, GEM_cnnction
from chatbot.GEM_cnnction import generate_gemini_response
from flask.logging import default_handler

def configure_logging():
    log_file = 'app.log'
    
    # Create a logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create a FileHandler
    if not os.path.exists(log_file):
        open(log_file, 'w').close()
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    
    # Create a formatter
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    
    # Add the handler to the logger
    logger.addHandler(file_handler)
    
    # Configure Werkzeug logger
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.handlers = []
    
    # Add a StreamHandler for initial startup messages
    startup_handler = logging.StreamHandler()
    startup_handler.setLevel(logging.INFO)
    startup_handler.setFormatter(logging.Formatter('%(message)s'))
    werkzeug_logger.addHandler(startup_handler)
    
    # Add a FileHandler for all other messages
    werkzeug_logger.addHandler(file_handler)
    
    # Filter to keep only startup messages in the console
    class WerkzeugFilter(logging.Filter):
        def filter(self, record):
            return 'Running on' in record.msg or 'Press CTRL+C to quit' in record.msg

    startup_handler.addFilter(WerkzeugFilter())
    
    return logger

def clear_log_file(log_file):
    with open(log_file, 'w'):
        pass

def handle_exit(signum, frame):
    clear_log_file('app.log')
    os._exit(0)

app = Flask(__name__)
app.logger = configure_logging()
app.logger.handlers = []

CORS(app, resources={r"/*": {"origins": "*"}})  # This allows all domains. Adjust if necessary for security.

socketio = SocketIO(app, cors_allowed_origins="http://localhost:4200") 

# Register blueprints
app.register_blueprint(handle_data_blueprint)
app.register_blueprint(game_mchnics_blueprint)
app.register_blueprint(logout_user_blueprint)
app.register_blueprint(GEM_cnnction)

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
app.config['CACHE_TYPE'] = __name__ + '.MongoDBCache'
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
        app.logger.exception("Error handling message")
        emit('error', {'error': str(e)})

@app.route('/generate_text', methods=['POST'])
def generate_text():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        response_text = generate_gemini_response(prompt)
        return jsonify({'response': response_text})
    except Exception as e:
        app.logger.exception("Error generating text")
        return jsonify({'error': str(e)}), 500

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return response

if __name__ == '__main__':
    signal.signal(signal.SIGINT, handle_exit)
    socketio.run(app, debug=False, use_reloader=False)