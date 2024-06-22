from pymongo import MongoClient
from django.conf import settings

def get_mongo_client():
    client = MongoClient(
        host=settings.MONGO_DB['HOST'],
        port=settings.MONGO_DB['PORT'],
        username=settings.MONGO_DB['USER'],
        password=settings.MONGO_DB['PASSWORD']
    )
    return client[settings.MONGO_DB['NAME']]

