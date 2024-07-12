import google.generativeai as genai
import logging

class GeminiConnection:
    def __init__(self, api_key):
        self.api_key = api_key
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model_name="gemini-1.5-pro")

    def generate_response(self, prompt, context):
        try:
            response = self.model.generate_content(f"{context}\n{prompt}")
            return response.text
        except Exception as e:
            error_message = f"Failed to connect to Gemini API: {str(e)}"
            logging.error(error_message)
            return error_message