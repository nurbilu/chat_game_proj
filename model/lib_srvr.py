# This will be the main Flask application for the library component.
# It will show all MongoDB data for: game styles, equipment, classes, races, etc.
# Simple CRUD, GET, SEARCH & POST (only for superusers).
# Functions: get all tables - set in square containers - use select, have a search bar on the top between the navbar and the table/s.
# Use logger like chrcter_creation.py OR/AND gen_txt_chat_srvr.py for logger file.

import os
import signal
import re
import logging
from logging import FileHandler, Filter
from flask import Flask, Blueprint, request, jsonify
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import json
from flask_cors import CORS
import sys
import traceback
from dotenv import load_dotenv
from fuzzywuzzy import process

# Load environment variables from .env file
load_dotenv()
MONGO_ATLAS = os.getenv("MONGO_ATLAS")
DB_NAME_MONGO = os.getenv("DB_NAME_MONGO")

# Initialize MongoDB client
client = MongoClient(MONGO_ATLAS, server_api=ServerApi('1'))
db = client[DB_NAME_MONGO]

# Create a logger instance at module level
logger = logging.getLogger(__name__)

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

def fetch_data_from_db(collection_name):
    try:
        data = db[collection_name].find({}, {'_id': 0, 'index': 0})
        formatted_data = []
        all_keys = set()

        # First pass to collect all keys
        for item in data:
            all_keys.update(item.keys())

        # Second pass to format data
        data = db[collection_name].find({}, {'_id': 0, 'index': 0})
        for item in data:
            formatted_item = {key: item.get(key, 'None') for key in all_keys}
            formatted_data.append(formatted_item)

        logger.info(f"Fetched {collection_name}")
        return jsonify(formatted_data)

    except Exception as e:
        logger.error(f"Error in fetch_{collection_name}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@lib_srvr.route('/fetch_races', methods=['GET'])
def fetch_races():
    return fetch_data_from_db('Races')

@lib_srvr.route('/fetch_equipment', methods=['GET'])
def fetch_equipment():
    return fetch_data_from_db('Equipment')

@lib_srvr.route('/fetch_monsters', methods=['GET'])
def fetch_monsters():
    return fetch_data_from_db('Monsters')

@lib_srvr.route('/fetch_classes', methods=['GET'])
def fetch_classes():
    return fetch_data_from_db('Classes')

@lib_srvr.route('/fetch_spells', methods=['GET'])
def fetch_spells():
    return fetch_data_from_db('Spells')

@lib_srvr.route('/search/<name>', methods=['GET'])
def search_item_by_name(name):
    projection = {'_id': 0, 'index': 0}
    regex = re.compile(f'^{re.escape(name)}$', re.IGNORECASE)  # Exact match, case-insensitive
    results = {}
    exact_match_found = False

    for collection in ['Spells', 'Classes', 'Races', 'Monsters', 'Equipment']:
        data = db[collection].find_one({"name": regex}, projection)
        if data:
            results[collection] = [data]
            exact_match_found = True

    if not exact_match_found:
        # Perform fuzzy search if exact match is not found
        for collection in ['Spells', 'Classes', 'Races', 'Monsters', 'Equipment']:
            data = db[collection].find({}, projection)
            items = list(data)
            matches = process.extract(name, [item['name'] for item in items], limit=10)
            for match in matches:
                if 85 <= match[1] <= 100:  # Filter matches with a ratio 
                    for item in items:
                        if item['name'] == match[0]:
                            if collection not in results:
                                results[collection] = []
                            results[collection].append(item)
                            break

    if results:
        return jsonify(results)
    else:
        return jsonify({"error": "No results found"}), 404

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Configure logging
    configure_logging()
    
    # Register blueprint
    app.register_blueprint(lib_srvr, url_prefix='/api')
    
    # Error handler for 500 errors
    @app.errorhandler(500)
    def handle_500_error(e):
        logger.error(f"Internal Server Error: {str(e)}")
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    
    return app

# Define the main entry point
if __name__ == '__main__':
    app = create_app()
    signal.signal(signal.SIGINT, handle_exit)
    app.run(host='127.0.0.1', port=7625, debug=False, use_reloader=False)
    
    
    
    # not a as the perfect logger that in the commit version " Update Dockerfile - backend " or/and " docker build + run + push in the prccss" 
    # but it's working good for a correct build.bat and run.bat and docker-compose.yml to run the app correctly - might need to fix some more . 