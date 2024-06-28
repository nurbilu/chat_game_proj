import os
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables
API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_URL = os.getenv('GEMINI_URL')

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes and methods

@app.route('/generate_text', methods=['POST'])
def generate_text():
    user_input = request.json.get('text')  # Ensure JSON data is correctly parsed
    response = generate_response(user_input)
    return jsonify({'response': response})

def generate_response(text):
    # Placeholder for API call to Gemini model
    # This should include the actual API call logic using requests or similar library
    return "Generated response based on: " + text

if __name__ == '__main__':
    app.run(debug=True)
