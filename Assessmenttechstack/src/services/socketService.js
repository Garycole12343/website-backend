// src/services/socketService.js - COMPLETE SOCKET.IO VERSION
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.userEmail = null;
    this.connected = false;
    console.log('🔌 SocketService (Socket.IO) initialized');
  }

  connect(userEmail) {
    console.log('🔌 SocketService.connect called with email:', userEmail);
    
    if (!userEmail) {
      console.error('❌ Cannot connect socket: no userEmail provided');
      return this;
    }
    
    // Disconnect existing connection
    if (this.socket) {
      this.disconnect();
    }
    
    this.userEmail = userEmail;
    
    try {
      // Connect using Socket.IO to your Flask backend
      const backendUrl = 'http://localhost:5000'; // Flask runs on port 5000
      console.log('🔌 Connecting to Flask-SocketIO:', backendUrl);
      
      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
      
      this.setupSocketIO();
    } catch (error) {
      console.error('❌ Failed to create Socket.IO connection:', error);
      console.log('🔌 Falling back to mock connection');
      this.setupMockConnection();
    }
    
    return this;
  }

  setupSocketIO() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅✅✅ Socket.IO connected successfully!');
      this.connected = true;
      this.triggerEvent('CONNECTED', { 
        email: this.userEmail,
        socketId: this.socket.id
      });
      
      // Register with the server after connection
      if (this.userEmail) {
        console.log('🔌 Registering with server as:', this.userEmail);
        this.socket.emit('register', { email: this.userEmail });
      }
    });

    this.socket.on('connect_success', (data) => {
      console.log('✅ Socket.IO connect_success:', data);
    });

    this.socket.on('register_success', (data) => {
      console.log('✅ Registered with server:', data);
    });

    this.socket.on('register_error', (data) => {
      console.error('❌ Registration error:', data);
    });

    // LISTEN FOR NEW MESSAGES FROM FLASK
    this.socket.on('new_message', (data) => {
      console.log('='.repeat(80));
      console.log('📩📩📩 REAL MESSAGE FROM FLASK (Socket.IO) 📩📩📩');
      console.log('='.repeat(80));
      console.log('📩 Full message data:', data);
      console.log('📩 Structure:', JSON.stringify(data, null, 2));
      
      // Extract info
      const conversationId = data.conversationId;
      const messageData = data.message;
      
      console.log('📩 Conversation ID:', conversationId);
      console.log('📩 Message data:', messageData);
      
      if (conversationId && messageData) {
        // Trigger event for listeners
        this.triggerEvent('NEW_MESSAGE', {
          conversationId: conversationId,
          message: messageData,
          text: messageData?.text,
          from: messageData?.from,
          timestamp: messageData?.timestamp
        });
      }
      
      console.log('='.repeat(80));
    });

    // Error handling
    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket.IO connect_error:', error);
      this.connected = false;
      this.triggerEvent('ERROR', { 
        error: 'Socket.IO connection failed',
        details: error.message
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.IO disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('message_error', (data) => {
      console.error('❌ Socket.IO message_error:', data);
    });

    // Also listen to default 'message' event as fallback
    this.socket.on('message', (data) => {
      console.log('📩 Socket.IO generic message:', data);
    });
  }

  setupMockConnection() {
    console.log('🔌 Setting up mock connection');
    this.connected = true;
    
    setTimeout(() => {
      console.log('✅ Mock connection ready');
      this.triggerEvent('CONNECTED', { 
        email: this.userEmail,
        isMock: true
      });
    }, 500);
  }

  triggerEvent(event, data) {
    console.log(`🔌 triggerEvent: "${event}"`, data);
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Error in callback:`, error);
        }
      });
    } else {
      console.log(`🔌 Event "${event}" has no listeners`);
    }
  }

  subscribe(event, callback) {
    console.log(`📝 subscribe to: "${event}"`);
    
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    
    console.log(`📝 Total subscribers for "${event}":`, this.listeners.get(event).length);
    
    // Return unsubscribe function
    return () => {
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
          console.log(`📝 Unsubscribed from "${event}"`);
        }
      }
    };
  }

  send(event, payload) {
    if (this.socket && this.socket.connected) {
      console.log('📤 SENDING via Socket.IO:', event, payload);
      this.socket.emit(event, payload);
      return true;
    } else {
      console.warn('⚠️ Cannot send, Socket.IO not connected');
      return false;
    }
  }

  sendMessage(messageData) {
    console.log('📤 sendMessage via Socket.IO:', messageData);
    return this.send('send_message', messageData);
  }

  disconnect() {
    console.log('🔌 Disconnecting Socket.IO');
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connected = false;
    this.userEmail = null;
    this.listeners.clear();
  }

  simulateTestMessage() {
    console.log('🧪 Simulating test message');
    const testData = {
      conversationId: 'test-conv-' + Date.now(),
      message: {
        text: `Test message from mock at ${new Date().toLocaleTimeString()}`,
        from: 'MockUser',
        timestamp: new Date().toISOString()
      }
    };
    
    this.triggerEvent('NEW_MESSAGE', testData);
    return testData;
  }
  
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Create singleton instance
export const socketService = new SocketService();