import os
import json
import time
import random
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

# Load environment variables from .env file
load_dotenv()

# Configure Google Generative AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def generate_gemini_response(prompt, db):
    # Fetch additional data from the database to enrich the prompt
    collections = ['races', 'spells', 'equipment', 'monsters', 'game_styles']
    additional_data = {}
    for collection in collections:
        additional_data[collection] = list(db[collection].find())
    
    enriched_prompt = f"{prompt}\n\nAdditional Data:\n{json.dumps(additional_data)}"

    model = genai.GenerativeModel('gemini-1.5-pro')
    chat = model.start_chat(history=[])

    # Implement exponential backoff
    for n in range(5):
        try:
            response = chat.send_message(enriched_prompt)
            return response.text.strip()
        except ResourceExhausted as e:
            if n == 4:
                raise e
            sleep_time = (2 ** n) + random.random()
            time.sleep(sleep_time)

GEM_cnnction = Blueprint('GEM_cnnction', __name__)

@GEM_cnnction.route('/generate_text', methods=['POST'])
def generate_text():
    try:
        data = request.json
        prompt = data.get('prompt', '')
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        # Connect to the database
        client = MongoClient('mongodb://localhost:27017/mike')
        db = client.DnD_AI_DB
        
        response_text = generate_gemini_response(prompt, db)
        return jsonify({'response': response_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500