import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from pymongo import MongoClient
from bson import json_util
from flask_socketio import SocketIO
import random

# Load environment variables
load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')

# Configure Google Generative AI
genai.configure(api_key=API_KEY)

app = Flask(__name__)
socketio = SocketIO(app)
# Configure CORS properly
CORS(app, resources={r"/generate_text": {"origins": "http://localhost:4200"}})

# Database setup
client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB
sessions = db.first_edition
fireball_collection = db.fireball

# Fetch fireball prompts
fireball_prompts = list(fireball_collection.find())

@app.route('/generate_text', methods=['POST'])
def generate_text():
    try:
        data = request.json
        text = data.get('text', '')

        # Insert user input into MongoDB
        db.user_inputs.insert_one({"text": text})

        # Check if the input text is a greeting
        if any(prompt.get('text', '').lower() in text.lower() for prompt in fireball_prompts):
            response_text = "hello there traveler ! My name is DeMe and i'll be your chat like adventure guide and Game Manager , what combat style do you desire?"
        else:
            # Start a chat session and send a message
            model = genai.GenerativeModel(model_name="gemini-1.5-pro")
            chat_session = model.start_chat(
                history=[{"role": "system", "content": "You are a DnD Dungeon Master."}]
            )
            response = chat_session.send_message(text)
            response_text = response.text

        return jsonify({"text": response_text})
    except Exception as e:
        app.logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True)
