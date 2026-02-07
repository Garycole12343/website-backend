// src/services/socketService.js
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = [];
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(userEmail) {
    if (this.socket?.connected) {
      return;
    }

    if (this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    
    try {
      const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        query: { email: userEmail },
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('Socket.IO connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        
        // Register user with their email after connection
        this.socket.emit('register', { email: userEmail });
      });

      this.socket.on('connect_success', (data) => {
        console.log('Socket connect success:', data);
      });

      this.socket.on('register_success', (data) => {
        console.log('Socket registered:', data);
      });

      this.socket.on('register_error', (data) => {
        console.error('Socket registration error:', data);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket.IO disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
        this.isConnecting = false;
        
        this.reconnectAttempts++;
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
          console.log(`Reconnecting attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
        }
      });

    } catch (error) {
      console.error('Socket connection error:', error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners = [];
    this.isConnecting = false;
  }

  subscribe(eventType, listener) {
    const listenerObj = { eventType, listener };
    this.listeners.push(listenerObj);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listenerObj);
    };
  }

  notifyListeners(eventType, data) {
    this.listeners.forEach(({ eventType: et, listener }) => {
      if (et === eventType) {
        listener(data);
      }
    });
  }

  sendMessage(data) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', data);
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();