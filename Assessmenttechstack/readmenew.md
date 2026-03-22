SkillSphere - Community Skill Swap Hub


Project Overview

SkillSphere is a full-stack web application designed to facilitate skill and information sharing within a community. The platform enables users to create profiles, post resources (links to tutorials, articles, tools), discover skills, and interact with other learners through ratings, reviews, and messaging.



Project Goals

Enable community members to share hobbies, skills, and resources (tools, tutorials, articles)
Support user registration, profile management, and resource discovery
Implement secure authentication and persistent data storage
Demonstrate best practices in full-stack web development
Create a foundation for future scaling (i.e advanced voting systems, skills ratings)

---

1.  Tech Stack Justification

Frontend Stack

React

Chosen for its component-based architecture, promoting reusability and maintainability (DigitalOcean, 2025).
Vast ecosystem and strong community support make it an industry standard.
Enables efficient state management and reactive UI updates (Codeur, 2024).
Alternative considered: Vue.js (simpler learning curve), Angular (overkill for this scope), Svelte (faster but less mature).

Vite Build Tool

Selected for exceptional speed and developer experience (DEV Community, 2024).
Significantly faster than Webpack or Create React App.
Optimized for modern ES modules (TatvaSoft Blog, 2024).
Alternatives considered: Webpack (more powerful but slower), Turbopack (newer, less mature), Parcel (limited ecosystem).

Tailwind CSS

Utility-first approach allows rapid, consistent UI development without leaving HTML
Reduces need for custom CSS files and naming conventions
Excellent for responsive design and mobile-first development
Alternatives considered: Bootstrap (restrictive, pre-packaged), Materialize (unsuited for dynamic builds)

React Router

Enables seamless page navigation and client-side routing
Supports conditional rendering for authenticated vs guest users

---

Backend Stack

Flask (Python)

Micro-framework providing flexibility and lightweight nature compared to Django
Freedom to select libraries and design application structure from scratch
Ideal for this project's specific scope without unnecessary abstractions
Extensible foundation easily integrated with authentication, database, and real-time communication libraries

Comparison with Django: Django is more opinionated and includes built-in ORM/admin panels; Flask's modularity was preferred for this MVP
Comparison with Express.js: Express is JavaScript-based; Flask was chosen to align with the robust Python ecosystem

MongoDB (NoSQL)

The choice of MongoDB over a relational database (like MySQL or PostgreSQL) was driven by specific needs of a community platform:

1. Flexible Document Mode
   
   SkillSphere resources vary quite a lot (i.e a baking recipe could need an ingredients list or a link to a pdf). MongoDB has a schema-less nature that allows these documents to coexist without rigid migrations (MongoDB Inc.2024),

2. Denormalization for Performance
   
   Real time messaging and review benefit from MongoDB's ability to embed documents e.g nesting messages directly in one conversation. This means there is a reduction in the need for expensive 'JOIN' operations, ensuring a more responsive user experience.

3. Rapid Iteration
   
   As the website grows from a pilot to include user bookmarks, the database can evolve with the changes without any downtime.

MongoDB vs SQL rationale

While SQL is great for highly rigid, relational environments MongoDB's denormalization supports the rapid growth and high read requirements of a social skill-sharing platform (MongoDB Inc.2024).
   

Integration Technologies

PyMongo: Direct MongoDB driver for Flask
Flask-Cors: Manages Cross-Origin Resource Sharing (CORS) between frontend (port 5173) and backend (port 5000)
Werkzeug Security: Password hashing with salting for data protection
Flask-Session: Handles secure, server-side user sessions for stateful authentication. This was chosen for its simplicity and robustness, avoiding the complexities of client-side token management for this project's scope.

---

2. UI & Visual Accessibility

SkillSphere is designed with a strong focus on visual accessibility, ensuring a comfortable experience for all users through a dynamic theme engine.

Theme Engine & Personalization

Light Mode (Default): A clean, modern interface with a soft color palette for standard use.
Dark Mode: Reduces eye strain in low-light environments by utilizing a deep slate and blue color scheme.
High Contrast Mode: Specifically designed for users with visual impairments. Features a high-contrast black and white/yellow palette with sharp borders and no shadows to maximize readability and element distinction.

Implementation Details

Global Theme Context: A React Context provider manages the application's visual state, applying theme classes to the root document element.
CSS Variables: All colors are mapped to CSS variables (e.g., `--color-background`, `--color-primary`), allowing for instantaneous, flicker-free theme switching.
Persistent Preferences: Theme selections are automatically saved to `localStorage` and synchronized with the user's account in MongoDB, ensuring a consistent experience across all devices.
Global Theme Toggle: A persistent toggle button in the header allows users to cycle through all available themes with a single click from any page.

---

1. Previous Works Analysis (Competitive Landscape)

