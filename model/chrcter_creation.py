import os
import signal
from flask import Flask, request, jsonify, make_response, Blueprint
from flask_caching import Cache
from flask_caching.backends.base import BaseCache
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from bson import json_util
from bson.json_util import dumps, loads
from flask_cors import CORS, cross_origin
import logging
from logging import FileHandler  # Corrected import
import json
import requests
from flask.logging import default_handler
from dotenv import load_dotenv
import openai
import ast
from bs4 import BeautifulSoup

# Load environment variables from .env file
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY_USE")
MONGO_ATLAS = os.getenv("MONGO_ATLAS")
DB_NAME_MONGO = os.getenv("DB_NAME_MONGO")

# Print the API key to verify it's loaded correctly (remove this in production)
print(f"Loaded OpenAI API Key: {OPENAI_API_KEY}")

if not OPENAI_API_KEY:
    raise ValueError("No API key provided. Please set the OPENAI_API_KEY_USE environment variable.")

# Configure OpenAI API key
openai.api_key = OPENAI_API_KEY

# Initialize MongoDB client
client = MongoClient(MONGO_ATLAS, server_api=ServerApi('1'))
db = client[DB_NAME_MONGO]

class MongoDBCache(BaseCache):
    def __init__(self, default_timeout=300, host='localhost', port=27017, db_name='NEW_DATA_DND', collection='cache'):
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

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        try:
            return json_util.default(obj)
        except TypeError:
            return str(obj)

def configure_logging():
    log_file = 'chrcter_creation.log'
    
    # Create a logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    
    # Remove existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Create a FileHandler
    if not os.path.exists(log_file):
        open(log_file, 'w').close()
    file_handler = FileHandler(log_file)
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
    clear_log_file('chrcter_creation.log')
    os._exit(0)

def fix_spell_classes(app):
    spells_collection = db['Spells']

    # Find all spells where `classes` is stored as a string
    spells = spells_collection.find({"classes": {"$type": "string"}})

    for spell in spells:
        classes_str = spell['classes']
        if classes_str:  # Check if the string is not empty
            try:
                # Convert the string to a list of dictionaries
                classes_list = json.loads(classes_str)
                # Update the document with the correct structure
                spells_collection.update_one(
                    {"_id": spell["_id"]},
                    {"$set": {"classes": classes_list}}
                )
            except json.JSONDecodeError:
                app.logger.error(f"Invalid JSON in 'classes' field for spell: {spell['name']}")
        else:
            app.logger.warning(f"Empty 'classes' field for spell: {spell['name']}")

    print("Data structure fixed.")

def create_app():
    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.json_encoder = CustomJSONEncoder
    CORS(app, resources={r"/*": {"origins": "*"}})  # Configure CORS more securely
    app.register_blueprint(character_blueprint, url_prefix='/api')
    
    # Configure logging
    app.logger = configure_logging()
    app.logger.handlers = []
    
    # Fix spell classes
    fix_spell_classes(app)
    
    return app

character_blueprint = Blueprint('character', __name__)
spells_collection = db['Spells']

@character_blueprint.route('/races', methods=['GET', 'OPTIONS'])
def get_races():
    if request.method == 'OPTIONS':
        return build_cors_preflight_response()
    elif request.method == 'GET':
        try:
            # Project only the required fields
            projection = {
                '_id': 0,
                'name': 1,
                'alignment': 1,
                'age': 1,
                'size_description': 1,
                'language_desc': 1
            }
            races = list(db.Races.find({}, projection))
            return jsonify(races), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return jsonify({'error': 'Method not allowed'}), 405

