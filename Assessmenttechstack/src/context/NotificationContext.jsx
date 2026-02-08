// src/context/NotificationContext.jsx - COMPLETE UPDATED VERSION
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  // Get user from AuthContext
  const { userEmail: authUserEmail, isAuthenticated } = useContext(AuthContext);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      console.log('🔔 Current notification permission:', permission);
      setHasPermission(permission === 'granted');
    } else {
      console.log('❌ Browser does not support notifications');
    }
  }, []);

  // Load notifications from localStorage on mount
  useEffect(() => {
    console.log('🔔 Loading notifications from localStorage');
    const saved = localStorage.getItem('skillswap_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('🔔 Loaded notifications:', parsed.notifications?.length || 0, 'unread:', parsed.unreadCount || 0);
        setNotifications(parsed.notifications || []);
        setUnreadCount(parsed.unreadCount || 0);
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
      }
    } else {
      console.log('🔔 No saved notifications found');
    }
  }, []);

  // Get user email from AuthContext
  useEffect(() => {
    console.log('👤 Getting user email from AuthContext:', {
      authUserEmail,
      isAuthenticated
    });

    if (authUserEmail && isAuthenticated) {
      console.log('👤 Using email from AuthContext:', authUserEmail);
      setCurrentUserEmail(authUserEmail);
    } else {
      console.log('👤 No user email or not authenticated');
      setCurrentUserEmail(null);
    }
  }, [authUserEmail, isAuthenticated]);

  // Save notifications to localStorage
  useEffect(() => {
    console.log('💾 Saving notifications to localStorage:', notifications.length, 'total,', unreadCount, 'unread');
    localStorage.setItem('skillswap_notifications', JSON.stringify({
      notifications,
      unreadCount,
      lastUpdated: new Date().toISOString()
    }));
  }, [notifications, unreadCount]);

  // Setup socket connection for notifications
  useEffect(() => {
    console.log('🔌 NOTIFICATION CONTEXT SOCKET SETUP:');
    console.log('  - currentUserEmail:', currentUserEmail);
    console.log('  - isAuthenticated:', isAuthenticated);
    
    if (currentUserEmail && isAuthenticated) {
      console.log('🔌 NotificationContext: Setting up Socket.IO for:', currentUserEmail);
      setSocketConnected(false);
      
      // Connect socket
      socketService.connect(currentUserEmail);
      
      // Subscribe to connection events
      const unsubscribeConnected = socketService.subscribe('CONNECTED', (data) => {
        console.log('✅✅✅ NOTIFICATION CONTEXT: SOCKET CONNECTED!', data);
        setSocketConnected(true);
      });
      
      // ✅✅✅ CRITICAL: Subscribe to NEW_MESSAGE events (Socket.IO format)
      const unsubscribeMessage = socketService.subscribe('NEW_MESSAGE', (data) => {
        console.log('🎯 NOTIFICATION CONTEXT: Received NEW_MESSAGE event (Socket.IO)');
        console.log('🎯 Full message data:', JSON.stringify(data, null, 2));
        
        // Socket.IO format from Flask: { conversationId: "...", message: { text: "...", from: "...", timestamp: "..." } }
        let messageText, fromUser, conversationId;
        
        if (data.conversationId && data.message) {
          // Format 1: Direct Socket.IO format
          messageText = data.message.text || data.message.content;
          fromUser = data.message.from || data.message.sender;
          conversationId = data.conversationId;
          console.log('🎯 Using Socket.IO format');
        }
        // Alternative format: Direct properties
        else if (data.text && data.from && data.conversationId) {
          messageText = data.text;
          fromUser = data.from;
          conversationId = data.conversationId;
          console.log('🎯 Using direct properties format');
        }
        // Alternative format: Nested in message property
        else if (data.message && typeof data.message === 'string') {
          messageText = data.message;
          fromUser = data.from || 'User';
          conversationId = data.conversationId || 'unknown';
          console.log('🎯 Using string message format');
        }
        
        console.log('🎯 Extracted:', { messageText, fromUser, conversationId });
        
        if (messageText && fromUser && conversationId) {
          // Don't notify if message is from current user
          if (fromUser.toLowerCase() === currentUserEmail.toLowerCase()) {
            console.log('🎯 Skipping notification - message from self');
            return;
          }
          
          console.log('🎯 Creating notification for incoming message');
          addNotification({
            type: 'NEW_MESSAGE',
            title: 'New Message',
            message: messageText.length > 50 ? messageText.substring(0, 50) + '...' : messageText,
            from: fromUser,
            conversationId: conversationId,
            read: false
          });
        } else {
          console.log('🎯 Could not extract message data, creating generic notification');
          addNotification({
            type: 'NEW_MESSAGE_GENERIC',
            title: 'New Message',
            message: 'You received a message',
            from: 'User',
            conversationId: 'unknown-' + Date.now(),
            read: false
          });
        }
      });
      
      // Subscribe to errors
      const unsubscribeError = socketService.subscribe('ERROR', (error) => {
        console.error('❌❌❌ NOTIFICATION CONTEXT SOCKET ERROR:', error);
        setSocketConnected(false);
      });

      return () => {
        console.log('🔌 NotificationContext: Cleaning up socket subscriptions');
        unsubscribeConnected();
        unsubscribeMessage();
        unsubscribeError();
        setSocketConnected(false);
      };
    } else {
      console.log('⚠️ NotificationContext: No userEmail or not authenticated, skipping socket');
      setSocketConnected(false);
    }
  }, [currentUserEmail, isAuthenticated]);

  const addNotification = useCallback((notification) => {
    console.log('➕ Adding new notification:', notification);
    
    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      createdAt: new Date().toISOString(),
      read: notification.read || false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only latest 50 notifications
      return updated.slice(0, 50);
    });

    if (!notification.read) {
      console.log('🔔 Increasing unread count');
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          console.log('📱 Showing browser notification');
          const browserNotification = new Notification('New Message', {
            body: notification.message,
            tag: notification.conversationId || 'general'
          });
          
          // Auto-close after 5 seconds
          setTimeout(() => {
            browserNotification.close();
          }, 5000);
        } catch (error) {
          console.log('📱 Browser notification failed:', error);
        }
      }
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    console.log('📖 Marking notification as read:', notificationId);
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    console.log('📚 Marking all notifications as read');
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    console.log('🗑️ Clearing all notifications');
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(() => {
    console.log('🔔 Requesting notification permission');
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission result:', permission);
        setHasPermission(permission === 'granted');
      });
    }
  }, []);

  // Add a test function for manual testing
  const testAddNotification = useCallback(() => {
    console.log('🧪 Manual test notification triggered');
    addNotification({
      type: 'MANUAL_TEST',
      title: 'Manual Test',
      message: 'This is a manually triggered test notification at ' + new Date().toLocaleTimeString(),
      from: 'Tester',
      conversationId: 'manual-test-' + Date.now(),
      read: false
    });
  }, [addNotification]);

  // Simulate socket message for testing
  const simulateSocketMessage = useCallback(() => {
    console.log('🔌 Simulating socket message');
    if (socketService.simulateTestMessage) {
      const testData = socketService.simulateTestMessage();
      console.log('🔌 Simulated message data:', testData);
    } else {
      console.log('🔌 Socket service does not have simulateTestMessage method');
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    requestNotificationPermission,
    hasPermission,
    testAddNotification,
    simulateSocketMessage,
    socketConnected,
    currentUserEmail
  };

  console.log('🔔 NotificationProvider rendering:', {
    notificationCount: notifications.length,
    unreadCount,
    socketConnected,
    currentUserEmail: currentUserEmail || 'undefined',
    hasPermission
  });

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};