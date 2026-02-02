from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, UTC
from bson import ObjectId

app = Flask(__name__)

# Dev CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

client = MongoClient("mongodb://localhost:27017/")
db = client["skillswap"]

users = db["users"]
resources = db["resources"]  # ✅ for boards + Skills Library

print("✅ MongoDB skillswap.users ready!")
print("✅ MongoDB skillswap.resources ready!")


@app.get("/")
def home():
    return jsonify({"message": "Flask + MongoDB Backend Live!"})


# -----------------------------
# Auth
# -----------------------------

@app.post("/api/register")
def register():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No JSON received. Send Content-Type: application/json"}), 400

    required = ["firstName", "lastName", "email", "password", "interests", "skillLevel"]
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"message": "Missing fields", "missing": missing}), 400

    email = str(data["email"]).strip().lower()
    if not email:
        return jsonify({"message": "Email is required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"message": "An account with this email already exists."}), 409

    password = str(data["password"])
    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    interests = data.get("interests", [])
    if not isinstance(interests, list) or len(interests) == 0:
        return jsonify({"message": "Select at least one interest"}), 400

    skill_level = str(data.get("skillLevel", "")).strip()
    if not skill_level:
        return jsonify({"message": "Select a skill level"}), 400

    user = {
        "firstName": str(data["firstName"]).strip(),
        "lastName": str(data["lastName"]).strip(),
        "email": email,
        "password": generate_password_hash(password),
        "interests": interests,
        "skillLevel": skill_level,
        "created_at": datetime.now(UTC),

        # profile stored here
        "profile": {}
    }

    result = users.insert_one(user)
    return jsonify({"message": "User created", "id": str(result.inserted_id)}), 201


@app.post("/api/login")
def login():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No JSON received. Send Content-Type: application/json"}), 400

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if not check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid email or password"}), 401

    safe_user = {
        "id": str(user["_id"]),
        "firstName": user.get("firstName", ""),
        "lastName": user.get("lastName", ""),
        "email": user.get("email", ""),
        "interests": user.get("interests", []),
        "skillLevel": user.get("skillLevel", "")
    }

    return jsonify({"message": "Login successful", "user": safe_user}), 200


# -----------------------------
# Profile (stored inside users.profile)
# -----------------------------

@app.get("/api/profile")
def get_profile():
    email = request.args.get("email", "").strip().lower()
    if not email:
        return jsonify({"message": "Email is required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    profile = user.get("profile", {}) or {}
    return jsonify({"message": "Profile loaded", "profile": profile}), 200


@app.post("/api/profile")
def save_profile():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No JSON received. Send Content-Type: application/json"}), 400

    email = str(data.get("email", "")).strip().lower()
    profile = data.get("profile", None)

    if not email:
        return jsonify({"message": "Email is required"}), 400
    if not isinstance(profile, dict):
        return jsonify({"message": "profile must be an object"}), 400

    allowed = {"name", "pronouns", "age", "skills", "qualifications", "image"}
    cleaned = {k: profile.get(k, "") for k in allowed}

    result = users.update_one(
        {"email": email},
        {"$set": {"profile": cleaned, "profile_updated_at": datetime.now(UTC)}}
    )

    if result.matched_count == 0:
        return jsonify({"message": "User not found"}), 404

    return jsonify({"message": "Profile updated", "profile": cleaned}), 200


# -----------------------------
# Resources (persist board posts in MongoDB)
# Used by skills library + all boards
# -----------------------------

@app.get("/api/resources")
def list_resources():
    """
    Optional filters:
      - category=javascript/react/etc
      - email=user@example.com
    """
    category = request.args.get("category")
    email = request.args.get("email")

    query = {}
    if category:
        query["category"] = category.strip().lower()
    if email:
        query["ownerEmail"] = email.strip().lower()

    docs = list(resources.find(query).sort("created_at", -1))

    for d in docs:
        d["id"] = str(d["_id"])
        d.pop("_id", None)

    return jsonify({"resources": docs}), 200


@app.post("/api/resources")
def create_resource():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    required = ["title", "category", "ownerEmail"]
    missing = [k for k in required if not str(data.get(k, "")).strip()]
    if missing:
        return jsonify({"message": "Missing fields", "missing": missing}), 400

    doc = {
        "title": str(data["title"]).strip(),
        "description": str(data.get("description", "")).strip(),
        "link": str(data.get("link", "")).strip(),
        "category": str(data["category"]).strip().lower(),   # e.g. "javascript"
        "ownerEmail": str(data["ownerEmail"]).strip().lower(),
        "ownerName": str(data.get("ownerName", "")).strip(),
        "likes": int(data.get("likes", 0)) if str(data.get("likes", "")).isdigit() else 0,
        "created_at": datetime.now(UTC),
        "updated_at": datetime.now(UTC),
    }

    result = resources.insert_one(doc)
    return jsonify({"message": "Resource created", "id": str(result.inserted_id)}), 201


@app.put("/api/resources/<resource_id>")
def update_resource(resource_id):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"message": "No JSON received"}), 400

    allowed = {"title", "description", "link", "likes"}
    updates = {k: data[k] for k in allowed if k in data}

    if "title" in updates:
        updates["title"] = str(updates["title"]).strip()
    if "description" in updates:
        updates["description"] = str(updates["description"]).strip()
    if "link" in updates:
        updates["link"] = str(updates["link"]).strip()
    if "likes" in updates:
        try:
            updates["likes"] = int(updates["likes"])
        except Exception:
            return jsonify({"message": "likes must be a number"}), 400

    updates["updated_at"] = datetime.now(UTC)

    try:
        oid = ObjectId(resource_id)
    except Exception:
        return jsonify({"message": "Invalid resource id"}), 400

    result = resources.update_one({"_id": oid}, {"$set": updates})
    if result.matched_count == 0:
        return jsonify({"message": "Resource not found"}), 404

    return jsonify({"message": "Resource updated"}), 200


@app.delete("/api/resources/<resource_id>")
def delete_resource(resource_id):
    try:
        oid = ObjectId(resource_id)
    except Exception:
        return jsonify({"message": "Invalid resource id"}), 400

    result = resources.delete_one({"_id": oid})
    if result.deleted_count == 0:
        return jsonify({"message": "Resource not found"}), 404

    return jsonify({"message": "Resource deleted"}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)
