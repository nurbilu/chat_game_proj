import openai
import os
from dotenv import load_dotenv

load_dotenv()

# Configure OpenAI API
openai.api_key = os.getenv('OPENAI_API_KEY')
models = openai.Model.list()
print(models)