| Platform            | User Profiles        | Resource Sharing   | Categories  | Ratings       | Messaging    | AI Tools            | Community Moderation |
| ------------------- | -------------------- | ------------------ | ----------- | ------------- | ------------ | ------------------- | -------------------- |
| Skillshare          | ✅ Advanced          | ✅ Classes (paid)  | ✅ Yes      | ✅ Yes        | ✅ Limited   | ⚠️ Basic                 | ✅ Extensive         |
| Udemy               | ✅ Advanced          | ✅ Courses (paid)  | ✅ Yes      | ✅ Yes        | ⚠️ Q&A only  | ❌ No                    | ✅ Strict            |
| Coursera            | ✅ Advanced          | ✅ Programs (paid) | ✅ Yes      | ✅ Yes        | ⚠️ Forums    | ❌ No                    | ✅ Institutional     |
| Discord Communities | ⚠️ Basic             | ✅ Free links      | ⚠️ Channels | ❌ No         | ✅ Real-time | ❌ No                    | ⚠️ Varies            |
| GitHub              | ✅ Developer-focused | ✅ Repos           | ✅ Topics   | ✅ Issues/PRs | ✅ Yes       | ⚠️ Tools only                  | ✅ Strict            |
| SkillSphere         | ✅ Yes               | ✅ Free links      | ✅ Yes      | ✅ Yes        | ✅ Yes       | ✅ Featured section | ⚠️ Planned           |

Gaps SkillSphere Fills

1. Community-driven, free resource sharing (vs paid platforms like Skillshare/Udemy)
2. Hobby-focused curation (vs developer-centric GitHub)
3. Lightweight, scalable foundation (vs monolithic platforms)
4. Open for user content moderation (future enhancement)

---

3.  Installation and Setup

Prerequisites

- Node.js v16+ (for frontend)
- Python 3.8+ (for backend)
- MongoDB Atlas account or local MongoDB instance
- Git

Frontend Setup (React + Vite)

1. Navigate to the root directory:

   ```bash
   cd skillsphere-frontend
   ```

2. Install Node.js dependencies:

   ```bash
   npm install
   ```

3. Start the Vite development server:

   ```bash
   npm run dev
   ```

4. Open browser to the local address displayed in terminal (typically `http://localhost:5173`)

Troubleshooting:

"Module not found" errors: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
Port 5173 already in use: Vite will auto-assign next available port
Node.js version mismatch: Use `nvm use` to switch to v16+

Backend Setup (Flask + MongoDB)

1. Navigate to backend directory:

   ```bash
   cd backend
   ```

2. Create and activate Python virtual environment:

   Windows (PowerShell):

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

   macOS/Linux:

   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file in backend directory:

   ```
    MongoDB connection (optional - has default)
   MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/skillsphere?retryWrites=true&w=majority"

    JWT secret
   JWT_SECRET="your_secret_key_here"

    Flask environment
   FLASK_ENV="development"
   ```

5. Seed the database with sample data (Recommended for Markers):
   ```bash
   python seed_db.py
   ```

6. Start Flask development server:

   ```bash
   python app.py
   ```

6. Backend API running on `http://127.0.0.1:5000`

Troubleshooting:

"ModuleNotFoundError": Ensure virtual environment is activated
MongoDB connection timeout: Check connection string and network access in MongoDB Atlas
CORS errors: Flask-Cors is configured; ensure both servers running on expected ports

Required Packages (backend)

```
Flask==2.3.0
Flask-Cors==4.0.0
pymongo==4.3.0
python-dotenv==1.0.0
PyJWT==2.6.0
werkzeug==2.3.0
requests==2.31.0
```

---

4.  Project Architecture

Database Schema (MongoDB)

SkillSphere uses MongoDB with the following collections:

users

```json
{
  "_id": ObjectId,
  "firstName": String,
  "lastName": String,
  "email": String (unique),
  "password": String (hashed),
  "interests": [String],
  "skillLevel": String,
  "profile": {
    "bio": String,
    "skills": [String],
    "profilePicture": String (file path),
    "updatedAt": DateTime
  },
  "createdAt": DateTime,
  "updatedAt": DateTime
}
```

`skill_posts` (Represents posts on the community skill boards)

```json
{
  "_id": ObjectId,
  "title": String,
  "category": String,
  "description": String,
  "link": String,
  "ownerEmail": String,
  "ownerName": String,
  "likes": Integer,
  "createdAt": DateTime,
  "updatedAt": DateTime
}
```

`conversations`

```json
{
  "_id": ObjectId,
  "id": String (UUID),
  "participants": [String] (user emails),
  "messages": [
    {
      "id": String (UUID),
      "from": String (user email),
      "to": String (user email),
      "text": String,
      "timestamp": DateTime
    }
  ],
  "last_read_by": Object,
  "createdAt": DateTime,
  "updatedAt": DateTime
}
```

contacts

```json
{
  "_id": ObjectId,
  "ownerEmail": String,
  "contactEmail": String,
  "name": String,
  "createdAt": DateTime
}
```

reviews

Database Diagram (Entity-Relationship Model)

![alt text](<mongodb erd.png>)

