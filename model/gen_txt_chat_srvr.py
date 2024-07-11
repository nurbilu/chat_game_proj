import os
import json
import logging
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin  # Import the CORS extension
from chatbot_model import ChatbotModel  # Import the ChatbotModel
from flask_socketio import SocketIO, emit
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__)
# Configure CORS properly to ensure only one header is sent
CORS(app, support_credentials=True, resources={r"/generate_text": {"origins": "http://localhost:4200"}})
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


# Game style responses
game_style_responses = {
    "1": "You've chosen the Warrior Fighter style. Prepare for close combat and heroic feats!",
    "2": "You've selected the Rogue Druid style. Get ready for stealth and nature magic!",
    "3": "You've picked the Mage Sorcerer style. Arcane power is at your fingertips!"
}

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/mike')
db = client['DnD_AI_DB']

# At the top of the file, add a dictionary to track user sessions
user_sessions = {}

@app.route('/generate_text', methods=['POST', 'OPTIONS'])
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def generate_text():
    print("Request received")
    print("Request JSON:", request.json)
    user_input = request.json.get('text')
    player_name = request.json.get('username')

    # Retrieve or initialize session data
    session_data = db.sessions.find_one({"username": player_name})
    if not session_data:
        session_data = {"username": player_name, "history": [], "use_gemini_api": False}
        db.sessions.insert_one(session_data)

    chatbot = ChatbotModel(session_data)
    response_text = chatbot.generate_response(user_input, player_name)
    if "Failed to connect to Gemini API" in response_text:
        return jsonify({'error': 'API Error', 'message': 'Failed to connect to Gemini API'}), 503

    # Update session history and save
    session_data['history'].append({"user": user_input, "bot": response_text, "timestamp": datetime.now()})
    db.sessions.update_one({"username": player_name}, {"$set": session_data})
    return jsonify({'text': response_text, 'username': player_name}), 200

@app.route('/logout', methods=['POST'], endpoint='logout_post')
def logout():
    player_name = request.json.get('username', 'default_username')
    session_data = db.sessions.find_one({"username": player_name})
    chatbot = ChatbotModel(session_data)
    last_prompt = chatbot.logout_user()
    return jsonify({"last_prompt": last_prompt}), 200

@socketio.on('connect')
def handle_connect():
    emit('response', {'message': 'Connected to the chat server!'})

@socketio.on('send_message')
def handle_message(data):
    player_name = data.get('username', 'Anonymous')
    user_input = data.get('text', '').strip()

    chatbot = ChatbotModel()
    session_history = chatbot.retrieve_session(player_name)

    response_text = chatbot.generate_response(user_input, player_name)
    emit('response', {'text': response_text, 'username': player_name})
    chatbot.save_session(player_name, session_history)  # Ensure session is saved after handling

if __name__ == '__main__':
    socketio.run(app, debug=True)