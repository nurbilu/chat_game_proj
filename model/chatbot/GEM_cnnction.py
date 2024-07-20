import openai
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def generate_gemini_response(prompt):
    # Get the API key and URL from environment variables
    api_key = os.getenv('GEMINI_API_KEY')
    api_url = os.getenv('GEMINI_URL')
    
    if not api_key or not api_url:
        raise ValueError("GEMINI_API_KEY or GEMINI_URL is not set in the environment variables")
    
    openai.api_key = api_key

    response = openai.Completion.create(
        engine="text-davinci-002",
        prompt=prompt,
        max_tokens=150
    )

    return response.choices[0].text.strip()