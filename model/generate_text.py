from flask import Flask, request, jsonify, session
from flask_cors import CORS
import requests
import os
import random
import threading
import logging
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi

app = Flask(__name__)
CORS(app)
load_dotenv()
app.config['SECRET_KEY'] = os.getenv('the_secret_key')

# MongoDB connection setup
uri = "mongodb+srv://nurb111:MongoBILU1996@cluster0.luomlfx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri, server_api=ServerApi('1'))

# Test MongoDB connection
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize MongoDB Client
mongo_client = MongoClient(os.getenv('MONGO_URI'))
db = mongo_client['DnD_AI_DB']

@app.route('/chat/', methods=['GET'])
def chat():
    prompt = request.args.get('prompt')
    response = get_gemini_response(prompt)
    return jsonify(response)

def get_gemini_response(prompt):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key"
    headers = {
        'Authorization': f'Bearer {os.getenv("GEMINI_API_KEY")}',
        'Content-Type': 'application/json',
    }
    data = {'prompt': prompt}
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {'error': 'Failed to connect to Gemini API', 'details': str(e)}

@app.route('/roll-dice/', methods=['GET'])
def roll_dice():
    dice_type = request.args.get('type', 20)
    result = random.randint(1, int(dice_type))
    return jsonify({'result': result})

@app.route('/start-session/', methods=['POST'])
def start_session():
    session['players'] = request.json.get('players', [])
    session['game_state'] = 'active'
    return jsonify({'message': 'Session started', 'players': session['players']})

@app.route('/create-character/', methods=['POST'])
def create_character():
    character_data = request.json
    db.characters.insert_one(character_data)
    return jsonify({'message': 'Character created', 'character': character_data})

@app.route('/update-character/', methods=['POST'])
def update_character():
    character_updates = request.json
    db.characters.update_one({'name': character_updates['name']}, {'$set': character_updates})
    return jsonify({'message': 'Character updated', 'character': character_updates})

@app.route('/chat-command/', methods=['GET'])
def chat_command():
    command = request.args.get('command')
    if command == "roll_dice":
        dice_type = request.args.get('type', 20)
        result = random.randint(1, int(dice_type))
        return jsonify({'result': result})
    elif command == "start_game":
        session['game_state'] = 'active'
        return jsonify({'message': 'Game started'})
    # Add more commands as needed
    return jsonify({'error': 'Command not recognized'})

@app.route('/join-session/', methods=['POST'])
def join_session():
    player_name = request.json.get('name')
    db.sessions.update_one({'session_id': 'current_session'}, {'$addToSet': {'players': player_name}}, upsert=True)
    return jsonify({'message': f'{player_name} joined the session'})

def end_turn():
    session['current_turn'] = None
    print("Turn ended due to time limit")

@app.route('/start-turn/', methods=['POST'])
def start_turn():
    turn_duration = 180  # 3 minutes
    session['current_turn'] = request.json.get('player_name')
    timer = threading.Timer(turn_duration, end_turn)
    timer.start()
    return jsonify({'message': f"Turn started for {session['current_turn']}"})

@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f"An error occurred: {str(e)}")
    return jsonify({'error': 'An internal error occurred', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
