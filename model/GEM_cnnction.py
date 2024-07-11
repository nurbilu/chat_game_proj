import google.generativeai as genai
import logging

class GeminiConnection:
    def __init__(self, api_key):
        self.api_key = api_key
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(model_name="gemini-1.5-pro")

    def generate_response(self, prompt, context):
        try:
            # Incorporate context into the prompt
            full_prompt = f"{context}\n{prompt}"
            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            logging.error(f"Failed to generate response from Gemini API: {str(e)}")
            return "Failed to connect to Gemini API. Please try again later."