import os
import json
import logging
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin  # Import the CORS extension
from chatbot_model import ChatbotModel  # Import the ChatbotModel
from flask_socketio import SocketIO, emit
from pymongo import MongoClient

app = Flask(__name__)
# Configure CORS properly to ensure only one header is sent
CORS(app, resources={r"/generate_text": {"origins": "http://localhost:4200"}})
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

# Load initial response text
with open('initial_response_text.txt', 'r') as file:
    initial_response_text = file.read()

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
@logger  # Apply the logging decorator
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def generate_text():
    print("Request received")
    print("Request JSON:", request.json)  # Log the incoming JSON data
    if not request.json or 'text' not in request.json or 'username' not in request.json:
        return jsonify({'error': 'Bad request', 'message': 'Missing "text" or "username" field'}), 400

    user_input = request.json['text']
    player_name = request.json['username']
    session_data = db.sessions.find_one({"username": player_name})  # Retrieve session data from the database

    if not session_data:
        print("Session data not found for user:", player_name)
        # Initialize default session data if not found
        session_data = {"username": player_name, "history": [], "use_gemini_api": False}
        db.sessions.insert_one(session_data)  # Ensure the session is saved back to the database

    # Handle game style setting and starting game
    if 'game_style' not in session_data or session_data['game_style'] == 'pending':
        if not user_input.isdigit() or int(user_input) not in [1, 2, 3]:
            return jsonify({'text': "Please choose a valid game style number (1, 2, or 3).", 'username': player_name}), 200
        else:
            session_data['game_style'] = user_input
            db.sessions.update_one({"username": player_name}, {"$set": session_data})
            return jsonify({'text': "Game style set. Confirm to start the game with 'start'.", 'username': player_name}), 200

    # Generate response and update session history
    chatbot = ChatbotModel(session_data)
    response_text = chatbot.generate_response(user_input, player_name)
    session_data['history'].append({"user": user_input, "bot": response_text})
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
    user_input = data.get('text', '').strip()
    player_name = data.get('username', 'Anonymous')

    # Retrieve session history from the database
    chatbot = ChatbotModel()
    session_history = chatbot.retrieve_session(player_name)

    # Check if the user needs to choose a game style or confirm to start
    if 'game_style' not in session_history or session_history['game_style'] == 'pending':
        while True:
            if not user_input.isdigit() or int(user_input) not in [1, 2, 3]:
                emit('response', {'text': "Please choose a valid game style number (1, 2, or 3).", 'username': player_name})
                return  # Exit the function to wait for new input
            else:
                session_history['game_style'] = user_input
                chatbot.save_session(player_name, session_history)
                emit('response', {'text': "Game style set. Confirm to start the game with 'start'.", 'username': player_name})
                return

    # Check if user confirms to start the game
    if user_input.lower() == 'start':
        chatbot.use_gemini_api = True  # Enable Gemini API usage
        emit('response', {'text': "Game started using Gemini API.", 'username': player_name})
        return

    # Generate response using the appropriate method
    if chatbot.use_gemini_api:
        response_text = chatbot.generate_response_gemini(user_input, player_name)
    else:
        response_text = chatbot.generate_response(user_input, player_name)

    # Save the updated session history
    updated_history = session_history + [{"user": user_input, "bot": response_text}]
    chatbot.save_session(player_name, updated_history)

    emit('response', {'text': response_text, 'username': player_name})

if __name__ == '__main__':
    socketio.run(app, debug=True)
