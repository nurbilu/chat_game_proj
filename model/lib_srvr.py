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
import json
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

def fetch_data_from_db(collection_name):
    try:
        # Only include the 'Name' field and exclude the '_id' field
        projection = {'Name': 1, '_id': 0}
        data = list(db[collection_name].find({}, projection))

        # Ensure 'name' is lowercase and rearrange the fields to show 'name' first
        formatted_data = []
        for item in data:
            formatted_item = {'name': item.pop('Name').lower()}
            formatted_item.update(item)  # Add remaining fields after 'name'
            formatted_data.append(formatted_item)
        
        app.logger.info(f"Fetched {collection_name}")
        return jsonify(json.loads(json.dumps(formatted_data)))  # Convert to JSON

    except Exception as e:
        app.logger.error(f"Error in fetch_{collection_name}", exc_info=True)
        return jsonify({"error": str(e)}), 500

@lib_srvr.route('/fetch_races', methods=['GET'])
def fetch_races():
    return fetch_data_from_db('races')

@lib_srvr.route('/fetch_equipment', methods=['GET'])
def fetch_equipment():
    return fetch_data_from_db('equipment')

@lib_srvr.route('/fetch_classes', methods=['GET'])
def fetch_classes():
    return fetch_data_from_db('classes')

@lib_srvr.route('/fetch_spells', methods=['GET'])
def fetch_spells():
    return fetch_data_from_db('spells')

# adjust fetch_game_styles to use fetch_data_from_db and add the modefication to manipulate the data of game styles collection - but
# there is a chance that game styles going to change its meaning and use so will not be even in library !
# @lib_srvr.route('/fetch_game_styles', methods=['GET'])
# def fetch_game_styles():
#     try:
#         data = list(db['game_styles'].find({}, {'_id': 0, 'index': 0, 'Name': 1})) 
#         app.logger.info("Fetched game styles")
#         return jsonify(json_util.loads(json_util.dumps(data)))
#     except Exception as e:
#         app.logger.error("Error in fetch_game_styles", exc_info=True)
#         return jsonify({"error": str(e)}), 500

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