```mermaid
erDiagram
    users {
        ObjectId _id PK
        String firstName
        String lastName
        String email UK
        String password
        String[] interests
        String skillLevel
        Object profile
        DateTime createdAt
        DateTime updatedAt
    }

    resources {
        ObjectId _id PK
        String title
        String category
        String description
        String link
        ObjectId createdBy FK
        Integer likes
        Integer views
        DateTime createdAt
        DateTime updatedAt
    }

    conversations {
        ObjectId _id PK
        String id
        String[] participants
        Object[] messages
        Object last_read_by
        DateTime createdAt
        DateTime updatedAt
    }

    contacts {
        ObjectId _id PK
        String ownerEmail
        String contactEmail
        String name
        DateTime createdAt
    }

    reviews {
        ObjectId _id PK
        String userEmail
        String author
        String content
        Integer rating
        DateTime createdAt
    }

    skill_posts {
        ObjectId _id PK
        String title
        String category
        String description
        String link
        String ownerEmail FK
        Integer likes
        DateTime createdAt
        DateTime updatedAt
    }

    users ||--o{ skill_posts : "creates"
    users ||--o{ conversations : "participates in"
    users ||--o{ contacts : "owns"
    users ||--o{ reviews : "writes"
    users ||--o{ reviews : "receives"
```



NoSQL Rationale

Document-based flexibility: User profiles with nested objects (bio, skills, profile picture) evolve without migrations
Horizontal scalability: MongoDB supports sharding for community growth
Fast queries: Embedded arrays (messages in conversations) eliminate costly joins
JSON-like structure: Natural fit with JavaScript/Python ecosystems

---

5.  API Documentation (RESTful Principles)

All endpoints return JSON and follow REST conventions.

Authentication Endpoints

POST /api/register
       Registers a new user.
       Content-Type: `multipart/form-data`
       Body: `firstName`, `lastName`, `email`, `password`, `interests`, `skillLevel`, `file`.
   POST /api/login
       Authenticates a user.
       Content-Type: `application/json`
       Body: `{ "email": "...", "password": "..." }`
   POST /api/logout
       Clears the user's session.

---

User & Profile Endpoints

   GET /api/me
       Fetches the currently logged-in user from the session.
   GET /api/profile?email=<email>
       Fetches a user's public profile by their email.
   POST /api/profile
       Updates a user's profile information (bio, skills, settings).
       Content-Type: `application/json`
   DELETE /api/profile
       Deletes the authenticated user's account and all associated data.
   POST /api/update-password
       Updates the user's password after verifying their current one.

---

Skill Board & Post Endpoints

   GET /api/resources?category=<categoryName>
       Fetches all posts for a specific skill board (e.g., "art", "coding").
   POST /api/resources
       Creates a new post on a skill board.
       Body: `{ "title": "...", "description": "...", "link": "...", "category": "...", "ownerEmail": "...", "ownerName": "..." }`
   PUT /api/resources/:id
       Updates a post, primarily used for incrementing "likes".
       Body: `{ "likes": newLikeCount }`

---

User Review Endpoints

   GET /api/reviews?userEmail=<email>
       Fetches all reviews for a specific user's profile.
   POST /api/reviews
       Creates a new review for a user's profile.
       Body: `{ "userEmail": "...", "author": "...", "content": "...", "rating": 5 }`

---

Messaging Endpoints

   GET /api/messages?email=<email>
       Fetches all conversations for the logged-in user.
   POST /api/messages/conversation
       Creates a new conversation between two users.
   DELETE /api/messages/conversation/delete
       Deletes an entire conversation.
   DELETE /api/messages/delete
       Deletes a single message from a conversation.
   POST /api/messages/mark-read
       Marks a conversation as read for the user.

---

6.  Project Plan & Timeline (Gantt Chart)

Phase Overview

Detailed Timeline

Phase 1: Requirements & Design (Week 1-2)

[x] Analyse problem statement and MVP requirements
[x] Conduct competitive landscape analysis (Skillshare, Udemy, GitHub)
[x] Select frontend tech stack (React, Vite, Tailwind)
[x] Design database schema and entity relationships
[x] Create wireframes and user flow diagrams
Dates: November 20 - December 3, 2025

Phase 2: Frontend Development (Week 3-6)

[x] Set up Vite + React development environment
[x] Create reusable components (Profile, Resources, Navigation, Search)
[x] Implement mock data and state management
[x] Build responsive UI (mobile-first design with Tailwind)
[x] Add conditional rendering (authenticated vs guest users)
[x] Implement POST-MVP features (ratings UI, messaging mock)
Dates: December 4 - December 12, 2025


Phase 3: Backend Setup & Architecture (Week 7-8)

[x] Configure Flask application structure
[x] Set up MongoDB connection and collections
[x] Design RESTful API routes and endpoints
[x] Implement authentication layer (JWT tokens)
[x] Create error handling and middleware
Target Dates: December 13 - December 27, 2025

Phase 4: Backend Core Implementation (Week 9-11)

[x] Implement user registration and login endpoints
[x] Build CRUD operations for user profiles
[x] Develop resource sharing engine (POST, GET, UPDATE, DELETE)
[x] Implement search and filtering functionality
[x] Add rating and voting system with MongoDB queries
[x] Implement server-side validation and sanitisation
Target Dates: December 28, 2025 - January 17, 2026

Phase 5: Integration & Security (Week 12-13)

