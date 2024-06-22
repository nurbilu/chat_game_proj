from pymongo import MongoClient
from pymongo.server_api import ServerApi
import os

def get_mongo_client():
    uri = os.getenv('MONGO_URI')
    if not uri:
        raise EnvironmentError("MONGO_URI environment variable not set or empty.")
    print(f"Attempting to connect to MongoDB with URI: {uri}")  # Debugging output
    try:
        client = MongoClient(uri, server_api=ServerApi('1'))
        # Test the connection
        client.admin.command('ping')
    except Exception as e:
        raise ConnectionError(f"Failed to connect to MongoDB: {e}")
    return client

def get_database(client, db_name='DnD_AI_DB'):
    return client[db_name]

if __name__ == '__main__':
    client = get_mongo_client()
    db = get_database(client)
    print(db)