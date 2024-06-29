import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from pymongo import MongoClient
import random
import logging

# Load environment variables
load_dotenv()
API_KEY = os.getenv('GEMINI_API_KEY')

# Configure Google Generative AI
genai.configure(api_key=API_KEY)

# MongoDB setup
client = MongoClient('mongodb://localhost:27017/mike')
db = client.DnD_AI_DB
fireball_collection = db.fireball

# Fetch fireball prompts
fireball_prompts = list(fireball_collection.find())

# Load initial response text from file
with open('initial_response_text.txt', 'r') as file:
    initial_response_text = file.read()

class ChatbotModel:
    def __init__(self):
        self.model = genai.GenerativeModel(model_name="gemini-1.5-pro")
        self.chat_session = self.model.start_chat(
            history=[{
                "role": "user",
                "parts": [{"text": "You are a DnD Dungeon Master."}]
            }]
        )
        self.user_name = None  # Store user's name

    def set_user_name(self, name):
        self.user_name = name

    def generate_response(self, user_input):
        try:
            response = self.chat_session.send_message(user_input)
            logging.debug(f"Generated response: {response.text}")
            return response.text
        except Exception as e:
            logging.error(f"Error generating response: {e}")
            return "An error occurred while generating the response."

    def roll_dice(self, sides=20):
        """Simulate rolling a dice with a given number of sides."""
        return random.randint(1, sides)

    def generate_game_response(self, user_input):
        if not self.user_name:
            return "Please tell me your name first."
        dice_result = self.roll_dice()
        game_scenario = f"{self.user_name}, as you step into the dark forest, you roll a {dice_result}. "
        game_scenario += "A shadow moves swiftly across your path. What do you do?"
        return game_scenario

    def handle_multiplayer_session(self, session_id, user_input):
        # Retrieve session data from MongoDB
        session_data = db.sessions.find_one({"session_id": session_id})
        player_data = session_data['players']

        # Generate response based on the collective inputs of all players
        response = "Processing the actions of all players..."
        return response

    def perform_skill_check(self, player_id, skill):
        # Fetch player data and skill attributes
        player_stats = db.players.find_one({"player_id": player_id})
        skill_level = player_stats['skills'][skill]
        dice_roll = self.roll_dice()

        # Calculate success based on skill level and dice roll
        if dice_roll + skill_level >= 15:  # Assuming 15 is the difficulty level
            return "Success!"
        else:
            return "Failed!"

    def train_model(self):
        # Example training logic
        for prompt in fireball_prompts:
            self.model.train(prompt['input'], prompt['output'])

# Example usage
if __name__ == "__main__":
    chatbot = ChatbotModel()
    user_input = "I'm ready to start my adventure!"
    response = chatbot.generate_response(user_input)
    print(response)
