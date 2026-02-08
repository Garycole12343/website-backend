# app.py
from __future__ import annotations

import os
import uuid
from datetime import datetime, UTC
from typing import Any, Dict, Optional

from bson import ObjectId
from flask import Flask, jsonify, request, session
from flask_cors import CORS
from flask_session import Session
from flask_socketio import SocketIO, emit, join_room
from pymongo import MongoClient, ASCENDING, DESCENDING
from werkzeug.security import check_password_hash, generate_password_hash


# =============================================================================
# App + Config
# =============================================================================
app = Flask(__name__)

# SECRET_KEY must be set before Session(app)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "skillswap-dev-secret-2026-change-prod!")
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
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://garyc4088:Meghank1@skillsphere.wk5x60k.mongodb.net/")
client = MongoClient(MONGO_URI)
db = client["skillswap"]

users = db["users"]
resources_col = db["resources"]
conversations = db["conversations"]
contacts = db["contacts"]

try:
    users.create_index([("email", ASCENDING)], unique=True)
    conversations.create_index([("id", ASCENDING)], unique=True)
    conversations.create_index([("participants", ASCENDING)])
    conversations.create_index([("updated_at", DESCENDING)])
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


# =============================================================================
# Socket.IO Events (FIXED)
# =============================================================================
@socketio.on("connect")
def on_connect(auth=None):
    """
    FIX:
    - Do NOT reject the connection if auth/email is missing.
    - Just connect, then let the client register their email via a separate event.
    This prevents 'websocket error' loops and 500s on handshake.
    """
    try:
        emit("connect_success", {"message": "Connected. Please register email."})
    except Exception as e:
        print("❌ Socket connect handler error:", repr(e))


@socketio.on("register")
def on_register(payload):
    """
    Client should call immediately after connect:
      socket.emit("register", { email: "user@example.com" })

    This joins them to a room named by their email.
    """
    try:
        data = payload or {}
        email = _normalize_email(data.get("email") or "")
        if not email:
            emit("register_error", {"message": "email required"})
            return

        join_room(email)
        emit("register_success", {"message": f"Registered room for {email}", "email": email}, room=email)
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
    """
    Optional real-time message send (in addition to REST endpoint).
    Payload:
      {
        "conversationId": "...",
        "from": "a@a.com",
        "to": "b@b.com",
        "text": "hello"
      }
    """
    try:
        data = payload or {}
        conv_id = (data.get("conversationId") or "").strip()
        from_email = _normalize_email(data.get("from"))
        to_email = _normalize_email(data.get("to"))
        text = (data.get("text") or "").strip()

        if not conv_id or not from_email or not to_email or not text:
            emit("message_error", {"message": "conversationId, from, to, text required"})
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
            {"$push": {"messages": msg}, "$set": {"updated_at": datetime.now(UTC)}},
        )
        if res.matched_count == 0:
            emit("message_error", {"message": "Conversation not found"})
            return

        safe_msg = {**msg, "timestamp": _iso(msg["timestamp"])}

        emit("new_message", {"conversationId": conv_id, "message": safe_msg}, room=from_email)
        emit("new_message", {"conversationId": conv_id, "message": safe_msg}, room=to_email)

    except Exception as e:
        print("❌ send_message socket error:", repr(e))
        emit("message_error", {"message": "Internal error"})


# =============================================================================
# Basic Routes
# =============================================================================
@app.get("/")
def home():
    return jsonify({"message": "✅ Flask + SocketIO + MongoDB Backend Live!"})


# =============================================================================
# Resources
# =============================================================================
@app.route("/api/resources", methods=["GET", "POST"])
def resources_route():
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
        {"$set": {"likes": int(data["likes"]), "updated_at": datetime.now(UTC)}},
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
    data = _require_json()
    required = ["firstName", "lastName", "email", "password", "interests", "skillLevel"]
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

    session["userEmail"] = email
    saved = users.find_one({"email": email})
    return jsonify({"user": _serialize_user(saved)}), 201


@app.post("/api/login")
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
# Profile (compat)
# =============================================================================
@app.route("/api/profile", methods=["GET", "POST"])
def profile():
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

    result = users.update_one(
        {"email": email},
        {"$set": {"profile": profile_update, "updated_at": datetime.now(UTC)}},
        upsert=False,
    )
    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "Profile saved"}), 200


# =============================================================================
# Messaging / Conversations
# =============================================================================
@app.get("/api/messages")
def get_conversations():
    email = _normalize_email(request.args.get("email") or "")
    if not email:
        return jsonify({"message": "email is required"}), 400

    try:
        convs = list(conversations.find({"participants": email}).sort("updated_at", DESCENDING))
        return jsonify({"conversations": [_serialize_conversation(c) for c in convs]}), 200
    except Exception as e:
        print("❌ /api/messages error:", repr(e))
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
            {"$push": {"messages": msg}, "$set": {"updated_at": datetime.now(UTC)}},
        )
        if res.matched_count == 0:
            return jsonify({"message": "Conversation not found"}), 404

        safe_msg = {**msg, "timestamp": _iso(msg["timestamp"])}

        # Emit real-time to both users if connected/registered
        socketio.emit("new_message", {"conversationId": conv_id, "message": safe_msg}, room=from_email)
        socketio.emit("new_message", {"conversationId": conv_id, "message": safe_msg}, room=to_email)

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
        docs = list(contacts.find({"ownerEmail": email}).sort("created_at", DESCENDING))
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
    socketio.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