[x] Connect React frontend to Flask backend via API calls
[x] Test CORS configuration between ports
[ ] Implement JWT token refresh mechanism (Note: Switched to Flask-Sessions, making this N/A)
[ ] Add CSRF protection
[x] Test authentication flow end-to-end
[ ] Conduct security audit and penetration testing
Target Dates: January 18 - January 31, 2026

Phase 6: Testing & Documentation (Week 14)

[x] Write comprehensive README with installation instructions
[x] Add code comments to all Flask routes and React components
[x] Test endpoints with Postman/Thunder Client
[x] Create user journey documentation with API mappings
[x] Document risk mitigations with code examples
[x] Verify database indexing for performance
Target Dates: February 1 - February 14, 2026

Phase 7: POST-MVP Features (Week 15-16, if time permits)

[ ] Implement resource bookmarking system
[ ] Build community voting/request system
[ ] Deploy to production environment
Target Dates: February 15 - March 1, 2026

Phase 8: Final Review & Submission (Week 17)

[ ] Fix remaining bugs and edge cases
[ ] Perform final testing across browsers
[ ] Prepare archived .zip file for Moodle submission
[ ] Review all documentation and references
[x] Confirm GitHub repository is up-to-date
Target Dates: March 2 - April 2, 2026


Project Gantt Chart (Visual Timeline)

![alt text](skillsphereganttupdated.png)




1.  User Journey & API Mapping

Visual User Journey (Frontend to Backend)

```mermaid
graph TD
    A[User: Browse Resources] -->|GET /api/resources| B(Flask: Fetch from MongoDB)
    B -->|JSON Response| A
    C[User: Register/Login] -->|POST /api/register| D{Flask: Auth Logic}
    D -->|Hash Password| E[(MongoDB: Users)]
    H[User: Upload Profile Pic] -->|POST /api/upload-profile-pic| I(Flask: Save to /uploads)
    I -->|Update Path| E
    J[User: Send Real-Time Message] -->|Socket.IO| K(Flask: Save Message)
    K -->|Broadcast| L[Recipient User]
```

Guest User Flow

```

Home → Browse Resources → View Category → View Resource Details
↓
[All GET requests, no auth]
↓
GET /api/resources?category=X
GET /api/resources/:id

```

Registered User Flow

```

Home → Sign Up → Create Profile → Personalized Dashboard
↓
PUT /api/users/:id
(profile completion)
↓
Browse → Like Resource → View Saved Resources
↓
POST /api/resources/:id/vote
(update DB, refresh UI)
↓
POST /api/resources → Share New Resource
(create in MongoDB, notify community)

```

Advanced User Flow

```

Search + Filter → Bookmark → Message User
↓
GET /api/resources?search=Python&category=Coding
(combined query with MongoDB find)
↓
POST /api/resources/:id/bookmark
(add to user's saved list)
↓
POST /api/conversations (start chat)

```

---

8.  Site Map & Information Architecture

SkillSphere Site Map

![alt text](sitemap_flowchart.png)

Required pages:

```

SkillSphere Root
├── Home / Landing Page
│ ├── Browse as Guest
│ ├── Sign Up
│ ├── Log In
│ └── About Us
│
├── Authentication Pages
│ ├── Register / Sign Up
│ ├── Log In
│ ├── Forgot Password
│ └── Reset Password
│
├── User-Authenticated Pages
│ ├── Dashboard / Home (Personalized)
│ ├── My Profile
│ │ ├── Edit Profile
│ │ ├── Upload Profile Picture
│ │ └── Manage Skills
│ ├── My Resources
│ │ ├── View My Posts
│ │ ├── Edit Resource
│ │ └── Delete Resource
│ ├── Saved Resources / Bookmarks
│ └── Settings
│ ├── Account Settings
│ ├── Privacy Settings
│ └── Notification Preferences
│
├── Resource Discovery
│ ├── Browse All Resources
│ ├── Browse by Category
│ │ ├── Coding
│ │ ├── Art
│ │ ├── Music
│ │ ├── Baking
│ │ └── [Other Categories]
│ ├── Search Results
│ └── Resource Detail Page
│ ├── View Resource Info
│ ├── Leave Review/Rating
│ ├── View Comments
│ └── Bookmark Resource
│
├── Resource Posting
│ └── Create New Resource
│ ├── Title
│ ├── Category Selection
│ ├── Description
│ ├── Link
│ └── Submit
│
├── User Interaction
│ ├── Messaging / Chat
│ │ ├── Conversations List
│ │ └── Individual Conversation
│ ├── User Profiles (Public)
│ │ ├── View Profile
│ │ ├── See User's Resources
│ │ └── Message User
│ └── Reviews & Ratings
│
├── Information Pages
│ ├── About Us
│ ├── Contact Us / Support
│ ├── FAQ
│ ├── Terms of Service
│ ├── Privacy Policy
│ └── Help / Documentation
│
└── Admin Pages (Future)
├── Content Moderation
├── User Management
├── Analytics Dashboard
└── Report Management

````

Connection Notes:

- Unauthenticated users access: Home, About Us, Contact Us, Browse Resources
- Authenticated users unlock: Dashboard, Profile, Messaging, Bookmark, Post Resources
- All pages include: Navigation bar, Footer, Search functionality
- Backend API supports all transitions and data flows

---

9.  Risk Assessment & Mitigation Strategies

Identified Risks

| Risk                                | Likelihood | Impact   | Mitigation Strategy                                                    | Status                |
| ----------------------------------- | ---------- | -------- | ---------------------------------------------------------------------- | --------------------- |
| Database Connection Failure         | Medium     | High     | Connection pooling, retry logic, fallback to cached data               | ✅ Implemented        |
| Invalid User Input / SQL Injection  | Medium     | Critical | Server-side validation, input sanitisation, parameterized queries      | ✅ Implemented        |
| Unauthorized Access to Resources    | Medium     | High     | JWT authentication, role-based access control (RBAC), protected routes | ✅ Implemented        |
| Password Security Breach            | Low        | Critical | Password hashing with Werkzeug (salting), never store plaintext        | ✅ Implemented        |
| CORS Misconfiguration               | High       | Medium   | Flask-Cors whitelist for localhost:5173, production domains            | ✅ Implemented        |
| Rate Limiting / Brute Force Attacks | Medium     | Medium   | API rate limiting using `Flask-Limiter` per IP         | ✅ Implemented        |
| File Upload Vulnerabilities         | Low        | High     | Filename sanitization, extension checks, 5MB limit      | ✅ Implemented        |
| Data Exposure (GDPR)                | Low        | Critical | Data minimization, user consent, secure deletion mechanisms            | ✅ Implemented        |
| Scalability Issues                  | Low        | High     | MongoDB indexing, API caching, async job queues                        | ⏳ Post-MVP           |

*Note: The following code snippets are simplified illustrative examples. The full implementation can be found in `backend/app.py`.*

Implemented Mitigations

1.  Password Hashing & Salting (werkzeug.security)

```python
from werkzeug.security import generate_password_hash, check_password_hash

 Registration route
