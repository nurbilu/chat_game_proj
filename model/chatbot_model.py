import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient
import random
import logging
from GEM_cnnction import GeminiConnection

# Load environment variables
load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')

# Check if API_KEY is loaded correctly
if not API_KEY:
    raise ValueError("API Key for Gemini is not loaded. Check your .env file.")

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB
sessions_collection = db.sessions
fireball_collection = db.fireball

class ChatbotModel:
    def __init__(self, session_data):
        self.session_data = session_data
        self.gemini_connection = GeminiConnection(API_KEY)

    def handle_player_input(self, user_input):
        context = self.session_data.get('context', '')
        if not context:  # Check if context is empty
            context = self.fetch_game_data(self.session_data['username'])
        game_response = self.process_game_logic(user_input, context)
        response = self.gemini_connection.generate_response(game_response, context)
        self.update_context(user_input, response)
        return response

    def fetch_game_data(self, username):
        """Fetch game data from multiple collections and construct context."""
        collections = ['races', 'spells', 'equipment', 'monsters', 'game_styles']
        game_data = {}
        for collection in collections:
            game_data[collection] = list(db[collection].find({}, {'_id': 0}))

        # Fetch character creation data for the specific user
        character_data = db.character_creation_users.find_one({'username': username}, {'_id': 0})
        if character_data:
            game_data['character_creation'] = character_data

        # Construct context from game data
        context = json.dumps(game_data)  # Convert dictionary to JSON string for the API
        return context

    def process_game_logic(self, user_input, context):
        # Implement game logic based on user input and context
        if "play" in user_input.lower():
            # Example: Decide which game to play based on context or suggest new games
            return "Starting your game based on previous interactions..."
        return user_input

    def handle_combat(self, user_input):
        # Simplified combat logic
        if not self.game_state['combat']:
            self.game_state['combat'] = True
            return "Combat starts! What's your first move?"
        return "You swing your sword at the enemy!"

    def update_context(self, user_input, response):
        # Append new interaction to the context
        new_context = f"{self.session_data.get('context', '')}\nUser: {user_input}\nBot: {response}"
        self.session_data['context'] = new_context
        self.save_session(self.session_data['username'], self.session_data)

    def save_session(self, username, session_data):
        """Update session data in the database."""
        db.sessions.update_one({"username": username}, {"$set": session_data}, upsert=True)

    def retrieve_session(self, username):
        """Retrieve session data from the database."""
        session = db.sessions.find_one({"username": username})
        if not session:
            session = {'username': username, 'use_gemini_api': False}
            db.sessions.insert_one(session)
        return session

    def logout_user(self):
        """Retrieve only the last chatbot prompt on logout."""
        session = self.retrieve_session(self.user_name)
        if session:
            last_prompt = session.get('last_prompt', "No chatbot response found.")
            return last_prompt
        return "No session data available."

    def get_game_data_for_user(self, username):
        user_data = db.character_creation_users.find_one({"username": username})
        if not user_data:
            return {"message": "Welcome to the game! Let's start your adventure."}
        # Fetch additional data based on user's game style and character
        game_style = db.game_styles.find_one({"style": user_data['gameStyle']})
        race_data = db.races.find_one({"index": user_data['race']})
        # Add more data fetching as needed
        return {"game_style": game_style, "race": race_data}

# Example usage
if __name__ == "__main__":
    dummy_session_data = {'username': 'default_username', 'use_gemini_api': False}
    chatbot = ChatbotModel(dummy_session_data)
    user_input = "I'm ready to start my adventure!"
    response = chatbot.handle_player_input(user_input)
    print(response)