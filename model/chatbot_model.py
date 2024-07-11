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
fireball_collection = db.fireball
game_styles_collection = db.game_styles
sessions_collection = db.sessions

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
    def __init__(self, session_data):
        self.session_data = session_data
        self.user_name = session_data.get('username', 'Anonymous')
        self.use_gemini_api = session_data.get('use_gemini_api', False)
        self.client = MongoClient("mongodb://localhost:27017/mike")
        self.db = self.client["DnD_AI_DB"]
        self.prompts_collection = self.db["prompts"]
        self.gemini_connection = GeminiConnection(API_KEY)
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
        if user_input in [1, 2, 3] and self.session_data.get('game_style', 'pending') == 'pending':
            self.session_data['game_style'] = user_input
            self.save_session(self.user_name, self.session_data)
            return game_style_responses[user_input] + " " + self.confirmation_start_text
        elif self.session_data.get('game_style') != 'pending':
            return "Game style already chosen. Continuing adventure..."
        else:
            return "Please choose a valid character style (1, 2, or 3)."

    def logout_user(self):
        # This function is called when the user logs out
        last_prompt = self.session_data['last_prompt']
        self.save_session(self.user_name, self.session_data)
        return last_prompt

    def generate_response(self, user_input, player_name):
        # Check if the user is confirming to start the game after choosing a style
        if user_input.lower() == 'start':
            if 'game_style' in self.session_data and self.session_data['game_style'] in ['1', '2', '3']:
                # Fetch game style data and start the game
                game_style_data = self.fetch_game_style_data(self.session_data['game_style'])
                # Start the game session or generate the game start response
                return self.start_game_session(player_name, game_style_data)
            else:
                return "Please select a game style first."

        # Handle game style selection
        if user_input in ['1', '2', '3']:
            self.session_data['game_style'] = user_input  # Save the game style
            response = game_style_responses[user_input]
            response += "\n\n" + self.confirmation_start_text  # Add confirmation text to prompt user to start
            return response

        # Default response if input is not recognized
        return self.initial_response_text

    def fetch_game_style_data(self, game_style_key):
        game_styles = {
            '1': 'warrior_fighter',
            '2': 'rogue_druid',
            '3': 'mage_sorcerer'
        }
        if game_style_key in game_styles:
            style_name = game_styles[game_style_key]
            style_data = self.db.game_styles.find_one({"name": style_name})
            return style_data
        else:
            return None

    def start_game_session(self, player_name, game_style):
        """Start a new game session with the selected game style."""
        self.chat_session = self.gemini_connection.model.start_chat(
            history=[{
                "role": "system",
                "parts": [{"text": f"Starting game as a {game_style}."}]
            }]
        )
        self.use_gemini_api = True  # Enable Gemini API usage
        return f"Starting game as a {game_style}. Let's begin your adventure!"

    def generate_response_gemini(self, user_input, player_name):
        """Generate response using Gemini API."""
        try:
            # Fetch game style and session context
            game_style = self.db.game_styles.find_one({"style_id": self.session_data.get('game_style')})
            context = game_style['description'] if game_style else "Default game style."
            
            # Generate response using the Gemini model
            return self.gemini_connection.generate_response(user_input, context)
        except Exception as e:
            logging.error(f"Failed to generate response from Gemini API: {str(e)}")
            return "Failed to connect to Gemini API. Please try again later."

    def roll_dice(self, sides=20):
        """Simulate rolling a dice with a given number of sides."""
        return random.randint(1, sides)

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
        if dice_roll + skill_level >= 12:  # Assuming 12 is the difficulty level
            return "Success!"
        else:
            return "Failed!"

    def train_model(self):
        # Example training logic
        for prompt in fireball_prompts:
            self.model.train(prompt['input'], prompt['output'])

    def save_session(self, username, session_data):
        """Update session data in the database."""
        # Ensure the API usage flag is saved
        session_data['use_gemini_api'] = self.use_gemini_api
        db.sessions.update_one({"username": username}, {"$set": session_data}, upsert=True)

    def retrieve_session(self, username):
        """Retrieve session data from the database."""
        session = db.sessions.find_one({"username": username})
        if session:
            self.use_gemini_api = session.get('use_gemini_api', False)
            # Ensure game_style is initialized in session_history
            if 'game_style' not in session.get('session_history', {}):
                session['session_history']['game_style'] = 'default_style'  # Set a default or prompt user to choose
        else:
            # Initialize session with default values if not found
            session = {'username': username, 'session_history': {'game_style': 'default_style'}, 'use_gemini_api': False}
            db.sessions.insert_one(session)
        return session

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