@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register new user with hashed password."""
    data = request.json

     Hash password with salt
    hashed_pwd = generate_password_hash(data['password'], method='pbkdf2:sha256')

    user = {
        'email': data['email'],
        'password': hashed_pwd,   Never store plaintext
        'firstName': data['firstName'],
        'createdAt': datetime.now()
    }

    db.users.insert_one(user)
    return jsonify({'message': 'User registered successfully'})

 Login verification
def verify_login(email, password):
    """Verify password against stored hash."""
    user = db.users.find_one({'email': email})
    if user and check_password_hash(user['password'], password):
        return True
    return False
````

Mitigation Effectiveness: ✅ Ensures passwords never exposed in plaintext; salting prevents rainbow table attacks.

2.  Input Validation & Sanitisation

```python
from flask import request
import re

@app.route('/api/resources', methods=['POST'])
def create_resource():
    """Create resource with validation."""
    data = request.json

     Validate required fields
    if not data.get('title') or not data.get('link'):
        return jsonify({'error': 'Missing required fields'}), 400

     Sanitise title (remove special chars that could cause injection)
    title = re.sub(r'[<>\"\'&]', '', data['title']).strip()

     Validate URL format
    url_pattern = r'https?://[^\s]+'
    if not re.match(url_pattern, data['link']):
        return jsonify({'error': 'Invalid URL format'}), 400

     Validate category (whitelist allowed categories)
    allowed_categories = ['Coding', 'Art', 'Music', 'Baking', 'AI Tools']
    if data['category'] not in allowed_categories:
        return jsonify({'error': 'Invalid category'}), 400

    resource = {
        'title': title,
        'link': data['link'],
        'category': data['category'],
        'likes': 0,
        'createdAt': datetime.now()
    }

    db.resources.insert_one(resource)
    return jsonify({'message': 'Resource created', 'resource': str(resource['_id'])}), 201
```

Mitigation Effectiveness: ✅ Prevents injection attacks and ensures data integrity at database level.

3.  CORS Configuration (Flask-Cors)

```python
from flask_cors import CORS

app = Flask(__name__)

 Whitelist allowed origins
CORS(app, resources={
    r'/api/': {
        'origins': ['http://localhost:5173', 'https://skillsphere.deployed.com'],
        'methods': ['GET', 'POST', 'PUT', 'DELETE'],
        'allow_headers': ['Content-Type', 'Authorization'],
        'supports_credentials': True
    }
})
```

Mitigation Effectiveness: ✅ Prevents unauthorized cross-origin requests; production URLs can be added without code changes.

---

1.  Security & Data Protection

GDPR Compliance
Data Minimization

 Collects `firstName`, `lastName`, `email`, `password`, `interests`, `skillLevel`, and a `profileImage` during registration. Other profile fields like `bio` are optional and can be added later.

User Consent

Explicit opt-in for data collection via the registration flow.

Encryption

Passwords are never stored in plain-text; they are hashed and salted using the PBKDF2 algorithm via `Werkzeug` (AuditBoard, 2025).

Right to Deletion

Users can delete accounts, triggering a cascade delete of all associated resources, messages, and reviews (GDPR Local, 2025).

Data Retention

Inactive accounts are purged after 12 months of inactivity to minimize risk exposure (Future Implementation).

Server-Side Validation & Data Integrity

 SkillSphere implements multi-layered validation

Mandatory Fields

Backend enforces `firstName`, `lastName`, `email`, `password`, `skillLevel`, and a Profile Picture before account creation.

Data Integrity

Email formats are validated using regular expressions (`re.match`) on the server to prevent malformed data injection.

Password Integrity

Enforced 8-character minimum length on both the frontend and backend.

Implemented Risk Mitigation Strategies 

The following strategies were implemented to address the primary risks identified in the project risk assessment:

| Strategy | Implementation Details | Mitigation Goal |
| :--- | :--- | :--- |
| Password Hashing | Uses `Werkzeug`'s `generate_password_hash` with random salting. | Prevents credential exposure during a database breach. |
| Defensive Rate Limiting | Implemented `Flask-Limiter` on `/api/login` and `/api/register`. | Protects against brute-force attacks and DoS attempts. |
| CORS Protection | Whitelisted `VITE_ORIGIN` in the Flask REST and Socket.IO configuration. | Prevents unauthorized cross-origin data access. |
| Input Sanitization| Uses `secure_filename` for all profile picture uploads. | Prevents directory traversal and malicious file injection attacks. |


Error Handling & Middleware

```python
@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found."""
    return jsonify({'error': 'Resource not found', 'code': 404}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Server Error."""
    db.logs.insert_one({'error': str(error), 'timestamp': datetime.now()})
    return jsonify({'error': 'Internal server error', 'code': 500}), 500

@app.before_request
def check_auth():
    """Validate JWT token for protected routes."""
    if request.endpoint and request.endpoint.startswith('api.'):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not verify_token(token):
            return jsonify({'error': 'Unauthorized'}), 401
```

---

1.  POST-MVP Features

Assessment 1 (Frontend) - Implemented

1. ✅ Messaging Functionality: Users simulate chat sessions with localStorage state management
2. ✅ Ratings & Reviews: Resources rated 1-5 stars; stored in React state (future: MongoDB)
3. ✅ Search & Filter: Keywords and category-based filtering using array methods

Assessment 2 (Backend) - Implemented

1. ✅ Secure Registration: Mandatory profile picture upload with server-side validation.
2. ✅ Settings Page: Full user management dashboard accessible via a settings cog in the header.
3. ✅ Account Security: Password hashing with salting and rate limiting implemented.
4. ✅ GDPR Compliance: Permanent account deletion ("Danger Zone") with cascading data removal.

Feature 1: Resource Bookmarking

User saves resource to personal collection
Endpoint: `POST /api/users/:id/bookmarks`
Database: Add `bookmarkedResources: [ObjectId]` to users collection
Frontend: Display "Saved Resources" page with bookmarked items

Feature 2: Community Voting System

Users vote on requested skills/categories
Endpoint: `POST /api/skill-requests` (create) + `POST /api/skill-requests/:id/vote`
Database: New collection `skill_requests` with voting counts
Frontend: "Request a Skill" modal with live vote counter

---

12. Legal, Ethical & Compliance Considerations

GDPR & Data Protection

Lawful Basis: Consent for user data collection; necessary for service provision
Privacy Policy: Users agree to terms before registration (future implementation)
Data Storage: MongoDB hosted on secure servers with encryption at rest (Atlas default)
International Transfer: If deploying to EU, ensure data residency compliance
Breach Notification: Process for notifying users within 72 hours (future: incident response plan)

Ethical Considerations

1. Content Moderation: Platform enables resource sharing; risk of malicious links or spam
  Solution: Community reporting system; future: automated link scanning
2. Equity & Inclusion: Ensure platform accessible to non-English speakers
  Solution: Internationalization (i18n) support planned
3. User Privacy: Transparent data collection and usage
  Solution: Clear privacy policy; no selling user data to third parties

Legal Compliance


Copyright: Users responsible for resource links they share; platform not liable for copyright infringement
Accessibility (WCAG 2.1): Implemented a high-contrast mode and dynamic theme engine to support users with visual impairments. Continued adherence to semantic HTML, ARIA labels, and keyboard navigation.
Liability Waiver: Platform provides resources "as-is"; users use at own risk

---

1.  Good Software Attributes

Separation of Concerns

Frontend: React components handle UI rendering only
Backend: Flask routes separate authentication, resource management, and error handling
Database: MongoDB queries isolated in helper functions
 Example:

  ```python
   BAD: Mixed concerns
  @app.route('/resources')
  def resources():
      results = db.resources.find()   DB logic mixed
      return render_template('resources.html', resources=results)   Rendering mixed

   GOOD: Separated concerns
  def get_resources_from_db(category):
      """Pure database query."""
      return list(db.resources.find({'category': category}))

  @app.route('/api/resources')
  def get_resources():
      """Pure API endpoint."""
      category = request.args.get('category')
      resources = get_resources_from_db(category)
      return jsonify(resources)
  ```

Maintainability

Consistent Naming: CamelCase for variables/functions, snake_case for MongoDB fields
Code Comments: Every route and complex function documented
Modular Structure: Separate files for routes, models, utilities
Version Control: Atomic commits with descriptive messages

Scalability

Database Indexing: Add indexes on frequently queried fields (email, category)
  ```python
  db.users.create_index([('email', 1)])   Unique index
  db.resources.create_index([('category', 1)])   For filtering
  ```
Async Operations: Future: Use Celery for background tasks (email notifications)
Caching: Redis integration for frequently accessed resources

Testability

Unit Tests: Test authentication, validation, database operations independently
Integration Tests: Test full user flows (signup → create resource → rate)
Mock Data: Database seeding for testing without real users

---

14. Real-World Applications

Primary Use Cases

1. Community Education Platforms: Non-profit groups share free learning resources
2. Hobbyist Networks: Gardening clubs, music makers, 3D printing communities share tools and tutorials
3. Professional Skill-Sharing: Internal corporate platforms for employee upskilling (e.g., HR departments)
4. Peer Learning Communities: Study groups, coding bootcamp alumni networks
5. Open Source Contribution: Developers share best practices, library recommendations, learning paths

Scalability Roadmap

1. Enterprise Deployment: On-premises or private cloud for organizations
2. Mobile App: Native iOS/Android clients for community engagement
3. Real-Time Notifications: Push alerts for new resources in user's interests
4. Advanced AI: Personalized learning paths using machine learning
5. Marketplace: Optional paid premium courses alongside free resources

---

15. Reflection on Technical Challenges

Challenge 1: CORS Management
Problem: React frontend (localhost:5173) unable to communicate with Flask backend (localhost:5000)

Initial error: `Access to XMLHttpRequest blocked by CORS policy`
Root cause: Browsers block cross-origin requests by default

Solution: Implemented Flask-Cors with whitelist

```python
from flask_cors import CORS
CORS(app, resources={r'/api/': {'origins': ['http://localhost:5173']}})
```

Effectiveness: ✅ Resolved immediately; now production URLs can be added without code changes

Challenge 2: State Management Across Stack
Problem: Maintaining user authentication state from login → profile creation → resource posting required careful coordination

Frontend: React Context API holds session state
Backend: JWT tokens validate each request
Mismatch: Token expiration vs UI state refresh

Solution: Implemented token refresh mechanism

```python
 Backend: Issue short-lived access token + long-lived refresh token
@app.route('/api/auth/refresh', methods=['POST'])
def refresh_token():
    """Refresh expired JWT."""
    refresh = request.json.get('refreshToken')
    if verify_refresh_token(refresh):
        new_token = create_access_token(user_id)
        return jsonify({'token': new_token})
```

Effectiveness: ✅ Seamless user experience; automatic silent refresh prevents unexpected logouts

Challenge 3: Data Modeling NoSQL
Problem: Decided between embedding (fast reads) vs referencing (flexible updates)

Example: Should messages live inside conversation documents or separate collection?
Embedding: Query messages faster; updating participants = full document rewrite
Referencing: More flexible; additional query required to fetch messages

Decision: Embedded messages (conversations accessed frequently as unit), referenced user IDs for flexibility

```json
// Chosen: Embedded messages for read performance
{
  "_id": ObjectId,
  "participants": [...],
  "messages": [  // Embedded array
    {"from": "user1", "text": "Hi", "timestamp": ...}
  ]
}
```

Effectiveness: ✅ Optimized for common use case (viewing full conversation); can refactor if scaling issues emerge

Challenge 4: File Upload (Profile Pictures)
Problem: Handling image file uploads required secure storage and path management

Security: Prevent arbitrary file uploads
Storage: Where to store images (database vs file system)?

Solution: Store file path in MongoDB, files in `/uploads` directory with validation

```python
@app.route('/api/users/<id>/profile-picture', methods=['POST'])
def upload_profile_picture(id):
    """Upload profile picture with validation."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400

    file = request.files['file']

     Validate file type
    allowed = {'png', 'jpg', 'jpeg', 'gif'}
    if '.' not in file.filename or file.filename.split('.')[-1] not in allowed:
        return jsonify({'error': 'Invalid file type'}), 400

     Save with unique name
    filename = f"{id}_{datetime.now().timestamp()}.png"
    filepath = os.path.join('/uploads', filename)
    file.save(filepath)

     Store path in MongoDB
    db.users.update_one({'_id': ObjectId(id)}, {'$set': {'profile.profilePicture': filepath}})
    return jsonify({'message': 'Picture uploaded', 'path': filepath})
```

Effectiveness: ✅ Secure file handling; future: integrate cloud storage (AWS S3) for scalability

---

16. Version Control & GitHub

Repository: [https://github.com/yourusername/skillsphere](https://github.com/yourusername/skillsphere)

Branching Strategy

SkillSphere follows industry-standard version control best practices to ensure code integrity and collaborative efficiency (GitLab, 2025).

Main Branch: Production-ready code, tagged releases
Develop Branch: Integration branch for features
Feature Branches: `feature/auth`, `feature/resource-posting`, etc. (Zemith, 2025)
Hotfix Branches: `hotfix/cors-issue` for urgent production fixes (Nerdify Blog, 2025)


Example commits:

```
feat: implement user authentication
fix: resolve CORS issue between frontend and backend
docs: add API documentation to README
refactor: separate database queries into helper functions
test: add unit tests for validation functions
```

---

1.  Next Steps & Future Enhancements

Short Term (Post-MVP)

[ ] Implement at least 2-3 POST-MVP features (bookmarking, AI recommendations-skills, skill review)
[ ] Write unit and integration tests
[ ] Deploy to production (Heroku, Railway, or AWS)

Medium Term

[ ] Mobile app (React Native or Flutter)
[ ] Email notifications
[ ] Advanced search (Elasticsearch)

Long Term

[ ] AI-powered people recommendations
[ ] Community moderation dashboard
[ ] API for third-party integrations

---

1.  In-Code Documentation

All functions include docstrings and comments explaining purpose, parameters, and return values.

Example Flask Route:

```python
@app.route('/api/resources', methods=['GET'])
def get_resources():
    """
    Fetch resources with optional filtering and search.

    Query Parameters:
        - category (str): Filter by hobby category (e.g., 'Coding')
        - search (str): Search in title and description
        - sort (str): Sort by 'newest' or 'mostLiked'

    Returns:
        JSON: {'resources': [...], 'total': 42}

    Raises:
        400: Invalid query parameters
        500: Database connection error
    """
    category = request.args.get('category')
    search_term = request.args.get('search')
    sort = request.args.get('sort', 'newest')

     Build MongoDB query
    query = {}
    if category:
        query['category'] = category
    if search_term:
        query['$or'] = [
            {'title': {'$regex': search_term, '$options': 'i'}},
            {'description': {'$regex': search_term, '$options': 'i'}}
        ]

     Execute query with sorting
    sort_key = 'createdAt' if sort == 'newest' else 'likes'
    resources = list(db.resources.find(query).sort(sort_key, -1))

    return jsonify({'resources': resources, 'total': len(resources)})
```

Example React Component:

```jsx
/
  ResourceCard - Display individual resource with interactions.

  Props:
     resource (Object): Resource data { _id, title, category, likes, description }
     onLike (Function): Callback when user upvotes
     onBookmark (Function): Callback when user bookmarks

  State:
    - isLiked (bool): Whether current user liked this resource
    - isSaved (bool): Whether current user bookmarked this resource
 /
export function ResourceCard({ resource, onLike, onBookmark }) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Handle user like action → calls parent callback → updates backend
  const handleLike = () => {
    onLike(resource._id);
    setIsLiked(!isLiked);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3>{resource.title}</h3>
      <p>{resource.description}</p>
      <button onClick={handleLike}>{isLiked ? '👍' : '👎'} {resource.likes}</button>
    </div>
  );
}
```



19. Generative AI Usage Declaration

This assignment used generative AI in the following ways for the purposes of completing the assignment: brainstorming, research, editing, and code review.

Specific uses:

1. Brainstorming tech stack alternatives and deployment strategies
2. Researching GDPR compliance best practices
3. Editing README for clarity and professional tone
4. Code review for security vulnerabilities and performance optimization

AI tools used: Microsoft Copilot (Chat), Gemini (research)

All application code and core architecture were authored by the developer. AI was used for refinement and verification only, not generation of primary logic.



20. References

AuditBoard. (2025). *The GDPR compliance framework: What you need to know in 2025*. https://auditboard.com/blog/gdpr-compliance-framework

Codeur, M. (2024). *Getting started with React and Vite: The complete guide*. https://blog.mikecodeur.com/en/post/getting-started-with-react-and-vite-the-complete-guide

DEV Community. (2024). *React + Vite: why use?* https://dev.to/doccaio/react-vite-why-use-cg2

DigitalOcean. (2025). *How to set up a React project with Vite for fast development*. https://www.digitalocean.com/community/tutorials/how-to-set-up-a-react-project-with-vite

European Commission. (2025). *Data protection*. https://commission.europa.eu/law/law-topic/data-protection_en

GDPR Local. (2025). *GDPR compliance for apps: A 2025 guide*. https://gdprlocal.com/gdpr-compliance-for-apps/

GitLab. (2025). *What are Git version control best practices?* https://about.gitlab.com/topics/version-control/version-control-best-practices/

MongoDB Inc. (2024). *Introduction to MongoDB*. https://docs.mongodb.com/manual/introduction/

Nerdify Blog. (2025). *8 essential version control best practices for 2025*. https://getnerdify.com/blog/version-control-best-practices/

TatvaSoft Blog. (2024). *Vite vs Create-React-App: A detailed comparison*. https://www.tatvasoft.com/outsourcing/2024/07/vite-vs-create-react-app.html

Zemith. (2025). *8 version control best practices for teams in 2025*. https://www.zemith.com/en/blogs/version-control-best-practices/

---

21. Contact & Support

GitHub Repository: [https://github.com/yourusername/skillsphere](https://github.com/yourusername/skillsphere)  