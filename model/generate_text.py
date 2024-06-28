from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import logging
from dotenv import load_dotenv
import google.generativeai as genai

app = Flask(__name__)
CORS(app)
load_dotenv()  # Ensure this is called to load environment variables
app.config['SECRET_KEY'] = os.getenv('the_secret_key')

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Configure the API key for Google Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.route('/chat/', methods=['GET','POST'])
def chat():
    prompt = request.args.get('prompt')
    response = get_gemini_response(prompt)
    return jsonify(response)

def get_gemini_response(prompt):
    # Define the generation configuration
    generation_config = {
        "temperature": 0.9,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 150,
        "response_mime_type": "text/plain",
    }

    # Create a model instance with the specified configuration
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config
    )

    # Generate a response using the model
    try:
        # Using the correct method 'complete' as per the Google Colab documentation
        response = model.complete(prompt=prompt)
        return {'text': response.text}
    except Exception as e:
        logging.error(f"Failed to generate response: {str(e)}")
        return {'error': 'Failed to connect to Gemini API', 'details': str(e)}

@app.errorhandler(Exception)
def handle_exception(e):
    logging.error(f"An error occurred: {str(e)}")
    return jsonify({'error': 'An internal error occurred', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
