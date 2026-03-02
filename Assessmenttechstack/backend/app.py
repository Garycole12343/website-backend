# app.py
from __future__ import annotations

import os
import uuid
from datetime import datetime, UTC
from typing import Any, Dict, Optional, List
import voyageai
from dotenv import load_dotenv

from bson import ObjectId
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room
from pymongo import MongoClient, ASCENDING, DESCENDING
from werkzeug.security import check_password_hash, generate_password_hash
import numpy as np
# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # Manual fallback if dotenv is not installed
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ[key] = value.strip("'").strip('"')

# =============================================================================
# App + Config
# =============================================================================
app = Flask(__name__)

# SECRET_KEY must be set before Session(app)
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY", "skillswap-dev-secret-2026-change-prod!")
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_KEY_PREFIX"] = "skillswap_session:"
Session(app)

# Voyage AI Configuration
# Strip whitespace/quotes to prevent 401 errors
VOYAGE_API_KEY = (os.getenv("VOYAGE_API_KEY")
                  or "").strip().strip("'").strip('"')
if not VOYAGE_API_KEY:
    print("⚠️ WARNING: VOYAGE_API_KEY not found in environment variables!")
else:
    print(f"🔑 VOYAGE_API_KEY loaded (Starts with: {VOYAGE_API_KEY[:4]}...)")

vo = voyageai.Client(api_key=VOYAGE_API_KEY)

# Frontend origin (Vite)
VITE_ORIGIN = os.getenv("VITE_ORIGIN", "http://localhost:5173")

# CORS for REST API
CORS(
    app,
    resources={r"/api/*": {"origins": [VITE_ORIGIN]}},
    supports_credentials=True,
)

# Socket.IO CORS must match your frontend origin
socketio = SocketIO(
    app,
    cors_allowed_origins=[VITE_ORIGIN],
    async_mode="threading",
    logger=True,
    engineio_logger=True,
)


# =============================================================================
# MongoDB
# =============================================================================
MONGO_URI = os.getenv(
    "MONGO_URI", "mongodb+srv://garyc4088:Meghank1@skillsphere.wk5x60k.mongodb.net/")
client = MongoClient(MONGO_URI)
db = client["skillswap"]

users = db["users"]
resources_col = db["resources"]
conversations = db["conversations"]
contacts = db["contacts"]
# New collection for storing embeddings
user_embeddings = db["user_embeddings"]
reviews = db["reviews"]  # NEW: Reviews collection
skills_pages = db['skills_pages']
skills_embeddings = db['skills_embeddings']

try:
    users.create_index([("email", ASCENDING)], unique=True)
    conversations.create_index([("id", ASCENDING)], unique=True)
    conversations.create_index([("participants", ASCENDING)])
    conversations.create_index([("updated_at", DESCENDING)])
    user_embeddings.create_index(
        [("email", ASCENDING)], unique=True)  # Index for embeddings
    user_embeddings.create_index(
        [("embedding", "2dsphere")])  # For similarity search
    reviews.create_index([("userEmail", ASCENDING)])  # NEW: Index for reviews
    # NEW: Index for sorting reviews
    reviews.create_index([("createdAt", DESCENDING)])
    skills_embeddings.create_index('page_id', ASCENDING, unique=True)
except Exception as e:
    print("⚠️ Index creation warning:", repr(e))

print("✅ All MongoDB collections ready!")


# =============================================================================
# Voyage AI Helper Functions
# =============================================================================
def generate_user_profile_text(user: Dict[str, Any]) -> str:
    """Generate a text representation of user profile for embedding"""
    interests = user.get('interests', [])
    if isinstance(interests, list):
        interests_text = ' '.join(interests)
    else:
        interests_text = str(interests)

    skill_level = user.get('skillLevel', '')
    first_name = user.get('firstName', '')
    last_name = user.get('lastName', '')

    # Combine relevant user information for embedding
    profile_text = f"{first_name} {last_name} is interested in {interests_text}. Skill level: {skill_level}"

    # Add profile data if exists
    profile = user.get('profile', {})
    if profile:
        bio = profile.get('bio', '')
        skills = profile.get('skills', [])
        if isinstance(skills, list):
            skills_text = ' '.join(skills)
        else:
            skills_text = str(skills)
        profile_text += f" Bio: {bio}. Skills: {skills_text}"

    return profile_text


