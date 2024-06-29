import os
import json
import logging
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS, cross_origin
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, verify_jwt_in_request
from chatbot_model import ChatbotModel  # Import the ChatbotModel

app = Flask(__name__)
CORS(app)

# Configure the JWT_SECRET_KEY
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_secret_key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 700 # 11.7 minutes
app.config['JWT_IDENTITY_CLAIM'] = 'username'
jwt = JWTManager(app)

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Load initial response text
with open('initial_response_text.txt', 'r') as file:
    initial_response_text = file.read()

# Game style responses
game_style_responses = {
    "1": "You've chosen the Warrior Fighter style. Prepare for close combat and heroic feats!",
    "2": "You've selected the Rogue Druid style. Get ready for stealth and nature magic!",
    "3": "You've picked the Mage Sorcerer style. Arcane power is at your fingertips!"
}

# Instantiate the ChatbotModel
chatbot = ChatbotModel()

@app.route('/generate_text', methods=['POST', 'OPTIONS'])
@cross_origin()
@jwt_required()
def generate_text():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()

    try:
        data = request.get_json()
        logging.debug(f"Received data: {data}")
        
        if not data or 'text' not in data:
            logging.error("Invalid request payload")
            return jsonify({"text": "Invalid request payload"}), 422
        
        user_input = data.get('text', '')
        username = get_jwt_identity()
        
        if not username:
            return jsonify({"text": "Please log in to continue."})
        
        # Set the username in the chatbot model
        chatbot.set_user_name(username)
        
        if user_input in ['1', '2', '3']:
            response = game_style_responses[user_input]
            return jsonify({"text": f"{response}\n\nAre you ready to start your adventure, {username}? (Press Enter or type any form of 'yes' to begin)"}), 200
        
        if user_input.lower() in ['', 'y', 'yes', 'yeah', 'yep', 'sure', 'ok', 'okay']:
            # Generate the start of the adventure using the chatbot model
            response_text = chatbot.generate_game_response(user_input)
            return jsonify({"text": response_text}), 200
        
        # Generate a response using the chatbot model
        response_text = chatbot.generate_response(user_input)
        logging.debug(f"Generated response: {response_text}")
        return jsonify({"text": response_text}), 200
    except Exception as e:
        logging.error(f"Error processing request: {e}")
        return jsonify({"text": "An error occurred while processing your request."}), 400

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

if __name__ == '__main__':
    app.run(debug=True)
