import requests
from django.conf import settings 

def get_gemini_response(prompt):
    url = "https://ai.google.dev/gemini-api"  # Updated with the actual Gemini endpoint
    headers = {
        'Authorization': f'Bearer {settings.GEMINI_API_KEY}',
        'Content-Type': 'application/json',
    }
    data = {'prompt': prompt}
    try:
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        return response.json()
    except requests.exceptions.RequestException as e:
        # Log the error and return a meaningful error message
        print(f"Error connecting to Gemini API: {e}")
        return {'error': 'Failed to connect to Gemini API', 'details': str(e)}
