from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, UTC
from bson import ObjectId
import uuid

app = Flask(__name__)

# -----------------------------
# CORS
# -----------------------------
CORS(app, resources={r"/api/*": {"origins": "*"}})

# -----------------------------
# MongoDB
# -----------------------------
client = MongoClient("mongodb://localhost:27017/")
db = client["skillswap"]

users = db["users"]
resources = db["resources"]
conversations = db["conversations"]
contacts = db["contacts"]

print("✅ MongoDB skillswap.users ready!")
print("✅ MongoDB skillswap.resources ready!")
print("✅ MongoDB skillswap.conversations ready!")
print("✅ MongoDB skillswap.contacts ready!")

# -----------------------------
# Home
# -----------------------------
@app.get("/")
def home():
    return jsonify({"message": "Flask + MongoDB Backend Live!"})

# =====================================================
# AUTH
# =====================================================
@app.post("/api/register")
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    required = ["firstName", "lastName", "email", "password", "interests", "skillLevel"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"message": "Missing fields", "missing": missing}), 400

    email = str(data["email"]).strip().lower()
    if users.find_one({"email": email}):
        return jsonify({"message": "Email already registered"}), 409

    if len(data["password"]) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    user = {
        "firstName": data["firstName"].strip(),
        "lastName": data["lastName"].strip(),
        "email": email,
        "password": generate_password_hash(data["password"]),
        "interests": data["interests"],
        "skillLevel": data["skillLevel"],
        "profile": {},
        "created_at": datetime.now(UTC)
    }

    users.insert_one(user)
    print(f"🆕 User registered: {email}")
    return jsonify({"message": "User created"}), 201


@app.post("/api/login")
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    user = users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    user["id"] = str(user["_id"])
    user.pop("_id", None)
    user.pop("password", None)

    print(f"🔑 User logged in: {email}")
    return jsonify({"user": user}), 200

# =====================================================
# MESSAGES / CONVERSATIONS
# =====================================================

# GET /api/messages?email=user@gmail.com
@app.get("/api/messages")
def get_conversations():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"message": "Email required"}), 400

    query = {
        "$or": [
            {"participants.0": email},
            {"participants.1": email}
        ]
    }

    docs = list(conversations.find(query).sort("updated_at", -1))

    for conv in docs:
        conv["id"] = conv.get("id", str(conv["_id"]))
        conv.pop("_id", None)

    print(f"📨 Loaded {len(docs)} conversations for {email}")
    return jsonify({"conversations": docs}), 200


# POST /api/messages/conversation
@app.post("/api/messages/conversation")
def create_conversation():
    data = request.get_json(silent=True)
    if not data or "participants" not in data:
        return jsonify({"message": "participants array required"}), 400

    participants = [p.strip().lower() for p in data["participants"]]
    if len(participants) != 2:
        return jsonify({"message": "Exactly 2 participants required"}), 400

    # Prevent duplicate conversations
    existing = conversations.find_one({
        "participants": {"$all": participants}
    })
    if existing:
        existing["id"] = existing.get("id", str(existing["_id"]))
        existing.pop("_id", None)
        return jsonify({"conversation": existing}), 200

    conv_id = str(uuid.uuid4())
    conversation = {
        "id": conv_id,
        "participants": participants,
        "messages": [],
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }

    conversations.insert_one(conversation)
    print(f"🆕 Created conversation {conv_id}: {participants}")
    return jsonify({"conversation": conversation}), 201


# POST /api/messages/send
@app.post("/api/messages/send")
def send_message():
    data = request.get_json(silent=True)
    if not data or not all(k in data for k in ["conversationId", "sender", "text"]):
        return jsonify({"message": "conversationId, sender, text required"}), 400

    conv_id = data["conversationId"]
    sender = data["sender"].strip().lower()
    text = data["text"].strip()

    if not text:
        return jsonify({"message": "Message cannot be empty"}), 400

    message = {
        "sender": sender,
        "text": text,
        "timestamp": datetime.now(UTC)
    }

    result = conversations.update_one(
        {"id": conv_id},
        {
            "$push": {"messages": message},
            "$set": {"updated_at": datetime.now(UTC)}
        }
    )

    if result.modified_count == 0:
        return jsonify({"message": "Conversation not found"}), 404

    conv = conversations.find_one({"id": conv_id})
    conv["id"] = conv_id
    conv.pop("_id", None)

    print(f"💬 Message sent in {conv_id}")
    return jsonify({"conversation": conv}), 200


# =====================================================
# CONTACT FORM
# =====================================================
@app.post("/api/contact")
def submit_contact():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No data provided"}), 400

    contact = {
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "message": data.get("message", ""),
        "created_at": datetime.now(UTC)
    }

    contacts.insert_one(contact)
    print("📩 New contact form submission")
    return jsonify({"message": "Message sent"}), 201


# =====================================================
# RUN
# =====================================================
print("\n📍 Registered routes:")
for rule in app.url_map.iter_rules():
    print(rule)
if __name__ == "__main__":
    app.run(debug=True)
