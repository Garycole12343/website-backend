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
resources_col = db["resources"]
conversations = db["conversations"]
contacts = db["contacts"]

print("✅ MongoDB skillswap.users ready!")
print("✅ MongoDB skillswap.resources ready!")
print("✅ MongoDB skillswap.conversations ready!")
print("✅ MongoDB skillswap.contacts ready!")

# -----------------------------
# Helpers
# -----------------------------
def _iso(v):
    return v.isoformat() if isinstance(v, datetime) else v

def _serialize_conversation(conv_doc):
    """Make conversation JSON-safe (ObjectId + datetime)."""
    if not conv_doc:
        return None

    c = dict(conv_doc)

    # Keep the Mongo id for debugging, but don’t rely on it in frontend
    mongo_id = c.pop("_id", None)
    c["mongoId"] = str(mongo_id) if mongo_id else None

    # Ensure we always have "id" (your UUID string)
    # (If missing, fallback to mongoId)
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

# -----------------------------
# Home
# -----------------------------
@app.get("/")
def home():
    return jsonify({"message": "Flask + MongoDB Backend Live!"})

# =====================================================
# RESOURCES
# =====================================================
@app.route("/api/resources", methods=["GET", "POST"])
def resources_route():
    if request.method == "GET":
        category = request.args.get("category", "").strip()
        query = {"category": category} if category else {}

        docs = []
        for doc in resources_col.find(query):
            d = dict(doc)
            oid_str = str(d["_id"])
            d["_id"] = oid_str
            d["id"] = oid_str
            docs.append(d)

        def sort_key(x):
            v = x.get("created_at")
            return v if isinstance(v, datetime) else (v or "")

        docs.sort(key=sort_key, reverse=True)
        return jsonify({"resources": docs}), 200

    data = request.get_json(silent=True) or {}
    if "title" not in data or not str(data.get("title", "")).strip():
        return jsonify({"message": "title required"}), 400

    data.setdefault("likes", 0)

    doc = {**data, "created_at": datetime.now(UTC)}
    result = resources_col.insert_one(doc)

    inserted = resources_col.find_one({"_id": result.inserted_id})
    inserted_out = dict(inserted)
    oid_str = str(inserted_out["_id"])
    inserted_out["_id"] = oid_str
    inserted_out["id"] = oid_str

    return jsonify(inserted_out), 201


@app.route("/api/resources/<resource_id>", methods=["PUT"])
def update_resource(resource_id):
    data = request.get_json(silent=True) or {}

    if "likes" not in data:
        return jsonify({"message": "likes required"}), 400

    if not resource_id or resource_id in ("undefined", "null"):
        return jsonify({"message": "Invalid resource ID (missing)"}), 400

    oid = None
    try:
        oid = ObjectId(resource_id)
    except Exception:
        oid = None

    filter_query = {"_id": oid} if oid else {"id": resource_id}

    result = resources_col.update_one(filter_query, {"$set": {"likes": data["likes"]}})
    if result.matched_count == 0:
        return jsonify({"message": "Resource not found"}), 404

    updated = resources_col.find_one(filter_query)
    out = dict(updated)
    oid_str = str(out["_id"])
    out["_id"] = oid_str
    out["id"] = oid_str
    return jsonify(out), 200

# =====================================================
# AUTH
# =====================================================
@app.post("/api/register")
def register():
    data = request.get_json(silent=True) or {}

    required = ["firstName", "lastName", "email", "password", "interests", "skillLevel"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"message": "Missing fields", "missing": missing}), 400

    email = str(data["email"]).strip().lower()
    if users.find_one({"email": email}):
        return jsonify({"message": "Email already registered"}), 409

    if len(str(data["password"])) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    user = {
        "firstName": str(data["firstName"]).strip(),
        "lastName": str(data["lastName"]).strip(),
        "email": email,
        "password": generate_password_hash(data["password"]),
        "interests": data["interests"],
        "skillLevel": data["skillLevel"],
        "profile": {},
        "created_at": datetime.now(UTC)
    }

    users.insert_one(user)
    return jsonify({"message": "User created"}), 201


@app.post("/api/login")
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")

    user = users.find_one({"email": email})
    if not user or not check_password_hash(user.get("password", ""), password):
        return jsonify({"message": "Invalid credentials"}), 401

    user_out = dict(user)
    user_out["id"] = str(user_out["_id"])
    user_out.pop("_id", None)
    user_out.pop("password", None)

    return jsonify({"user": user_out}), 200

