import google.generativeai as genai
import logging
import json

class GeminiConnection:
    def __init__(self, api_key):
        self.api_key = api_key
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model_name="gemini-1.5-pro")

    def generate_response(self, prompt, context):
        try:
            # Generate response using the Gemini API with both prompt and context
            response = self.model.generate_content({"prompt": prompt, "context": context})
            return response.text
        except Exception as e:
            logging.error(f"Failed to connect to Gemini API: {str(e)}")
            return "An error occurred while connecting to the Gemini API."