@character_blueprint.route('/chatbot', methods=['POST'])
def chatbot_interaction():
    try:
        user_message = request.json.get('message')
        username = request.json.get('username')
        if not user_message or not username:
            return jsonify({'error': 'Message and username are required'}), 400

        # Send the message to the OpenAI API
        response = openai.Completion.create(
            model="gpt-4o-mini",  # Use gpt-4o-mini model
            prompt=user_message,
            max_tokens=250
        )

        if response and response.choices:
            reply = response.choices[0].text.strip()
            # Save the JSON file to the database
            db.game_styles.insert_one({'username': username, 'content': reply})
            return jsonify({'reply': reply}), 200
        else:
            return jsonify({'error': 'Failed to get response from AI Gemini bot'}), 500
    except Exception as e:
        app.logger.error(f"Failed to interact with chatbot: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/save_draft', methods=['POST'])
def save_draft():
    try:
        draft_data = request.json
        username = draft_data.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        # Save draft data into MongoDB
        db.character_drafts.update_one(
            {"username": username},
            {"$set": {"prompt": draft_data.get('prompt')}},
            upsert=True
        )
        return jsonify({'message': 'Draft saved successfully'}), 200
    except Exception as e:
        app.logger.error(f"Failed to save draft: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/paste_draft', methods=['POST'])
def paste_draft():
    try:
        draft_data = request.json
        username = draft_data.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

        # Get draft data from MongoDB
        draft = db.character_drafts.find_one({"username": username})
        if draft:
            return jsonify(json.loads(json_util.dumps(draft))), 200
        else:
            return jsonify({'error': 'Draft not found'}), 404
    except Exception as e:
        app.logger.error(f"Failed to get draft: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/draft/<username>', methods=['GET'])
def get_draft(username):
    try:
        draft = db.character_drafts.find_one({"username": username})
        if draft:
            return jsonify(json.loads(json_util.dumps(draft))), 200
        else:
            return jsonify({'prompt': ''}), 200  # Return an empty prompt if no draft is found
    except Exception as e:
        app.logger.error(f"Failed to get draft: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/save_character', methods=['POST'])
def save_character():
    try:
        data = request.json
        username = data.get('username')
        character_prompt = data.get('characterPrompt')
        
        if not username or not character_prompt:
            return jsonify({'error': 'Username and character prompt are required'}), 400

        # Save character prompt to MongoDB as a key-value pair
        db.characters.update_one(
            {"username": username},
            {"$set": {"characterPrompt": character_prompt}},
            upsert=True
        )
        return jsonify({'message': 'Character prompt saved successfully'}), 200
    except Exception as e:
        app.logger.error(f"Failed to save character prompt: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/spells/<class_name>', methods=['GET'])
def fetch_spells_by_class(class_name):
    try:
        # Project only the 'name' and 'classes' fields
        projection = {'_id': 0, 'name': 1, 'classes': 1}
        spells = spells_collection.find({}, projection)
        spell_list = list(spells)
        
        # Filter and format the data
        filtered_spells = []
        for spell in spell_list:
            if class_name in spell['classes']:
                filtered_spells.append({
                    'name': spell['name'],
                    'classes': [cls for cls in spell['classes'] if isinstance(cls, str)]
                })
        
        if not filtered_spells:
            return jsonify({"message": "No spells found for the given class"}), 404
        return jsonify(filtered_spells), 200
    except Exception as e:
        app.logger.error(f"Failed to fetch spells for class {class_name}: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/character_prompt/<username>', methods=['GET'])
def get_character_prompt(username):
    try:
        character = db.characters.find_one({"username": username})
        if character:
            raw_prompt = character.get("characterPrompt", "")
            # Clean the HTML to plain text
            soup = BeautifulSoup(raw_prompt, "html.parser")
            cleaned_prompt = soup.get_text(separator="\n").strip()
            return jsonify({"characterPrompt": cleaned_prompt}), 200
        else:
            return jsonify({'error': 'Character not found'}), 404
    except Exception as e:
        app.logger.error(f"Failed to fetch character prompt: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/profile_display/characters/<username>/', methods=['GET'])
def get_character_by_id_and_username(username):
    try:
        character = db.character_creation_users.find_one({"username": username})
        if character:
            return jsonify(json.loads(json_util.dumps(character))), 200
        else:
            return jsonify({'error': 'Character not found'}), 404
    except Exception as e:
        app.logger.error(f"Failed to fetch character: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/classes', methods=['GET'])
def get_classes():
    try:
        classes = list(db.classes.find({}, {"_id": 0, "name": 1, "description": 1, "spells": 1}))
        for class_item in classes:
            if class_item['name'] in ['Barbarian', 'Fighter', 'Monk', 'Rogue']:
                class_item['isSpellCaster'] = False
                class_item.pop('spells', None)  # Remove spells key for non-spellcaster classes
            else:
                class_item['isSpellCaster'] = True
        return jsonify(classes), 200
    except Exception as e:
        app.logger.error(f"Failed to fetch classes: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

def build_cors_preflight_response():
    response = make_response()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, OPTIONS")
    return response

if __name__ == '__main__':
    signal.signal(signal.SIGINT, handle_exit)
    app = create_app()
    app.run(host='0.0.0.0', port=6500, debug=False, use_reloader=False)