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
from flask.logging import default_handler
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from datetime import datetime
from bson import ObjectId

load_dotenv()
MONGO_ATLAS = os.getenv("MONGO_ATLAS")
DB_NAME_MONGO = os.getenv("DB_NAME_MONGO")


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
            
    @staticmethod
    def decode_object_id(obj):
        if isinstance(obj, str) and ObjectId.is_valid(obj.strip().rstrip('/')):
            return ObjectId(obj.strip().rstrip('/'))
        return obj
    

class ChrcterPrmptEncoder_id(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, ObjectId):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

def configure_logging():
    log_file = 'chrcter_creation.log'
    

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
    clear_log_file('chrcter_creation.log')
    os._exit(0)

def fix_spell_classes(app):
    spells_collection = db['Spells']

    spells = spells_collection.find({"classes": {"$type": "string"}})


    for spell in spells:
        classes_str = spell['classes']
        if classes_str:  # Check if the string is not empty
            try:
                classes_list = json.loads(classes_str)
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
    CORS(app, resources={r"/*": {"origins": "*"}})

    @app.before_request
    def handle_object_id():

        if request.view_args and 'prompt_id' in request.view_args:
            try:
                raw_id = request.view_args['prompt_id']
                request.view_args['prompt_id'] = CustomJSONEncoder.decode_object_id(raw_id)
            except Exception as e:
                app.logger.error(f"Failed to decode ObjectId: {str(e)}")
    
    app.register_blueprint(character_blueprint, url_prefix='/api')

    app.logger = configure_logging()
    app.logger.handlers = []
    

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

@character_blueprint.route('/save_draft', methods=['POST'])
def save_draft():
    try:
        draft_data = request.json
        username = draft_data.get('username')
        if not username:
            return jsonify({'error': 'Username is required'}), 400

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
            return jsonify({'prompt': ''}), 200 
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
        projection = {'_id': 0, 'name': 1, 'classes': 1}
        spells = spells_collection.find({}, projection)
        spell_list = list(spells)
        
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

@character_blueprint.route('/character_prompts/<username>', methods=['GET'])
def get_all_character_prompts(username):
    try:
        prompts = db.characters.find({"username": username})
        prompts_list = list(prompts)
        
        if prompts_list:
            for prompt in prompts_list:
                if 'characterPrompt' in prompt:

                    soup = BeautifulSoup(prompt['characterPrompt'], "html.parser")
                    prompt['characterPrompt'] = soup.get_text(separator="\n").strip()
            
            return jsonify(json.loads(json_util.dumps(prompts_list))), 200
        else:
            return jsonify([]), 200
    except Exception as e:
        app.logger.error(f"Failed to fetch character prompts: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/save_character_prompt', methods=['POST'])
def save_character_prompt():
    try:
        data = request.json
        username = data.get('username')
        character_prompt = data.get('characterPrompt')
        
        if not username or not character_prompt:
            return jsonify({'error': 'Username and character prompt are required'}), 400

        existing_prompts = db.characters.count_documents({"username": username})
        if existing_prompts >= 4:
            return jsonify({'error': 'Maximum number of characters (4) reached'}), 400


        result = db.characters.insert_one({
            "username": username,
            "characterPrompt": character_prompt,
            "created_at": datetime.utcnow(),
            "active": True 
        })


        
        return jsonify({
            'message': 'Character prompt saved successfully',
            'id': str(result.inserted_id)
        }), 200

    except Exception as e:
        app.logger.error(f"Failed to save character prompt: {str(e)}")
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500

@character_blueprint.route('/character_prompt/<username>/<prompt_id>', methods=['DELETE'])
def delete_character_prompt(username, prompt_id):
    try:
        prompt_id = ObjectId(prompt_id)
        
        result = db.characters.delete_one({
            "username": username,
            "_id": prompt_id
        })
        
        if result.deleted_count > 0:
            return jsonify({'message': 'Character prompt deleted successfully'}), 200
        else:
            return jsonify({'error': 'Character prompt not found'}), 404
            
    except Exception as e:
        app.logger.error(f"Failed to delete character prompt: {str(e)}")
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