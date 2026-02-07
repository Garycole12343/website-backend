// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { socketService } from '../services/socketService';
import { useSelector } from 'react-redux';

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
  const [notificationSound, setNotificationSound] = useState(null);
  const userEmail = useSelector(state => state.auth?.userEmail);

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('skillswap_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotifications(parsed.notifications || []);
        setUnreadCount(parsed.unreadCount || 0);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }

    // Create notification sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
    audio.volume = 0.3;
    setNotificationSound(audio);
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('skillswap_notifications', JSON.stringify({
      notifications,
      unreadCount,
      lastUpdated: new Date().toISOString()
    }));
  }, [notifications, unreadCount]);

  // Setup socket connection when user is logged in
  useEffect(() => {
    if (userEmail) {
      socketService.connect(userEmail);
      
      // Subscribe to new messages
      const unsubscribe = socketService.subscribe('NEW_MESSAGE', (data) => {
        addNotification({
          type: 'NEW_MESSAGE',
          title: 'New Message',
          message: data.message.text,
          from: data.message.from,
          conversationId: data.conversationId,
          read: false
        });
      });

      return () => {
        unsubscribe();
        socketService.disconnect();
      };
    }
  }, [userEmail]);

  const addNotification = useCallback((notification) => {
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
      setUnreadCount(prev => prev + 1);
      
      // Play sound if notification sound is loaded
      if (notificationSound) {
        notificationSound.play().catch(error => {
          console.log('Audio play failed:', error);
        });
      }

      // Show browser notification if permission is granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('SkillSwap - New Message', {
          body: notification.message,
          icon: '/favicon.ico'
        });
      }
    }
  }, [notificationSound]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
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
    hasPermission: 'Notification' in window ? Notification.permission === 'granted' : false
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};