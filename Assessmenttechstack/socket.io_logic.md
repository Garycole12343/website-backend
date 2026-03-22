# Socket.IO Implementation Logic - SkillSphere

This document outlines the real-time communication architecture and implementation details for the SkillSphere platform.

---

## 1. Core Architecture Overview
The system uses a Room-based Messaging pattern. Instead of broadcasting messages to every connected client, the server organizes connections into private "Rooms" identified by the user's email address.

- Backend: Flask-SocketIO (Python)
- Frontend: Socket.io-client (React/JavaScript)
- Database: MongoDB (BSON storage for messages)

---

## 2. Connection & Registration Flow

### Step A: Frontend Handshake
When a user logs in, the `socketService.connect(email)` method is triggered. It initializes a connection to the backend with specific configurations:
- Transports: Tries `websocket` first, falls back to `polling`.
- Reconnection: Automatically attempts to reconnect up to 5 times if the connection drops.
- Credentials: Enabled to allow session/cookie sharing.

### Step B: Backend Room Assignment
Upon a successful connection, the frontend sends a `register` event. The backend then executes the following logic:
```python
@socketio.on("register")
def on_register(payload):
    email = payload.get("email")
    join_room(email)  # Creates/Joins a room named after the email
```
Why this works: By placing the user in a room named after their email, the server can send messages to a specific user simply by knowing their email, without needing to track their volatile Socket ID.

---

## 3. Real-time Messaging Logic

### Sending a Message
1. The sender's browser emits a `send_message` event via the `SocketService`.
2. The Backend receives this event, generates a unique Message ID and Timestamp, and saves it to the `conversations` collection in MongoDB.
3. The Backend then "targets" the rooms of both the sender and the recipient:
   ```python
   emit("new_message", data, room=from_email) # Update sender's UI
   emit("new_message", data, room=to_email)   # Update recipient's UI in real-time
   ```

### Receiving a Message
1. The `SocketService` on the receiving end listens for the `new_message` event.
2. It triggers an internal "Pub/Sub" event called `NEW_MESSAGE`.
3. Any React component (Message lists, Notification bells) subscribed to this service instantly receives the new message data and updates the UI without a page refresh.

---

## 4. Key Implementation Strengths

### ⚡ The Singleton Pattern
The frontend uses a single instance of the `SocketService` across the entire application. This prevents "connection leaks" and ensures that multiple components aren't fighting over the same socket connection.

### 🛡️ Event Cleanup (Debouncing)
Before setting up new listeners, the service runs `.off()` on all events. This is a critical safeguard that prevents "event stacking"—a bug where a single message might trigger a notification sound or UI update multiple times.

### 🔄 State Resilience
The service includes logic to handle user changes. If a user logs out and another logs in on the same machine, the service detects the email change, disconnects the old socket, and establishes a fresh connection for the new identity.

### 🧪 Mock Fallback
The implementation includes a `setupMockConnection()` method. If the backend server is unreachable, the system enters a "Mock Mode" that simulates successful connections, allowing the frontend UI to remain functional for development and testing.

---

## 5. Technical Summary of Events

| Event Name | Direction | Purpose |
| :--- | :--- | :--- |
| `connect` | Client → Server | Initial handshake |
| `register` | Client → Server | Associates the socket with a user email (Room) |
| `send_message` | Client → Server | Sends message data to be saved and broadcast |
| `new_message` | Server → Client | Delivers a real-time message to the recipient's room |
| `connect_error` | Server → Client | Handles failed connection attempts |

---
*Generated on: March 7, 2026*
