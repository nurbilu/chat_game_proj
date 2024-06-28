from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import logging
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()  # Ensure this is called to load environment variables
app.config['SECRET_KEY'] = os.getenv('the_secret_key')

# Configure logging
logging.basicConfig(level=logging.DEBUG)

@app.route('/chat/', methods=['GET','POST'])
def chat():
    prompt = request.args.get('prompt')
    response = get_gemini_response(prompt)
    return jsonify(response)

def get_gemini_response(prompt):
    url = os.getenv('GEMINI_URL')
    api_key = os.getenv("GEMINI_API_KEY")  # Ensure the API key is being loaded correctly
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }
    data = {'prompt': prompt}
    try:
        # Correctly format the URL to use the Pro model
        full_url = f"{url}{api_key}"
        response = requests.post(full_url, headers=headers, json=data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return {'error': 'Failed to connect to Gemini API', 'details': str(e)}

@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f"An error occurred: {str(e)}")
    return jsonify({'error': 'An internal error occurred', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
