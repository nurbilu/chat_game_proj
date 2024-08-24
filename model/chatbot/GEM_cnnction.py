import os
import json
import time
import random
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import google.generativeai as genai
from google.api_core.exceptions import ResourceExhausted

# Load environment variables from .env file
load_dotenv()

# Configure Google Generative AI
genai.configure(api_key=os.getenv('GEMINI_API_KEY1'))

# Initialize MongoDB client
client = MongoClient(os.getenv('MONGO_ATLAS'), server_api=ServerApi('1'))
db = client[os.getenv('DB_NAME_MONGO')]

def generate_gemini_response(prompt, db):
    collections = ['Races', 'Spells', 'Equipment', 'Monsters', 'Classes']
    additional_data = {collection: list(db[collection].find()) for collection in collections}
    enriched_prompt = f"{prompt}\n\nAdditional Data:\n{json.dumps(additional_data)}"

    model = genai.GenerativeModel('gemini-1.5-pro')
    chat = model.start_chat(history=[])

    for n in range(5):
        try:
            response = chat.send_message(enriched_prompt)
            return response.text.strip()
        except ResourceExhausted as e:
            if n == 4:
                raise e
            time.sleep((2 ** n) + random.random())

GEM_cnnction = Blueprint('GEM_cnnction', __name__)

# @GEM_cnnction.route('/generate_text', methods=['POST'])
# def generate_text():
#     try:
#         data = request.json
#         prompt = data.get('prompt', '')
#         if not prompt:
#             return jsonify({'error': 'Prompt is required'}), 400
#         
#         response_text = generate_gemini_response(prompt, db)
#         return jsonify({'response': response_text})
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500