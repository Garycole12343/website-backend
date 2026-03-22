# app.py
from __future__ import annotations

import os
import re
import json
import uuid
from datetime import datetime, UTC
from typing import Any, Dict, Optional
from dotenv import load_dotenv

from bson import ObjectId
from flask import Flask, jsonify, request, session, send_from_directory
from flask_cors import CORS # type: ignore[import-untyped]
from flask_session import Session # type: ignore[attr-defined]
from flask_socketio import SocketIO, emit, join_room # type: ignore[import-untyped]
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from pymongo import MongoClient, ASCENDING, DESCENDING
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

# Load environment variables from .env file
load_dotenv()

# =============================================================================
# App + Config
# =============================================================================
app = Flask(__name__)

# Configure Uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(
    os.path.abspath(__file__)), 'uploads', 'profile_pics')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB Limit

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize Limiter for Rate Limiting
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://",
)

# SECRET_KEY
app.config["SECRET_KEY"] = os.getenv(
    "SECRET_KEY", "f443626cd4f636c2fc363330a81f4daff0f612ecb190466d0ac662e8e7fc5547")
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["SESSION_USE_SIGNER"] = True
app.config["SESSION_KEY_PREFIX"] = "skillswap_session:"
Session(app)

# Frontend origin (Vite)
VITE_ORIGIN = os.getenv("VITE_ORIGIN", "http://localhost:5173")

# CORS for REST API
CORS(
    app,
    resources={r"/api/*": {"origins": [VITE_ORIGIN]}},
    supports_credentials=True,
)

# Socket.IO CORS
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
MONGO_URI = os.getenv("MONGO_URI", "").strip()
if not MONGO_URI:
    MONGO_URI = "mongodb+srv://garyc4088:Meghank1@skillsphere.wk5x60k.mongodb.net/"

# Added tz_aware=True to ensure all datetimes returned from Mongo are aware (UTC)
client: MongoClient[Dict[str, Any]] = MongoClient(MONGO_URI, tz_aware=True)
db = client["skillswap"]

users = db["users"]
resources_col = db["resources"]
conversations = db["conversations"]
contacts = db["contacts"]
reviews = db["reviews"]
skills_pages = db['skills_pages']

try:
    users.create_index([("email", ASCENDING)], unique=True)
    conversations.create_index([("id", ASCENDING)], unique=True)
    conversations.create_index([("participants", ASCENDING)])
    conversations.create_index([("updated_at", DESCENDING)])
    reviews.create_index([("userEmail", ASCENDING)])
    reviews.create_index([("createdAt", DESCENDING)])
except Exception as e:
    print("⚠️ Index creation warning:", repr(e))

print("✅ All MongoDB collections ready!")


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
# Error Handlers
# =============================================================================
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"error": "Bad request", "message": str(e.description)}), 400


@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found", "message": "The requested URL was not found on the server."}), 404


@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"error": "Rate limit exceeded", "message": "Too many requests. Please try again later.", "retry_after": e.description}), 429


@app.errorhandler(500)
def internal_error(e):
    print(f"🔥 SERVER ERROR: {str(e)}")
    return jsonify({"error": "Internal server error", "message": "An unexpected error occurred on the server."}), 500


@app.errorhandler(Exception)
def handle_unexpected_exception(e):
    print(f"🚨 UNEXPECTED EXCEPTION: {str(e)}")
    return jsonify({"error": "Internal server error", "message": "An unexpected error occurred."}), 500


# =============================================================================
# Routes
# =============================================================================
@app.get("/")
def home():
    return jsonify({"message": "✅ Flask + SocketIO + MongoDB Backend Live!"})


