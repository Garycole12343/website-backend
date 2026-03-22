import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://garyc4088:Meghank1@skillsphere.wk5x60k.mongodb.net/")
print(f"Connecting to: {MONGO_URI}")

try:
    client = MongoClient(MONGO_URI)
    db = client["skillswap"]
    print(f"Collections: {db.list_collection_names()}")
    
    users = db["users"].count_documents({})
    resources = db["resources"].count_documents({})
    
    print(f"Users: {users}")
    print(f"Resources: {resources}")
except Exception as e:
    print(f"Error: {e}")
