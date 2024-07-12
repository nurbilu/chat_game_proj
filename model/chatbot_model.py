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

class ChatbotModel:
    def __init__(self, session_data):
        self.session_data = session_data
        self.gemini_connection = GeminiConnection(API_KEY)

    def handle_player_input(self, user_input):
        if self.session_data.get('use_gemini_api', True):  # Assume using Gemini by default
            context = self.session_data.get('context', '')
            response = self.gemini_connection.generate_response(user_input, context)
            self.update_context(user_input, response)
            return response
        else:
            return "Let's continue your journey!"

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

# Example usage
if __name__ == "__main__":
    dummy_session_data = {'username': 'default_username', 'use_gemini_api': False}
    chatbot = ChatbotModel(dummy_session_data)
    user_input = "I'm ready to start my adventure!"
    response = chatbot.handle_player_input(user_input)
    print(response)