@app.route('/uploads/profile_pics/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


@app.post("/api/upload-profile-pic")
@limiter.limit("5 per minute")
def upload_profile_pic():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    email = _normalize_email(request.form.get("email") or "")
    
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        file_ext = file.filename.rsplit('.', 1)[1].lower()
        new_filename = secure_filename(f"profile_{email.replace('@', '_').replace('.', '_')}_{uuid.uuid4().hex[:8]}.{file_ext}")
        
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], new_filename)
        file.save(file_path)
        
        image_url = f"{request.host_url}uploads/profile_pics/{new_filename}"
        
        result = users.update_one(
            {"email": email},
            {"$set": {"profile.profileImage": image_url, "updated_at": datetime.now(UTC)}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({
            "message": "Upload successful",
            "profileImage": image_url
        }), 200
    
    return jsonify({"error": "File type not allowed"}), 400


@app.route("/api/resources", methods=["GET", "POST"])
def resources_route():
    if request.method == "GET":
        category = (request.args.get("category") or "").strip()
        search_term = (request.args.get("search") or "").strip()
        
        query = {}
        # Handle 'All' as no category filter
        if category and category.lower() != "all":
            query["category"] = category
        if search_term:
            query["$or"] = [
                {"title": {"$regex": search_term, "$options": "i"}},
                {"description": {"$regex": search_term, "$options": "i"}}
            ]
            
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


@app.post("/api/register")
@limiter.limit("5 per minute")
def register():
    # 1. Handle Multipart Form Data (required for file support)
    first_name = (request.form.get("firstName") or "").strip()
    last_name = (request.form.get("lastName") or "").strip()
    email = _normalize_email(request.form.get("email") or "")
    password = request.form.get("password") or ""
    interests_raw = request.form.get("interests")
    skill_level = (request.form.get("skillLevel") or "").strip()

    # 2. Robust Server-Side Validation (Required by Brief 2)
    if not all([first_name, last_name, email, password, skill_level]):
        return jsonify({"error": "Missing mandatory fields"}), 400

    # Email Regex Validation
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if not re.match(email_regex, email):
        return jsonify({"error": "Invalid email format"}), 400

    # Password Length Validation
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    # Check for Duplicate Email
    if users.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    # 3. Handle Mandatory File Upload (Required by Brief 1 & 2)
    if 'file' not in request.files:
        return jsonify({"error": "Profile picture is mandatory"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed. Please upload PNG, JPG, or GIF."}), 400

    # Save the file securely
    file_ext = file.filename.rsplit('.', 1)[1].lower()
    filename = secure_filename(f"profile_{email.replace('@', '_').replace('.', '_')}_{uuid.uuid4().hex[:8]}.{file_ext}")
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)

    # Construct the public URL for the image
    image_url = f"{request.host_url}uploads/profile_pics/{filename}"

    # Parse interests if sent as a JSON string
    try:
        interests = json.loads(interests_raw) if interests_raw else []
    except (ValueError, TypeError):
        interests = []

    # 4. Save to Database
    name = f"{first_name} {last_name}".strip()
    user_doc = {
        "firstName": first_name,
        "lastName": last_name,
        "email": email,
        "password": generate_password_hash(password),
        "interests": interests,
        "skillLevel": skill_level,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
        "profile": {
            "name": name,
            "profileImage": image_url,
            "bio": "",
            "location": "",
            "phone": "",
            "website": "",
            "linkedin": "",
            "skills_detail": [],
            "privacySettings": {
                "profileVisibility": True,
                "showEmail": False,
                "showPhone": False,
                "allowMessages": True,
                "emailNotifications": True
            }
        },
    }
    users.insert_one(user_doc)

    session["userEmail"] = email
    saved = users.find_one({"email": email})
    return jsonify({"user": _serialize_user(saved)}), 201


@app.post("/api/login")
@limiter.limit("10 per minute")
def login():
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


@app.post("/api/update-password")
@limiter.limit("5 per hour")
def update_password():
    data = _require_json()
    email = _normalize_email(data.get("email") or "")
    current_password = data.get("currentPassword") or ""
    new_password = data.get("newPassword") or ""

    if not email or not current_password or not new_password:
        return jsonify({"error": "Missing required fields"}), 400

    user = users.find_one({"email": email})
    if not user or not check_password_hash(user.get("password", ""), current_password):
        return jsonify({"error": "Invalid current password"}), 401

    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    users.update_one(
        {"email": email},
        {"$set": {"password": generate_password_hash(new_password), "updated_at": datetime.now(UTC)}}
    )

    return jsonify({"message": "Password updated successfully"}), 200


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


@app.get("/api/users/by-skill")
def get_users_by_skill():
    skill = request.args.get("skill", "").strip()
    if not skill:
        return jsonify({"users": []}), 200
    
    # Search for users who have this skill in their profile.skills array
    # or match the skill name in their interests
    query = {
        "$or": [
            {"profile.skills": {"$regex": skill, "$options": "i"}},
            {"interests": {"$regex": skill, "$options": "i"}}
        ]
    }
    
    matching_users = [ _serialize_user(u) for u in users.find(query).limit(20) ]
    return jsonify({"users": matching_users}), 200


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
        name = email.split('@')[0].replace('.', ' ').title()

    return jsonify({
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": name
        }
    }), 200


@app.route("/api/profile", methods=["GET", "POST"])
def profile():
    if request.method == "GET":
        email = _normalize_email(request.args.get("email") or "")
        user_id = request.args.get("id") or request.args.get("userId")
        
        query = {}
        if email:
            query["email"] = email
        elif user_id:
            oid = _safe_object_id(user_id)
            query = {"_id": oid} if oid else {"id": user_id}
        else:
            return jsonify({"message": "Email or ID required"}), 400

        user = users.find_one(query)
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Return both the full user and a flattened profile for maximum frontend compatibility
        serialized = _serialize_user(user)
        return jsonify({
            "user": serialized,
            "profile": user.get("profile") or {}
        }), 200

    data = _require_json()
    email = _normalize_email(str(data.get("email") or ""))
    profile_update = data.get("profile")

    if not email:
        return jsonify({"message": "email required"}), 400
    if not isinstance(profile_update, dict):
        return jsonify({"message": "profile must be an object"}), 400

    profile_update["updatedAt"] = datetime.now(UTC)

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

    return jsonify({"message": "Profile saved"}), 200


@app.delete("/api/profile")
def delete_account():
    email = _normalize_email(session.get("userEmail") or "")
    if not email:
        return jsonify({"message": "Authentication required"}), 401

    try:
        # 1. Cascade Delete: Remove all user-related data
        resources_col.delete_many({"creatorEmail": email}) # Remove shared resources
        reviews.delete_many({"userEmail": email})         # Remove reviews they received
        reviews.delete_many({"author": email})            # Remove reviews they wrote
        
        # 2. Remove from conversations
        conversations.delete_many({"participants": email})

        # 3. Finally, delete the user themselves
        result = users.delete_one({"email": email})
        
        if result.deleted_count == 0:
            return jsonify({"message": "User not found"}), 404

        # 4. Clear the session
        session.pop("userEmail", None)
        
        return jsonify({"message": "Account and all associated data deleted successfully"}), 200
    except Exception as e:
        print(f"🔥 DELETE ERROR: {str(e)}")
        return jsonify({"message": "Internal server error during deletion"}), 500


@app.route("/api/reviews", methods=["GET", "POST"])
def handle_reviews():
    if request.method == "GET":
        user_email = _normalize_email(request.args.get("userEmail") or "")
        if not user_email:
            return jsonify({"message": "userEmail is required"}), 400

        try:
            review_docs = list(reviews.find(
                {"userEmail": user_email}).sort("createdAt", DESCENDING))
            return jsonify({"reviews": [_serialize_review(r) for r in review_docs]}), 200
        except Exception:
            return jsonify({"message": "Failed to fetch reviews"}), 500

    data = _require_json()
    user_email = _normalize_email(data.get("userEmail") or "")
    author = data.get("author", "").strip()
    content = data.get("content", "").strip()
    rating = data.get("rating", 5)

    if not user_email or not author or not content:
        return jsonify({"message": "userEmail, author, and content are required"}), 400

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
    except Exception:
        return jsonify({"message": "Failed to create review"}), 500


@app.get("/api/messages")
def get_conversations():
    email = _normalize_email(request.args.get("email") or "")
    if not email:
        return jsonify({"message": "email is required"}), 400
    try:
        convs = list(conversations.find(
            {"participants": email}).sort("updated_at", DESCENDING))
        return jsonify({"conversations": [_serialize_conversation(c) for c in convs]}), 200
    except Exception:
        return jsonify({"message": "Internal Server Error"}), 500


@app.get("/api/messages/unread-count")
def get_unread_count():
    email = _normalize_email(request.args.get("email") or "")
    if not email:
        return jsonify({"message": "email is required"}), 400
    try:
        convs = list(conversations.find({"participants": email}))
        unread_count = 0
        now = datetime.now(UTC)
        for conv in convs:
            msgs = conv.get("messages", [])
            if not msgs:
                continue
            last_read_by = conv.get("last_read_by", {})
            last_read_time = last_read_by.get(email)
            
            # Convert last_read_time to aware datetime if it's a string
            if isinstance(last_read_time, str):
                try:
                    last_read_time = datetime.fromisoformat(last_read_time.replace('Z', '+00:00'))
                except Exception:
                    last_read_time = None
            # If it's already a datetime from Mongo (but naive), make it aware
            elif isinstance(last_read_time, datetime) and last_read_time.tzinfo is None:
                last_read_time = last_read_time.replace(tzinfo=UTC)

            last_msg = msgs[-1]
            last_msg_time = last_msg.get("timestamp")
            
            # Convert last_msg_time to aware datetime if it's a string
            if isinstance(last_msg_time, str):
                try:
                    last_msg_time = datetime.fromisoformat(last_msg_time.replace('Z', '+00:00'))
                except Exception:
                    last_msg_time = now
            # If it's already a datetime from Mongo (but naive), make it aware
            elif isinstance(last_msg_time, datetime) and last_msg_time.tzinfo is None:
                last_msg_time = last_msg_time.replace(tzinfo=UTC)

            if (_normalize_email(last_msg.get("from")) != email):
                if not last_read_time or last_msg_time > last_read_time:
                    unread_count += 1
        return jsonify({"unread_count": unread_count}), 200
    except Exception as e:
        print(f"❌ get_unread_count error: {repr(e)}")
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
    except Exception:
        return jsonify({"message": "Internal Server Error"}), 500


@app.post("/api/messages/delete")
def delete_message():
    data = _require_json()
    conv_id = data.get("conversationId")
    message_id = data.get("messageId")
    
    if not conv_id or not message_id:
        return jsonify({"error": "conversationId and messageId required"}), 400
        
    try:
        # Pull the message with the specific ID from the messages array
        result = conversations.update_one(
            {"id": conv_id},
            {"$pull": {"messages": {"id": message_id}}}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Conversation not found"}), 404
            
        return jsonify({"message": "Message deleted successfully"}), 200
    except Exception as e:
        print(f"❌ delete_message error: {repr(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.post("/api/messages/conversation/delete")
def delete_conversation():
    data = _require_json()
    conv_id = data.get("conversationId")

    if not conv_id:
        return jsonify({"error": "conversationId required"}), 400

    try:
        result = conversations.delete_one({"id": conv_id})

        if result.deleted_count == 0:
            return jsonify({"error": "Conversation not found"}), 404

        return jsonify({"message": "Conversation deleted successfully"}), 200
    except Exception as e:
        print(f"❌ delete_conversation error: {repr(e)}")
        return jsonify({"error": "Internal Server Error"}), 500


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
            {"$push": {"messages": msg}, "$set": {"updated_at": datetime.now(UTC)}},
        )
        if res.matched_count == 0:
            return jsonify({"message": "Conversation not found"}), 404
        safe_msg = {**msg, "timestamp": _iso(msg["timestamp"])}
        socketio.emit("new_message", {"conversationId": conv_id, "message": safe_msg}, room=from_email)
        socketio.emit("new_message", {"conversationId": conv_id, "message": safe_msg}, room=to_email)
        return jsonify({"conversationId": conv_id, "message": safe_msg}), 201
    except Exception:
        return jsonify({"message": "Internal Server Error"}), 500


@app.get("/api/contacts")
def get_contacts():
    email = _normalize_email(request.args.get("email") or "")
    if not email:
        return jsonify({"message": "email is required"}), 400
    try:
        docs = list(contacts.find({"ownerEmail": email}).sort("created_at", DESCENDING))
        out = []
        for d in docs:
            dd = dict(d)
            oid = dd.pop("_id", None)
            dd["id"] = str(oid) if oid else dd.get("id")
            dd["created_at"] = _iso(dd.get("created_at"))
            out.append(dd)
        return jsonify({"contacts": out}), 200
    except Exception:
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


@app.get("/api/users/recommendations")
def get_recommendations():
    email = _normalize_email(request.args.get("email") or "")
    limit = int(request.args.get("limit") or 3)
    
    if not email:
        return jsonify({"error": "email required"}), 400
        
    current_user = users.find_one({"email": email})
    if not current_user:
        return jsonify({"similar_users": []}), 200
        
    user_interests = set(current_user.get("interests") or [])
    
    # Simple similarity match based on interests
    all_users = users.find({"email": {"$ne": email}})
    recommendations = []
    
    for other_user in all_users:
        other_interests = set(other_user.get("interests") or [])
        common = user_interests.intersection(other_interests)
        
        # Calculate a mock similarity score (0.0 to 1.0)
        # In a real AI app, this would be a cosine similarity of embeddings
        score = 0.0
        if user_interests:
            score = len(common) / len(user_interests)
        elif not user_interests and not other_interests:
            score = 0.5 # Default fallback
            
        recommendations.append({
            "user": _serialize_user(other_user),
            "similarity_score": round(score, 2)
        })
        
    # Sort by highest score first
    recommendations.sort(key=lambda x: x["similarity_score"], reverse=True)
    
    return jsonify({"similar_users": recommendations[:limit]}), 200


@app.post("/api/users/update-embedding")
def update_embedding():
    data = _require_json()
    email = _normalize_email(data.get("email") or "")
    if not email:
        return jsonify({"error": "email required"}), 400
        
    # Placeholder for actual embedding generation logic
    # In a real app, this would trigger an AI model to process user interests/bio
    return jsonify({"message": f"Embedding updated for {email}"}), 200


# =============================================================================
# Run
# =============================================================================
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True, allow_unsafe_werkzeug=True)
