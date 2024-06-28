import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai
from pymongo import MongoClient
from bson import json_util

# Load environment variables
load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')

# Configure Google Generative AI
genai.configure(api_key=API_KEY)

app = Flask(__name__)
# Configure CORS properly
CORS(app, resources={r"/generate_text": {"origins": "http://localhost:4200"}})

# Database setup
client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB
sessions = db.first_edition
prompts = db.prompts  # New collection
user_inputs = db.user_inputs  # New collection

# Predefined response for greetings
greeting_response = "Hello there traveler! My name is DeMe and I'll be your chat-like adventure guide and Game Manager. What combat style do you desire?"

# Load game styles from JSON file
def load_game_styles():
    with open('game_styles.json', 'r') as file:
        return json.load(file)

game_styles = load_game_styles()

def serialize_content(content):
    return {
        "parts": [part.text for part in content.parts],
        "role": content.role
    }

def deserialize_content(content_dict):
    return genai.protos.Content(parts=[genai.protos.Part(text=part) for part in content_dict["parts"]], role=content_dict["role"])

@app.route('/generate_text', methods=['POST', 'OPTIONS'])
def generate_text():
    if request.method == "OPTIONS":  # Handle preflight requests
        return _build_cors_preflight_response()
    try:
        text = request.json.get('text', '')
        
        # Store user input into the user_inputs collection
        user_inputs.insert_one({"text": text})
        
        # Directly store the prompt data into MongoDB
        session_id = request.json.get('session_id')
        if session_id:
            chat_session = sessions.find_one({'_id': session_id})
            chat_session["history"] = [deserialize_content(json_util.loads(content)) for content in chat_session["history"]]
        else:
            chat_session = {
                "history": [
                    genai.protos.Content(parts=[genai.protos.Part(text=text)], role="user"),
                    genai.protos.Content(parts=[genai.protos.Part(text="")], role="model")
                ]
            }
            session_id = sessions.insert_one({
                "history": [json_util.dumps(serialize_content(content)) for content in chat_session["history"]]
            }).inserted_id

        # Start a chat session and send a message
        model = genai.GenerativeModel(model_name="gemini-1.5-pro")
        chat_session = model.start_chat(
            history=chat_session["history"]
        )
        response = chat_session.send_message(text)
        
        # Serialize the chat session to a dictionary
        chat_session_dict = {
            "model_name": chat_session.model.model_name,
            "history": [json_util.dumps(serialize_content(content)) for content in chat_session.history]
        }
        
        # Update the session in the database
        sessions.update_one({'_id': session_id}, {"$set": chat_session_dict})

        return jsonify({"text": response.text, "session_id": str(session_id)})  # Ensure the response is properly formatted
    except Exception as e:
        app.logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({"error": str(e)}), 500

def _build_cors_preflight_response():
    response = jsonify({})
    return response

if __name__ == '__main__':
    app.run(debug=True)
