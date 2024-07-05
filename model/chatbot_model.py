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

# Load initial and confirmation texts
with open('initial_response_text.txt', 'r') as file:
    initial_response_text = file.read()

with open('confirmation_start.txt', 'r') as file:
    confirmation_start_text = file.read()

# Game style choice responses
game_style_responses = {
    '1': "You've chosen the path of the brave warrior, wielding a mighty sword/axe/mace and shield or a mighty great weapon to your choosing.",
    '2': "You've chosen the path of the cunning rogue, with stealth and agility as your allies.",
    '3': "You've chosen the path of the wise wizard, harnessing the power of magic to bend reality."
}

class ChatbotModel:
    def __init__(self, session_data={}):
        self.session_history = session_data
        self.user_name = session_data.get('username', 'Anonymous')
        self.use_gemini_api = session_data.get('use_gemini_api', False)
        self.client = MongoClient("mongodb://localhost:27017/mike")
        self.db = self.client["DnD_AI_DB"]
        self.prompts_collection = self.db["prompts"]
        self.model = genai.GenerativeModel(model_name="gemini-1.5-pro")
        self.chat_session = None  # Initialize chat session as None

        # Load initial and confirmation texts
        with open('initial_response_text.txt', 'r') as file:
            self.initial_response_text = file.read()

        with open('confirmation_start.txt', 'r') as file:
            self.confirmation_start_text = file.read()

    def set_user_name(self, name):
        self.user_name = name
        if not self.character_created:  # Only reset if character hasn't been created yet
            self.character_created = True  # Mark character as created

    def update_game_style(self, user_input):
        if user_input in ['1', '2', '3'] and self.session_history.get('game_style', 'pending') == 'pending':
            self.session_history['game_style'] = user_input
            self.save_session(self.user_name, self.session_history)
            return game_style_responses[user_input] + " " + self.confirmation_start_text
        elif self.session_history.get('game_style') != 'pending':
            return "Game style already chosen. Continuing adventure..."
        else:
            return "Please choose a valid character style (1, 2, or 3)."

    def logout_user(self):
        # This function is called when the user logs out
        last_prompt = self.session_history['last_prompt']
        self.save_session(self.user_name, self.session_history)
        return last_prompt

    def generate_response(self, user_input, player_name):
        # Check if character creation is complete and start game
        if self.session_history.get('game_style') != 'pending' and user_input.lower() in ['start', 'start session', '1']:
            self.start_game_session(player_name, game_style_responses[self.session_history['game_style']])
            return "Game started. What's your first move?"
        elif self.session_history.get('game_style') == 'pending':
            return self.update_game_style(user_input)
        else:
            # Normal response generation
            if self.use_gemini_api:
                return self.generate_response_gemini(user_input, player_name)
            else:
                return "Please confirm to start the game by typing 'start'."

    def start_game_session(self, player_name, game_style):
        """Start a new game session with the selected game style."""
        self.chat_session = self.model.start_chat(
            history=[{
                "role": "system",
                "parts": [{"text": f"Starting game as a {game_style}."}]
            }]
        )
        self.use_gemini_api = True  # Enable Gemini API usage

    def generate_response_gemini(self, user_input, player_name):
        """Generate response using Gemini API."""
        response = self.model.generate_content(user_input, context=self.chat_session)
        return response.text

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

    def save_session(self, username, session_data):
        """Save session data to the database."""
        db.sessions.update_one({"username": username}, {"$set": {"history": session_data}}, upsert=True)

    def retrieve_session(self, username):
        """Retrieve session data from the database."""
        session = db.sessions.find_one({"username": username})
        return session['history'] if session else []

    def logout_user(self):
        """Retrieve only the last chatbot prompt on logout."""
        session = self.retrieve_session(self.user_name)
        if session:
            last_prompt = session[-1]['bot'] if 'bot' in session[-1] else "No chatbot response found."
            return last_prompt
        return "No session data available."

# Example usage
if __name__ == "__main__":
    dummy_session_data = {'username': 'default_username', 'use_gemini_api': False}
    chatbot = ChatbotModel(dummy_session_data)
    user_input = "I'm ready to start my adventure!"
    response = chatbot.generate_response(user_input, dummy_session_data['username'])
    print(response)