# =====================================================
# PROFILE
# =====================================================
@app.route("/api/profile", methods=["GET", "POST"])
def profile():
    if request.method == "GET":
        email = request.args.get("email", "").strip().lower()
        if not email:
            return jsonify({"message": "Email required"}), 400

        user = users.find_one({"email": email})
        if not user:
            return jsonify({"profile": None}), 200

        profile_obj = user.get("profile", {}) or {}
        profile_data = {
            "name": f"{user.get('firstName', '')} {user.get('lastName', '')}".strip() or "",
            "pronouns": profile_obj.get("pronouns", ""),
            "age": profile_obj.get("age", ""),
            "skills": profile_obj.get("skills", ""),
            "qualifications": profile_obj.get("qualifications", ""),
            "image": profile_obj.get("image", "")
        }
        return jsonify({"profile": profile_data}), 200

    data = request.get_json(silent=True) or {}
    if "email" not in data or "profile" not in data:
        return jsonify({"message": "email and profile required"}), 400

    email = str(data["email"]).strip().lower()
    profile_update = data["profile"]

    if not isinstance(profile_update, dict):
        return jsonify({"message": "profile must be an object"}), 400

    profile_update["updatedAt"] = datetime.now(UTC)

    result = users.update_one(
        {"email": email},
        {"$set": {"profile": profile_update}},
        upsert=False
    )
    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "Profile saved"}), 200

# =====================================================
# MESSAGES / CONVERSATIONS (FIXED)
# =====================================================
@app.get("/api/messages")
def get_conversations():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"message": "Email required"}), 400

    # Correct array match
    docs = list(conversations.find({"participants": email}).sort("updated_at", -1))
    out = [_serialize_conversation(c) for c in docs]
    return jsonify({"conversations": out}), 200


@app.post("/api/messages/conversation")
def create_conversation():
    data = request.get_json(silent=True) or {}
    if "participants" not in data:
        return jsonify({"message": "participants array required"}), 400

    participants = [str(p).strip().lower() for p in data["participants"]]
    if len(participants) != 2:
        return jsonify({"message": "Exactly 2 participants required"}), 400

    # Normalize ordering so duplicates don’t happen
    participants_sorted = sorted(participants)

    existing = conversations.find_one({"participants": participants_sorted})
    if existing:
        return jsonify({"conversation": _serialize_conversation(existing)}), 200

    conv_id = str(uuid.uuid4())
    conversation = {
        "id": conv_id,
        "participants": participants_sorted,
        "messages": [],
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC)
    }

    conversations.insert_one(conversation)
    return jsonify({"conversation": _serialize_conversation(conversation)}), 201


@app.post("/api/messages/send")
def send_message():
    data = request.get_json(silent=True) or {}
    if not all(k in data for k in ["conversationId", "sender", "text"]):
        return jsonify({"message": "conversationId, sender, text required"}), 400

    raw_id = str(data["conversationId"]).strip()
    sender = str(data["sender"]).strip().lower()
    text = str(data["text"]).strip()

    if not raw_id or raw_id in ("undefined", "null"):
        return jsonify({"message": "Invalid conversationId"}), 400
    if not text:
        return jsonify({"message": "Message cannot be empty"}), 400

    message = {"sender": sender, "text": text, "timestamp": datetime.now(UTC)}

    # Try by UUID id first
    filter_query = {"id": raw_id}
    result = conversations.update_one(
        filter_query,
        {"$push": {"messages": message}, "$set": {"updated_at": datetime.now(UTC)}}
    )

    # If not found, try Mongo _id (ObjectId)
    if result.matched_count == 0:
        try:
            oid = ObjectId(raw_id)
            filter_query = {"_id": oid}
            result = conversations.update_one(
                filter_query,
                {"$push": {"messages": message}, "$set": {"updated_at": datetime.now(UTC)}}
            )
        except Exception:
            pass

    if result.matched_count == 0:
        return jsonify({"message": "Conversation not found"}), 404

    conv = conversations.find_one(filter_query)
    return jsonify({"conversation": _serialize_conversation(conv)}), 200

# =====================================================
# CONTACT FORM
# =====================================================
@app.post("/api/contact")
def submit_contact():
    data = request.get_json(silent=True) or {}
    if not data:
        return jsonify({"message": "No data provided"}), 400

    contact = {
        "name": data.get("name", ""),
        "email": data.get("email", ""),
        "message": data.get("message", ""),
        "created_at": datetime.now(UTC)
    }

    contacts.insert_one(contact)
    return jsonify({"message": "Message sent"}), 201

# =====================================================
# RUN
# =====================================================
print("\n📍 Registered routes:")
for rule in app.url_map.iter_rules():
    print(rule)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
