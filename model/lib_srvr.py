# This will be the main Flask application for the library component.
# It will show all MongoDB data for: game styles, equipment, classes, races, etc.
# Simple CRUD, GET, SEARCH & POST.
# Functions: get all tables - set in square containers - use select, have a search bar on the top between the navbar and the table/s.
# Use logger like chrcter_creation.py OR/AND gen_txt_chat_srvr.py for logger file.

import os
import signal
import re
import logging
from logging import FileHandler, Filter
from flask import Flask, Blueprint, request, jsonify
from pymongo import MongoClient
import json
from bson import json_util
from flask_cors import CORS
import sys
import traceback

# Initialize MongoDB client
client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB

class FilterRemoveDateFromWerkzeugLogs(Filter):
    # Regex pattern to remove the date/time from Werkzeug logs
    pattern = re.compile(r' - - \[.+?\] ')

    def filter(self, record):
        if 'werkzeug' in record.name:
            record.msg = self.pattern.sub(' - ', record.msg)
        return True

# Initialize logger
def configure_logging():
    log_file = 'library.log'
    
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
    werkzeug_logger.addFilter(FilterRemoveDateFromWerkzeugLogs())
    
    # Add a StreamHandler for initial startup messages
    startup_handler = logging.StreamHandler(sys.stdout)
    startup_handler.setLevel(logging.INFO)
    startup_handler.setFormatter(logging.Formatter('%(message)s'))
    werkzeug_logger.addHandler(startup_handler)
    
    # Add a FileHandler for all other messages
    werkzeug_logger.addHandler(file_handler)
    
    return logger

def log_uncaught_exceptions(exctype, value, tb):
    logger = logging.getLogger()
    logger.error("Uncaught exception", exc_info=(exctype, value, tb))

# Set the custom exception hook
sys.excepthook = log_uncaught_exceptions

def clear_log_file(log_file):
    with open(log_file, 'w'):
        pass

def handle_exit(signum, frame):
    clear_log_file('library.log')
    os._exit(0)

# Define the blueprint
lib_srvr = Blueprint('lib_srvr', __name__)

@lib_srvr.route('/fetch_all_collections', methods=['GET'])
def fetch_all_collections():
    try:
        collections = ['races', 'spells', 'equipment', 'monsters', 'game styles']
        all_data = {}
        for collection in collections:
            data = list(db[collection].find())
            filtered_data = []
            for item in data:
                filtered_item = {key: value for key, value in item.items() if key not in ['_id', 'url']}
                if collection == 'game styles' and 'classes' in filtered_item:
                    classes = filtered_item.pop('classes')
                    for cls in classes:
                        class_name = cls.get('name', 'unknown_class')
                        filtered_item[f'class_{class_name}'] = cls
                filtered_data.append(filtered_item)
            all_data[collection] = filtered_data
        app.logger.info("Fetched all collections")
        return jsonify(json.loads(json_util.dumps(all_data)))
    except Exception as e:
        app.logger.error("Error in fetch_all_collections", exc_info=True)
        return jsonify({"error": str(e)}), 500

@lib_srvr.route('/fetch_game_styles', methods=['GET'])
def fetch_game_styles():
    try:
        game_styles = ['warrior_fighter', 'rogue_druid', 'mage_sorcerer']
        all_data = {}
        for style in game_styles:
            data = list(db['game styles'].find({style: {"$exists": True}}))
            filtered_data = []
            for item in data:
                filtered_item = {key: value for key, value in item.items() if key not in ['_id', 'url']}
                if 'classes' in filtered_item:
                    classes = json.loads(filtered_item.pop('classes'))
                    for cls in classes:
                        class_name = cls.get('name', 'unknown_class')
                        filtered_item[f'class_{class_name}'] = cls
                filtered_data.append(filtered_item)
            all_data[style] = json.loads(json_util.dumps(filtered_data))
        app.logger.info("Fetched game styles")
        return jsonify(all_data)
    except Exception as e:
        app.logger.error("Error in fetch_game_styles", exc_info=True)
        return jsonify({"error": str(e)}), 500

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    app.register_blueprint(lib_srvr, url_prefix='/api')
    
    # Configure logging
    app.logger = configure_logging()
    app.logger.handlers = []
    # Redirect stdout and stderr to the log file
    sys.stdout = open('library.log', 'a')
    sys.stderr = open('library.log', 'a')
    
    return app

# Define the main entry point
if __name__ == '__main__':
    app = create_app()
    signal.signal(signal.SIGINT, handle_exit)
    app.run(host='127.0.0.1', port=7625, debug=False, use_reloader=False)