// src/services/socketService.js - FIXED SOCKET.IO VERSION
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.userEmail = null;
    this.connected = false;
    this.backendUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
    console.log("🔌 SocketService (Socket.IO) initialized");
  }

  connect(userEmail) {
    console.log("🔌 SocketService.connect called with email:", userEmail);

    if (!userEmail) {
      console.error("❌ Cannot connect socket: no userEmail provided");
      return this;
    }

    const normalizedEmail = String(userEmail).toLowerCase().trim();

    // ✅ If already connected for the same user, do nothing
    if (
      this.socket &&
      (this.userEmail || "").toLowerCase().trim() === normalizedEmail &&
      this.socket.connected
    ) {
      console.log("✅ Socket already connected for same user. Skipping reconnect.");
      this.connected = true;
      return this;
    }

    // ✅ If socket exists but email changed, do a proper reconnect
    if (this.socket && (this.userEmail || "").toLowerCase().trim() !== normalizedEmail) {
      console.log("🔄 User changed. Reconnecting socket for new user.");
      this.disconnect({ clearListeners: false }); // keep listeners
    }

    // If socket exists but isn't connected, try re-connecting without nuking listeners
    if (this.socket && !this.socket.connected) {
      console.log("🔄 Socket exists but not connected. Attempting reconnect...");
      this.userEmail = normalizedEmail;
      this.socket.connect();
      return this;
    }

    this.userEmail = normalizedEmail;

    try {
      console.log("🔌 Connecting to Flask-SocketIO:", this.backendUrl);

      this.socket = io(this.backendUrl, {
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupSocketIO();
    } catch (error) {
      console.error("❌ Failed to create Socket.IO connection:", error);
      console.log("🔌 Falling back to mock connection");
      this.setupMockConnection();
    }

    return this;
  }

  setupSocketIO() {
    if (!this.socket) return;

    // Avoid stacking handlers if setupSocketIO is ever called again
    this.socket.off("connect");
    this.socket.off("connect_success");
    this.socket.off("register_success");
    this.socket.off("register_error");
    this.socket.off("new_message");
    this.socket.off("connect_error");
    this.socket.off("disconnect");
    this.socket.off("message_error");
    this.socket.off("message");

    // Connection events
    this.socket.on("connect", () => {
      console.log("✅✅✅ Socket.IO connected successfully! ID:", this.socket.id);
      this.connected = true;

      this.triggerEvent("CONNECTED", {
        email: this.userEmail,
        socketId: this.socket.id,
      });

      // Register with server after connection
      this.register();
    });

    this.socket.on("reconnect", (attempt) => {
      console.log("🔄 Socket.IO reconnected after", attempt, "attempts");
      this.register();
    });

    this.socket.on("connect_success", (data) => {
      console.log("✅ Socket.IO connect_success:", data);
    });

    this.socket.on("register_success", (data) => {
      console.log("✅ Registered with server:", data);
    });

    this.socket.on("register_error", (data) => {
      console.error("❌ Registration error:", data);
    });

    // LISTEN FOR NEW MESSAGES FROM FLASK
    this.socket.on("new_message", (data) => {
      console.log("=".repeat(80));
      console.log("📩📩📩 REAL MESSAGE FROM FLASK (Socket.IO) 📩📩📩");
      console.log("=".repeat(80));
      console.log("📩 Full message data:", data);
      console.log("📩 Structure:", JSON.stringify(data, null, 2));

      const conversationId = data?.conversationId;
      const messageData = data?.message;

      console.log("📩 Conversation ID:", conversationId);
      console.log("📩 Message data:", messageData);

      if (conversationId && messageData) {
        // Trigger event for listeners
        this.triggerEvent("NEW_MESSAGE", {
          conversationId,
          message: messageData,
          text: messageData?.text,
          from: messageData?.from,
          timestamp: messageData?.timestamp,
        });
      }

      console.log("=".repeat(80));
    });

    // Error handling
    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket.IO connect_error:", error);
      this.connected = false;
      this.triggerEvent("ERROR", {
        error: "Socket.IO connection failed",
        details: error.message,
      });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Socket.IO disconnected:", reason);
      this.connected = false;
    });

    this.socket.on("message_error", (data) => {
      console.error("❌ Socket.IO message_error:", data);
    });

    // Also listen to default 'message' event as fallback
    this.socket.on("message", (data) => {
      console.log("📩 Socket.IO generic message:", data);
    });
  }

  setupMockConnection() {
    console.log("🔌 Setting up mock connection");
    this.connected = true;

    setTimeout(() => {
      console.log("✅ Mock connection ready");
      this.triggerEvent("CONNECTED", {
        email: this.userEmail,
        isMock: true,
      });
    }, 500);
  }

  triggerEvent(event, data) {
    console.log(`🔌 triggerEvent: "${event}"`, data);

    const callbacks = this.listeners.get(event);
    if (!callbacks || callbacks.length === 0) {
      console.log(`🔌 Event "${event}" has no listeners`);
      return;
    }

    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Error in callback for "${event}":`, error);
      }
    });
  }

  subscribe(event, callback) {
    console.log(`📝 subscribe to: "${event}"`);

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event).push(callback);
    console.log(
      `📝 Total subscribers for "${event}":`,
      this.listeners.get(event).length
    );

    return () => {
      if (!this.listeners.has(event)) return;

      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        console.log(`📝 Unsubscribed from "${event}"`);
      }
    };
  }

  register() {
    if (this.socket && this.socket.connected && this.userEmail) {
      console.log("🔌 Sending 'register' event for:", this.userEmail);
      this.socket.emit("register", { email: this.userEmail });
      return true;
    }
    return false;
  }

  send(event, payload) {
    if (this.socket && this.socket.connected) {
      console.log("📤 SENDING via Socket.IO:", event, payload);
      this.socket.emit(event, payload);
      return true;
    } else {
      console.warn("⚠️ Cannot send, Socket.IO not connected");
      return false;
    }
  }

  sendMessage(messageData) {
    console.log("📤 sendMessage via Socket.IO:", messageData);
    return this.send("send_message", messageData);
  }

  // ✅ key change: don't clear listeners by default
  disconnect({ clearListeners = false } = {}) {
    console.log("🔌 Disconnecting Socket.IO");
    if (this.socket) {
      try {
        this.socket.disconnect();
      } catch (e) {
        console.warn("⚠️ socket disconnect error:", e);
      }
    }
    this.connected = false;
    this.userEmail = null;

    if (clearListeners) {
      console.log("🧹 Clearing listeners (explicit)");
      this.listeners.clear();
    }
  }

  simulateTestMessage() {
    console.log("🧪 Simulating test message");
    const testData = {
      conversationId: "test-conv-" + Date.now(),
      message: {
        text: `Test message from mock at ${new Date().toLocaleTimeString()}`,
        from: "MockUser",
        timestamp: new Date().toISOString(),
      },
    };

    this.triggerEvent("NEW_MESSAGE", testData);
    return testData;
  }

  isConnected() {
    return this.connected && !!this.socket?.connected;
  }
}

// Create singleton instance
export const socketService = new SocketService();
