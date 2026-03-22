# seed_db.py
import os
import uuid
from datetime import datetime, UTC
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://garyc4088:Meghank1@skillsphere.wk5x60k.mongodb.net/")
client = MongoClient(MONGO_URI)
db = client["skillswap"]

def seed():
    print("🌱 Starting Database Seeding...")

    # 1. Clear existing data (optional, but good for a fresh seed)
    # db.users.delete_many({})
    # db.resources.delete_many({})
    # print("🧹 Cleared existing users and resources.")

    # 2. Sample Users
    sample_users = [
        {
            "firstName": "Sarah",
            "lastName": "Mitchell",
            "email": "sarah.m@example.com",
            "password": generate_password_hash("password123"),
            "interests": ["Coding", "Art", "Design"],
            "skillLevel": "Expert",
            "created_at": datetime.now(UTC),
            "profile": {
                "bio": "UI/UX Designer and React Developer with 8 years of experience. I love teaching others how to build beautiful apps.",
                "skills": ["Figma", "React", "TypeScript", "Tailwind CSS"],
                "profileImage": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
            }
        },
        {
            "firstName": "James",
            "lastName": "Chen",
            "email": "james.c@example.com",
            "password": generate_password_hash("password123"),
            "interests": ["Music", "Cooking", "Photography"],
            "skillLevel": "Intermediate",
            "created_at": datetime.now(UTC),
            "profile": {
                "bio": "Jazz pianist and amateur chef. Always looking to exchange cooking tips for music theory lessons.",
                "skills": ["Piano", "Music Theory", "Italian Cuisine", "Food Photography"],
                "profileImage": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
            }
        },
        {
            "firstName": "Elena",
            "lastName": "Rodriguez",
            "email": "elena.r@example.com",
            "password": generate_password_hash("password123"),
            "interests": ["Writing", "Languages", "History"],
            "skillLevel": "Beginner",
            "created_at": datetime.now(UTC),
            "profile": {
                "bio": "Aspiring novelist and history buff. I can help with Spanish translation and creative writing.",
                "skills": ["Spanish", "Creative Writing", "Copy Editing"],
                "profileImage": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
            }
        }
    ]

    for user in sample_users:
        if not db.users.find_one({"email": user["email"]}):
            db.users.insert_one(user)
            print(f"✅ Created user: {user['email']}")
        else:
            print(f"⏭️ User {user['email']} already exists. Skipping.")

    # 3. Sample Resources
    sample_resources = [
        # Coding
        {
            "title": "Mastering React Hooks",
            "category": "Coding",
            "description": "A comprehensive guide to useEffect, useMemo, and custom hooks.",
            "author": "sarah.m@example.com",
            "likes": 45,
            "created_at": datetime.now(UTC)
        },
        {
            "title": "Introduction to Python for Data Science",
            "category": "Coding",
            "description": "Learn NumPy, Pandas, and Matplotlib from scratch.",
            "author": "sarah.m@example.com",
            "likes": 32,
            "created_at": datetime.now(UTC)
        },
        # Music
        {
            "title": "Jazz Improvisation Basics",
            "category": "Music",
            "description": "Understanding the circle of fifths and basic blues scales.",
            "author": "james.c@example.com",
            "likes": 28,
            "created_at": datetime.now(UTC)
        },
        {
            "title": "How to Read Sheet Music",
            "category": "Music",
            "description": "A simple guide for beginners to start reading notes on the staff.",
            "author": "james.c@example.com",
            "likes": 15,
            "created_at": datetime.now(UTC)
        },
        # Cooking
        {
            "title": "Perfect Homemade Pasta",
            "category": "Cooking",
            "description": "The secret to the perfect dough and three classic sauces.",
            "author": "james.c@example.com",
            "likes": 56,
            "created_at": datetime.now(UTC)
        },
        # Art & Design
        {
            "title": "Color Theory for Web Design",
            "category": "Art",
            "description": "How to pick palettes that improve accessibility and user experience.",
            "author": "sarah.m@example.com",
            "likes": 89,
            "created_at": datetime.now(UTC)
        },
        {
            "title": "Digital Illustration for Beginners",
            "category": "Art",
            "description": "Getting started with Procreate and basic brush techniques.",
            "author": "sarah.m@example.com",
            "likes": 41,
            "created_at": datetime.now(UTC)
        }
    ]

    for res in sample_resources:
        if not db.resources.find_one({"title": res["title"]}):
            db.resources.insert_one(res)
            print(f"✅ Created resource: {res['title']}")
        else:
            print(f"⏭️ Resource '{res['title']}' already exists. Skipping.")

    print("\n✨ Seeding Complete! Your app is now ready with sample data.")

if __name__ == "__main__":
    seed()
