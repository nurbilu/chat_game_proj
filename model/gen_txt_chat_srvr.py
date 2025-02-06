import os
import signal
import sys
import json
import logging
from logging import FileHandler
from flask import Flask, request, jsonify, make_response, Blueprint
from flask_caching import Cache
from flask_caching.backends.base import BaseCache
from flask_socketio import SocketIO, emit
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson.json_util import dumps, loads
from datetime import datetime
import random
from chatbot.handle_data_blueprint import handle_data_blueprint
from chatbot.game_mchnics_blueprint import game_mchnics_blueprint
from chatbot.logout_user_blueprint import logout_user_blueprint
from chatbot.GEM_cnnction import GEM_cnnction
from flask.logging import default_handler
import google.generativeai as genai
from bs4 import BeautifulSoup
from dotenv import load_dotenv


load_dotenv()
MONGO_ATLAS = os.getenv("MONGO_ATLAS")
DB_NAME_MONGO = os.getenv("DB_NAME_MONGO")

def configure_logging():
    log_file = 'app.log'
    
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    if not os.path.exists(log_file):
        open(log_file, 'w').close()
    file_handler = FileHandler(log_file)

    file_handler.setLevel(logging.DEBUG)
    
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    
    werkzeug_logger = logging.getLogger('werkzeug')
    werkzeug_logger.handlers = []
    
    startup_handler = logging.StreamHandler()
    startup_handler.setLevel(logging.INFO)
    startup_handler.setFormatter(logging.Formatter('%(message)s'))
    werkzeug_logger.addHandler(startup_handler)
    
    werkzeug_logger.addHandler(file_handler)
    
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

class MongoDBCache(BaseCache):
    def __init__(self, default_timeout=300, host=None, port=None, db_name=None, collection='cache'):
        self.default_timeout = default_timeout
        self.client = MongoClient(os.getenv('MONGO_ATLAS'), server_api=ServerApi('1'))
        self.db = self.client[os.getenv('DB_NAME_MONGO')]
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

def create_app():
    app = Flask(__name__)
    CORS(app)
    socketio = SocketIO(app, cors_allowed_origins="http://localhost:4200")

    app.logger = configure_logging()

    app.register_blueprint(handle_data_blueprint)
    app.register_blueprint(game_mchnics_blueprint)
    app.register_blueprint(logout_user_blueprint)
    app.register_blueprint(GEM_cnnction)

    try:
        client = MongoClient(MONGO_ATLAS, server_api=ServerApi('1'))
        db = client[DB_NAME_MONGO]
    except Exception as e:
        app.logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise e

    app.config['CACHE_TYPE'] = __name__ + '.MongoDBCache'
    cache = Cache(app)

    @socketio.on('connect')
    def handle_connect():
        emit('response', {'message': 'Connected to the chat server!'})

    @socketio.on('send_message')
    def handle_message(data):
        try:
            player_name = data.get('username', 'Anonymous')
            user_input = data.get('prompt', '').strip()

            session_data = db.sessions.find_one({"username": player_name}) or {}
            enriched_prompt = f"{user_input}\n\nSession Data:\n{json.dumps(session_data, cls=JSONEncoder)}"

            response_text = generate_gemini_response(enriched_prompt, db)

            emit('response', {'text': response_text, 'username': player_name})
            db.sessions.update_one({"username": player_name}, {"$set": session_data}, upsert=True)  # Ensure session is saved after handling
        except Exception as e:
            app.logger.exception("Error handling message")
            emit('error', {'error': str(e)})

    def _build_cors_preflight_response():
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        return response

    @app.route('/generate_text/character_prompt/<username>', methods=['GET', 'OPTIONS'])
    @cross_origin()
    def get_character_prompt(username):
        if request.method == 'OPTIONS':
            return _build_cors_preflight_response()
        
        try:
            character = db.characters.find_one({"username": username})
            if character:
                raw_prompt = character.get("characterPrompt", "")
                soup = BeautifulSoup(raw_prompt, "html.parser")
                cleaned_prompt = soup.get_text(separator="\n").strip()
                return jsonify({"characterPrompt": cleaned_prompt}), 200
            else:
                return jsonify({'error': 'Character not found'}), 404
        except Exception as e:
            app.logger.error(f"Failed to fetch character prompt: {str(e)}")
            return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

    return app, socketio



if __name__ == '__main__':
    signal.signal(signal.SIGINT, handle_exit)
    app, socketio = create_app()
    socketio.run(app, debug=False, use_reloader=False)