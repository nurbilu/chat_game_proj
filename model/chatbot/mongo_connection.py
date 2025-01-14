import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
import logging
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

def get_mongo_client(max_retries=5, retry_delay=5):
    """
    Creates a MongoDB client with retry logic
    """
    MONGO_ATLAS = os.getenv("MONGO_ATLAS")
    DB_NAME_MONGO = os.getenv("DB_NAME_MONGO")
    
    for attempt in range(max_retries):
        try:
            # Create client with server API and increased timeouts
            client = MongoClient(
                MONGO_ATLAS,
                server_api=ServerApi('1'),
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                maxPoolSize=100,
                retryWrites=True,
                retryReads=True
            )
            
            # Test connection
            client.admin.command('ping')
            db = client[DB_NAME_MONGO]
            
            logging.info("Successfully connected to MongoDB")
            return client, db
            
        except Exception as e:
            if attempt < max_retries - 1:
                logging.warning(f"MongoDB connection attempt {attempt + 1} failed: {str(e)}")
                time.sleep(retry_delay)
            else:
                logging.error(f"Failed to connect to MongoDB after {max_retries} attempts: {str(e)}")
                raise

def init_mongo():
    """
    Initialize MongoDB connection with retry logic
    """
    try:
        client, db = get_mongo_client()
        return client, db
    except Exception as e:
        logging.error(f"MongoDB initialization failed: {str(e)}")
        raise 