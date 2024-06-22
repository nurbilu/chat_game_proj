# app/ai_platform.py
from google.cloud import aiplatform
from google.oauth2 import service_account
import os

def initialize_ai_platform():
    credentials = service_account.Credentials.from_service_account_file(
        os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    )
    aiplatform.init(credentials=credentials)

from google.cloud import aiplatform_v1

def predict(project: str, endpoint_id: str, instances: list, location: str = "us-central1"):
    client_options = {"api_endpoint": f"{location}-aiplatform.googleapis.com"}
    client = aiplatform_v1.PredictionServiceClient(client_options=client_options)

    endpoint = client.endpoint_path(project=project, location=location, endpoint=endpoint_id)
    response = client.predict(endpoint=endpoint, instances=instances)
    return response.predictions