def generate_and_store_embedding(user: Dict[str, Any]) -> Optional[List[float]]:
    """Generate embedding for user and store in database"""
    try:
        email = user.get('email')
        if not email:
            print("⚠️ Embedding failed: No email found in user object")
            return None

        # Generate text for embedding
        text = generate_user_profile_text(user)
        print(f"📡 Sending to Voyage AI for {email}: \"{text[:50]}...\"")

        # Generate embedding using Voyage AI
        result = vo.embed([text], model="voyage-2")
        embedding = result.embeddings[0]

        # Store in database
        res = user_embeddings.update_one(
            {"email": email},
            {
                "$set": {
                    "email": email,
                    "embedding": embedding,
                    "updated_at": datetime.now(UTC),
                    "profile_text": text
                }
            },
            upsert=True
        )
        print(
            f"✅ Embedding stored in MongoDB for {email} (Matched: {res.matched_count}, Upserted ID: {res.upserted_id})")
        return embedding
    except Exception as e:
        print(
            f"❌ Error generating embedding for {user.get('email')}: {repr(e)}")
        return None


def find_similar_users(email: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Find users with similar interests using Voyage AI embeddings"""
    try:
        # Get current user's embedding
        user_embedding_doc = user_embeddings.find_one({"email": email})
        if not user_embedding_doc or 'embedding' not in user_embedding_doc:
            # Generate embedding if not exists
            user = users.find_one({"email": email})
            if not user:
                return []
            embedding = generate_and_store_embedding(user)
            if not embedding:
                return []
            user_embedding = embedding
        else:
            user_embedding = user_embedding_doc['embedding']

        # Get all other users' embeddings
        all_embeddings = list(user_embeddings.find({"email": {"$ne": email}}))

        # Calculate similarities
        similarities = []
        for emb_doc in all_embeddings:
            if 'embedding' not in emb_doc:
                continue

            # Compute cosine similarity
            similarity = cosine_similarity(
                user_embedding, emb_doc['embedding'])

            # Get user details
            user = users.find_one({"email": emb_doc['email']})
            if user:
                similarities.append({
                    "user": _serialize_user(user),
                    "similarity_score": similarity
                })

        # Sort by similarity and return top matches
        similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similarities[:limit]

    except Exception as e:
        print(f"❌ Error finding similar users: {repr(e)}")
        return []


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = sum(a * a for a in vec1) ** 0.5
    magnitude2 = sum(b * b for b in vec2) ** 0.5

    if magnitude1 == 0 or magnitude2 == 0:
        return 0

    return dot_product / (magnitude1 * magnitude2)


def batch_update_embeddings():
    """Update embeddings for all users (can be run as a background job)"""
    all_users = users.find()
    for user in all_users:
        generate_and_store_embedding(user)
    print("✅ Batch embedding update completed")


def search_users_by_text(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Search users by text query using Voyage AI embeddings"""
    try:
        # Generate embedding for the query
        result = vo.embed([query], model="voyage-2")
        query_embedding = result.embeddings[0]

        # Get all user embeddings
        all_embeddings = list(user_embeddings.find())

        # Calculate similarities
        similarities = []
        for emb_doc in all_embeddings:
            if 'embedding' not in emb_doc:
                continue

            similarity = cosine_similarity(
                query_embedding, emb_doc['embedding'])

            user = users.find_one({"email": emb_doc['email']})
            if user:
                similarities.append({
                    "user": _serialize_user(user),
                    "similarity_score": similarity,
                    "matched_text": emb_doc.get('profile_text', '')
                })

        # Sort by similarity and return top matches
        similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
        return similarities[:limit]

    except Exception as e:
        print(f"❌ Error searching users: {repr(e)}")
        return []


# =============================================================================
# Helpers
# =============================================================================
def _iso(v: Any) -> Any:
    return v.isoformat() if isinstance(v, datetime) else v


def _safe_object_id(value: str) -> Optional[ObjectId]:
    if value and ObjectId.is_valid(value):
        return ObjectId(value)
    return None


def _normalize_email(email: str) -> str:
    return (email or "").strip().lower()


def _require_json() -> Dict[str, Any]:
    return request.get_json(silent=True) or {}


def _serialize_user(doc: Dict[str, Any]) -> Dict[str, Any]:
    d = dict(doc)
    oid = d.pop("_id", None)
    d["id"] = str(oid) if oid else d.get("id")
    d.pop("password", None)
    d["created_at"] = _iso(d.get("created_at"))
    d["updated_at"] = _iso(d.get("updated_at"))
    return d


def _serialize_resource(doc: Dict[str, Any]) -> Dict[str, Any]:
    d = dict(doc)
    oid = d.pop("_id", None)
    d["id"] = str(oid) if oid else d.get("id")
    d["created_at"] = _iso(d.get("created_at"))
    d["updated_at"] = _iso(d.get("updated_at"))
    return d


def _serialize_conversation(conv_doc: Dict[str, Any]) -> Dict[str, Any]:
    c = dict(conv_doc)
    mongo_id = c.pop("_id", None)
    c["mongoId"] = str(mongo_id) if mongo_id else None
    c["id"] = c.get("id") or (str(mongo_id) if mongo_id else None)
    c["created_at"] = _iso(c.get("created_at"))
    c["updated_at"] = _iso(c.get("updated_at"))

    msgs = c.get("messages", []) or []
    safe_msgs = []
    for m in msgs:
        mm = dict(m)
        mm["timestamp"] = _iso(mm.get("timestamp"))
        safe_msgs.append(mm)
    c["messages"] = safe_msgs
    return c


# NEW: Review serializer
def _serialize_review(doc: Dict[str, Any]) -> Dict[str, Any]:
    d = dict(doc)
    oid = d.pop("_id", None)
    d["id"] = str(oid) if oid else d.get("id")
    d["createdAt"] = _iso(d.get("createdAt"))
    return d


# =============================================================================
# Socket.IO Events
# =============================================================================
@socketio.on("connect")
def on_connect(auth=None):
    try:
        emit("connect_success", {
             "message": "Connected. Please register email."})
    except Exception as e:
        print("❌ Socket connect handler error:", repr(e))


@socketio.on("register")
def on_register(payload):
    try:
        data = payload or {}
        email = _normalize_email(data.get("email") or "")
        if not email:
            emit("register_error", {"message": "email required"})
            return

        join_room(email)
        emit("register_success", {
             "message": f"Registered room for {email}", "email": email}, room=email)
        print(f"✅ Socket registered room: {email}")

    except Exception as e:
        print("❌ register socket error:", repr(e))
        emit("register_error", {"message": "Internal error"})


@socketio.on("disconnect")
def on_disconnect():
    print("🔌 SocketIO client disconnected")


@socketio.on_error()
def socketio_error_handler(e):
    print(f"❌ SocketIO error: {e}")


@socketio.on("send_message")
def socket_send_message(payload):
    try:
        data = payload or {}
        conv_id = (data.get("conversationId") or "").strip()
        from_email = _normalize_email(data.get("from"))
        to_email = _normalize_email(data.get("to"))
        text = (data.get("text") or "").strip()

        if not conv_id or not from_email or not to_email or not text:
            emit("message_error", {
                 "message": "conversationId, from, to, text required"})
            return

        msg = {
            "id": uuid.uuid4().hex,
            "from": from_email,
            "to": to_email,
            "text": text,
            "timestamp": datetime.now(UTC),
        }

        res = conversations.update_one(
            {"id": conv_id},
            {"$push": {"messages": msg}, "$set": {
                "updated_at": datetime.now(UTC)}},
        )
        if res.matched_count == 0:
            emit("message_error", {"message": "Conversation not found"})
            return

        safe_msg = {**msg, "timestamp": _iso(msg["timestamp"])}

        emit("new_message", {"conversationId": conv_id,
             "message": safe_msg}, room=from_email)
        emit("new_message", {"conversationId": conv_id,
             "message": safe_msg}, room=to_email)

    except Exception as e:
        print("❌ send_message socket error:", repr(e))
        emit("message_error", {"message": "Internal error"})


# =============================================================================
# Basic Routes
# =============================================================================
@app.get("/")
def home():
    return jsonify({"message": "✅ Flask + SocketIO + MongoDB + Voyage AI Backend Live!"})


# =============================================================================
# Resources
# =============================================================================
@app.route("/api/resources", methods=["GET", "POST"])
def resources_route():
    """Handle resources.
    - GET: Fetches all resources, optionally filtered by a 'category' query param.
    - POST: Creates a new resource. Expects a JSON payload with a 'title'
      and other resource details.
    """
    if request.method == "GET":
        category = (request.args.get("category") or "").strip()
        query = {"category": category} if category else {}
        docs = [_serialize_resource(doc) for doc in resources_col.find(query)]
        docs.sort(key=lambda x: x.get("created_at") or "", reverse=True)
        return jsonify({"resources": docs}), 200

    data = _require_json()
    title = (data.get("title") or "").strip()
    if not title:
        return jsonify({"error": "title required"}), 400

    doc = {
        **data,
        "title": title,
        "likes": int(data.get("likes") or 0),
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    }
    result = resources_col.insert_one(doc)
    inserted = resources_col.find_one({"_id": result.inserted_id})
    return jsonify(_serialize_resource(inserted)), 201


@app.put("/api/resources/<resource_id>")
def update_resource(resource_id):
    data = _require_json()
    if "likes" not in data:
        return jsonify({"error": "likes required"}), 400

    oid = _safe_object_id(resource_id)
    filter_query = {"_id": oid} if oid else {"id": resource_id}

    result = resources_col.update_one(
        filter_query,
        {"$set": {"likes": int(data["likes"]),
                  "updated_at": datetime.now(UTC)}},
    )
    if result.matched_count == 0:
        return jsonify({"error": "Resource not found"}), 404

    updated = resources_col.find_one(filter_query)
    return jsonify(_serialize_resource(updated)), 200


# =============================================================================
# Auth
# =============================================================================
@app.post("/api/register")
def register():
    """Register a new user.
    Expects a JSON payload with firstName, lastName, email, password,
    interests, and skillLevel.
    Returns the new user object on success or an error message on failure.
    """
    data = _require_json()
    required = ["firstName", "lastName", "email",
                "password", "interests", "skillLevel"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": "Missing fields", "missing": missing}), 400

    email = _normalize_email(data["email"])
    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    user_doc = {
        "firstName": (data.get("firstName") or "").strip(),
        "lastName": (data.get("lastName") or "").strip(),
        "email": email,
        "password": generate_password_hash(data["password"]),
        "interests": data.get("interests"),
        "skillLevel": data.get("skillLevel"),
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
        "profile": {},
    }
    users.insert_one(user_doc)

    # Generate and store embedding for the new user
    generate_and_store_embedding(user_doc)

    session["userEmail"] = email
    saved = users.find_one({"email": email})
    return jsonify({"user": _serialize_user(saved)}), 201


@app.post("/api/login")
def login():
    """Authenticate a user.
    Expects a JSON payload with email and password.
    Establishes a session on success and returns the user object.
    Returns an error for invalid credentials.
    """
    data = _require_json()
    email = _normalize_email(data.get("email") or "")
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400

    user = users.find_one({"email": email})
    if not user or not check_password_hash(user.get("password", ""), password):
        return jsonify({"error": "Invalid credentials"}), 401

    session["userEmail"] = email
    return jsonify({"user": _serialize_user(user)}), 200


@app.post("/api/logout")
def logout():
    session.pop("userEmail", None)
    return jsonify({"message": "Logged out"}), 200


@app.get("/api/me")
def me():
    email = _normalize_email(session.get("userEmail") or "")
    if not email:
        return jsonify({"user": None}), 200
    user = users.find_one({"email": email})
    return jsonify({"user": _serialize_user(user) if user else None}), 200


@app.get("/api/users/by-email")
def get_user_by_email():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"error": "email required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"user": None}), 200

    name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
    if not name:
        # Clean up email to username (john.doe@ → John Doe)
        name = email.split('@')[0].replace('.', ' ').title()

    return jsonify({
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": name
        }
    }), 200


# =============================================================================
# Profile
# =============================================================================
@app.route("/api/profile", methods=["GET", "POST"])
def profile():
    """Handle user profiles.
    - GET: Fetches a user's profile based on an 'email' query parameter.
    - POST: Updates a user's profile. Expects a JSON payload containing
      the user's 'email' and a 'profile' object with the fields to update.
    """
    if request.method == "GET":
        email = _normalize_email(request.args.get("email") or "")
        if not email:
            return jsonify({"message": "Email required"}), 400

        user = users.find_one({"email": email})
        if not user:
            return jsonify({"message": "User not found"}), 404

        return jsonify({"profile": user.get("profile") or {}}), 200

    data = _require_json()
    email = _normalize_email(str(data.get("email") or ""))
    profile_update = data.get("profile")

    if not email:
        return jsonify({"message": "email required"}), 400
    if not isinstance(profile_update, dict):
        return jsonify({"message": "profile must be an object"}), 400

    profile_update["updatedAt"] = datetime.now(UTC)

    # Extract interests and skillLevel if they were sent in the profile object
    # This allows the ProfilePage to update these top-level fields
    update_fields = {
        "profile": profile_update,
        "updated_at": datetime.now(UTC)
    }

    if "interests" in profile_update:
        update_fields["interests"] = profile_update.pop("interests")
    if "skillLevel" in profile_update:
        update_fields["skillLevel"] = profile_update.pop("skillLevel")

    result = users.update_one(
        {"email": email},
        {"$set": update_fields},
        upsert=False,
    )
    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    # Regenerate embedding after profile update
    updated_user = users.find_one({"email": email})
    generate_and_store_embedding(updated_user)

    return jsonify({"message": "Profile saved"}), 200


# =============================================================================
# NEW: Reviews Routes
# =============================================================================
@app.route("/api/reviews", methods=["GET", "POST"])
def handle_reviews():
    if request.method == "GET":
        # Get reviews for a specific user
        user_email = _normalize_email(request.args.get("userEmail") or "")
        if not user_email:
            return jsonify({"message": "userEmail is required"}), 400

        try:
            review_docs = list(reviews.find(
                {"userEmail": user_email}).sort("createdAt", DESCENDING))
            return jsonify({"reviews": [_serialize_review(r) for r in review_docs]}), 200
        except Exception as e:
            print(f"❌ Error fetching reviews: {repr(e)}")
            return jsonify({"message": "Failed to fetch reviews"}), 500

    # POST - Create a new review
    data = _require_json()
    user_email = _normalize_email(data.get("userEmail") or "")
    author = data.get("author", "").strip()
    content = data.get("content", "").strip()
    rating = data.get("rating", 5)

    if not user_email or not author or not content:
        return jsonify({"message": "userEmail, author, and content are required"}), 400

    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return jsonify({"message": "rating must be an integer between 1 and 5"}), 400

    try:
        review_doc = {
            "userEmail": user_email,
            "author": author,
            "content": content,
            "rating": rating,
            "createdAt": datetime.now(UTC)
        }

        result = reviews.insert_one(review_doc)
        review_doc["_id"] = result.inserted_id

        return jsonify(_serialize_review(review_doc)), 201

    except Exception as e:
        print(f"❌ Error creating review: {repr(e)}")
        return jsonify({"message": "Failed to create review"}), 500


# Optional: Delete a review
@app.delete("/api/reviews/<review_id>")
def delete_review(review_id):
    try:
        oid = _safe_object_id(review_id)
        if not oid:
            return jsonify({"message": "Invalid review ID"}), 400

        result = reviews.delete_one({"_id": oid})
        if result.deleted_count == 0:
            return jsonify({"message": "Review not found"}), 404

        return jsonify({"message": "Review deleted successfully"}), 200
    except Exception as e:
        print(f"❌ Error deleting review: {repr(e)}")
        return jsonify({"message": "Failed to delete review"}), 500


# =============================================================================
# Voyage AI Routes - New endpoints for semantic search and recommendations
# =============================================================================
@app.get("/api/users/similar")
def get_similar_users():
    """Get users with similar interests based on Voyage AI embeddings"""
    email = _normalize_email(request.args.get("email") or "")
    limit = int(request.args.get("limit", "10"))

    if not email:
        return jsonify({"message": "email is required"}), 400

    similar_users = find_similar_users(email, limit)
    return jsonify({
        "matches": similar_users,
        "count": len(similar_users)
    }), 200


@app.post("/api/users/search")
def search_users():
    """Search users by text query using semantic search"""
    data = _require_json()
    query = data.get("query", "").strip()
    limit = int(data.get("limit", 10))

    if not query:
        return jsonify({"message": "query is required"}), 400

    results = search_users_by_text(query, limit)
    return jsonify({
        "query": query,
        "results": results,
        "count": len(results)
    }), 200


@app.post("/api/users/update-embedding")
def update_user_embedding():
    """Manually trigger embedding update for a user"""
    data = _require_json()
    email = _normalize_email(data.get("email") or "")

    if not email:
        return jsonify({"message": "email is required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    embedding = generate_and_store_embedding(user)
    if embedding:
        return jsonify({"message": "Embedding updated successfully"}), 200
    else:
        return jsonify({"message": "Failed to update embedding"}), 500


@app.post("/api/users/batch-update-embeddings")
def batch_update_users_embeddings():
    """Admin endpoint to batch update all user embeddings"""
    # You might want to add authentication here
    batch_update_embeddings()
    return jsonify({"message": "Batch embedding update initiated"}), 202


@app.get("/api/users/recommendations")
def get_recommendations():
    """Get personalized recommendations based on user interests"""
    email = _normalize_email(request.args.get("email") or "")
    limit = int(request.args.get("limit", "5"))

    if not email:
        return jsonify({"message": "email is required"}), 400

    # Get similar users
    similar_users = find_similar_users(email, limit)

    # Get resources based on user's interests
    user = users.find_one({"email": email})
    if user and user.get('interests'):
        interests = user.get('interests', [])
        if isinstance(interests, list):
            # Find resources matching interests
            resource_query = {"category": {"$in": interests}}
            resources = list(resources_col.find(resource_query).limit(limit))
            recommended_resources = [_serialize_resource(r) for r in resources]
        else:
            recommended_resources = []
    else:
        recommended_resources = []

    return jsonify({
        "similar_users": similar_users,
        "recommended_resources": recommended_resources
    }), 200


# =============================================================================
# Messaging / Conversations
# =============================================================================
@app.get("/api/messages")
def get_conversations():
    email = _normalize_email(request.args.get("email") or "")
    if not email:
        return jsonify({"message": "email is required"}), 400

    try:
        convs = list(conversations.find(
            {"participants": email}).sort("updated_at", DESCENDING))
        return jsonify({"conversations": [_serialize_conversation(c) for c in convs]}), 200
    except Exception as e:
        print("❌ /api/messages error:", repr(e))
        return jsonify({"message": "Internal Server Error"}), 500


@app.get("/api/messages/unread-count")
def get_unread_count():
    email = _normalize_email(request.args.get("email") or "")
    if not email:
        return jsonify({"message": "email is required"}), 400

    try:
        # Find all conversations where the user is a participant
        convs = list(conversations.find({"participants": email}))
        unread_count = 0

        for conv in convs:
            msgs = conv.get("messages", [])
            if not msgs:
                continue

            # Check last_read_by for this user
            last_read_by = conv.get("last_read_by", {})
            last_read_time = last_read_by.get(email)

            # Convert last_read_time to datetime if it's a string
            if isinstance(last_read_time, str):
                try:
                    last_read_time = datetime.fromisoformat(
                        last_read_time.replace('Z', '+00:00'))
                except:
                    last_read_time = None

            last_msg = msgs[-1]
            last_msg_time = last_msg.get("timestamp")
            if isinstance(last_msg_time, str):
                try:
                    last_msg_time = datetime.fromisoformat(
                        last_msg_time.replace('Z', '+00:00'))
                except:
                    last_msg_time = datetime.now(UTC)  # fallback

            # If user has NEVER read or last message is newer than last read
            # AND the message isn't from the user themselves
            if (_normalize_email(last_msg.get("from")) != email):
                if not last_read_time or last_msg_time > last_read_time:
                    unread_count += 1

        return jsonify({"unread_count": unread_count}), 200
    except Exception as e:
        print("❌ /api/messages/unread-count error:", repr(e))
        return jsonify({"message": "Internal Server Error"}), 500


@app.post("/api/messages/mark-read")
def mark_conversation_read():
    data = _require_json()
    conv_id = data.get("conversationId")
    email = _normalize_email(data.get("email"))

    if not conv_id or not email:
        return jsonify({"message": "conversationId and email required"}), 400

    try:
        conversations.update_one(
            {"id": conv_id},
            {"$set": {f"last_read_by.{email}": datetime.now(UTC)}}
        )
        return jsonify({"message": "Conversation marked as read"}), 200
    except Exception as e:
        print("❌ /api/messages/mark-read error:", repr(e))
        return jsonify({"message": "Internal Server Error"}), 500


@app.post("/api/messages/conversation")
def create_conversation():
    data = _require_json()
    participants = data.get("participants") or []
    if not isinstance(participants, list) or len(participants) != 2:
        return jsonify({"message": "participants must be an array of 2 emails"}), 400

    a = _normalize_email(participants[0])
    b = _normalize_email(participants[1])
    if not a or not b or a == b:
        return jsonify({"message": "participants must be two different emails"}), 400

    participants_sorted = sorted([a, b])

    existing = conversations.find_one({"participants": participants_sorted})
    if existing:
        return jsonify({"conversation": _serialize_conversation(existing)}), 200

    conv_doc = {
        "id": uuid.uuid4().hex,
        "participants": participants_sorted,
        "messages": [],
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    }
    conversations.insert_one(conv_doc)
    saved = conversations.find_one({"id": conv_doc["id"]})
    return jsonify({"conversation": _serialize_conversation(saved)}), 201


@app.post("/api/messages/send")
def send_message_rest():
    data = _require_json()
    conv_id = (data.get("conversationId") or "").strip()
    from_email = _normalize_email(data.get("from"))
    to_email = _normalize_email(data.get("to"))
    text = (data.get("text") or "").strip()

    if not conv_id or not from_email or not to_email or not text:
        return jsonify({"message": "conversationId, from, to, text required"}), 400

    msg = {
        "id": uuid.uuid4().hex,
        "from": from_email,
        "to": to_email,
        "text": text,
        "timestamp": datetime.now(UTC),
    }

    try:
        res = conversations.update_one(
            {"id": conv_id},
            {"$push": {"messages": msg}, "$set": {
                "updated_at": datetime.now(UTC)}},
        )
        if res.matched_count == 0:
            return jsonify({"message": "Conversation not found"}), 404

        safe_msg = {**msg, "timestamp": _iso(msg["timestamp"])}

        # Emit real-time to both users if connected/registered
        socketio.emit("new_message", {
                      "conversationId": conv_id, "message": safe_msg}, room=from_email)
        socketio.emit("new_message", {
                      "conversationId": conv_id, "message": safe_msg}, room=to_email)

        return jsonify({"conversationId": conv_id, "message": safe_msg}), 201

    except Exception as e:
        print("❌ /api/messages/send error:", repr(e))
        return jsonify({"message": "Internal Server Error"}), 500


# =============================================================================
# Contacts
# =============================================================================
@app.get("/api/contacts")
def get_contacts():
    email = _normalize_email(request.args.get("email") or "")
    if not email:
        return jsonify({"message": "email is required"}), 400

    try:
        docs = list(contacts.find({"ownerEmail": email}).sort(
            "created_at", DESCENDING))
        out = []
        for d in docs:
            dd = dict(d)
            oid = dd.pop("_id", None)
            dd["id"] = str(oid) if oid else dd.get("id")
            dd["created_at"] = _iso(dd.get("created_at"))
            out.append(dd)
        return jsonify({"contacts": out}), 200
    except Exception as e:
        print("❌ /api/contacts error:", repr(e))
        return jsonify({"message": "Internal Server Error"}), 500


@app.post("/api/contacts")
def add_contact():
    data = _require_json()
    owner = _normalize_email(data.get("ownerEmail"))
    contact_email = _normalize_email(data.get("contactEmail"))
    name = (data.get("name") or "").strip()

    if not owner or not contact_email:
        return jsonify({"message": "ownerEmail and contactEmail required"}), 400

    doc = {
        "ownerEmail": owner,
        "contactEmail": contact_email,
        "name": name,
        "created_at": datetime.now(UTC),
    }
    contacts.insert_one(doc)
    return jsonify({"message": "Contact added"}), 201


# =============================================================================
# Run
# =============================================================================
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(
        os.getenv("PORT", "5000")), debug=True)
