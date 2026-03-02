// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { socketService } from "../services/socketService";
import { AuthContext } from "./AuthContext";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasPermission, setHasPermission] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);

  const { userEmail: authUserEmail, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if ("Notification" in window) {
      const permission = Notification.permission;
      console.log("🔔 Current notification permission:", permission);
      setHasPermission(permission === "granted");
    } else {
      console.log("❌ Browser does not support notifications");
    }
  }, []);

  useEffect(() => {
    console.log("🔔 Loading notifications from localStorage");
    const saved = localStorage.getItem("skillswap_notifications");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log(
          "🔔 Loaded notifications:",
          parsed.notifications?.length || 0,
          "unread:",
          parsed.unreadCount || 0
        );
        setNotifications(parsed.notifications || []);
        setUnreadCount(parsed.unreadCount || 0);
      } catch (error) {
        console.error("❌ Error loading notifications:", error);
      }
    } else {
      console.log("🔔 No saved notifications found");
    }
  }, []);

  useEffect(() => {
    console.log("👤 Getting user email from AuthContext:", { authUserEmail, isAuthenticated });

    if (authUserEmail && isAuthenticated) {
      console.log("👤 Using email from AuthContext:", authUserEmail);
      setCurrentUserEmail(authUserEmail);
    } else {
      console.log("👤 No user email or not authenticated");
      setCurrentUserEmail(null);
    }
  }, [authUserEmail, isAuthenticated]);

  useEffect(() => {
    console.log(
      "💾 Saving notifications to localStorage:",
      notifications.length,
      "total,",
      unreadCount,
      "unread"
    );
    localStorage.setItem(
      "skillswap_notifications",
      JSON.stringify({
        notifications,
        unreadCount,
        lastUpdated: new Date().toISOString(),
      })
    );
  }, [notifications, unreadCount]);

  const addNotification = useCallback((notification) => {
    console.log("➕ Adding new notification:", notification);

    const newNotification = {
      id: Date.now().toString(),
      ...notification,
      createdAt: new Date().toISOString(),
      read: notification.read || false,
    };

    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      return updated.slice(0, 50);
    });

    if (!notification.read) {
      console.log("🔔 Increasing unread count");
      setUnreadCount((prev) => prev + 1);

      if ("Notification" in window && Notification.permission === "granted") {
        try {
          console.log("📱 Showing browser notification");
          const browserNotification = new Notification("New Message", {
            body: notification.message,
            tag: notification.conversationId || "general",
          });

          setTimeout(() => browserNotification.close(), 5000);
        } catch (error) {
          console.log("📱 Browser notification failed:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const checkUnreadOnLogin = async () => {
      if (currentUserEmail && isAuthenticated) {
        try {
          console.log("🔍 Checking for missed messages for:", currentUserEmail);
          const res = await fetch(`/api/messages/unread-count?email=${encodeURIComponent(currentUserEmail)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.unread_count > 0) {
              console.log(`👋 Welcome back! ${data.unread_count} unread conversations found.`);
              addNotification({
                type: "WELCOME_BACK",
                title: "Welcome Back!",
                message: `You have ${data.unread_count} unread ${data.unread_count === 1 ? 'conversation' : 'conversations'} waiting for you.`,
                from: "System",
                conversationId: "inbox",
                read: false,
              });
            }
          }
        } catch (error) {
          console.error("❌ Error checking unread messages:", error);
        }
      }
    };

    checkUnreadOnLogin();
  }, [currentUserEmail, isAuthenticated, addNotification]);

  useEffect(() => {
    console.log("🔌 NOTIFICATION CONTEXT SOCKET SETUP:");
    console.log("  - currentUserEmail:", currentUserEmail);
    console.log("  - isAuthenticated:", isAuthenticated);

    if (currentUserEmail && isAuthenticated) {
      console.log("🔌 NotificationContext: Setting up Socket.IO for:", currentUserEmail);
      setSocketConnected(false);

      socketService.connect(currentUserEmail);

      const unsubscribeConnected = socketService.subscribe("CONNECTED", (data) => {
        console.log("✅✅✅ NOTIFICATION CONTEXT: SOCKET CONNECTED!", data);
        setSocketConnected(true);
      });

      const unsubscribeMessage = socketService.subscribe("NEW_MESSAGE", (data) => {
        console.log("🎯 NOTIFICATION CONTEXT: Received NEW_MESSAGE event (Socket.IO)");
        console.log("🎯 Full message data:", JSON.stringify(data, null, 2));

        // ✅ robust extraction
        const conversationId = data?.conversationId || data?.message?.conversationId || data?.conversation_id;
        const messageText =
          data?.message?.text ||
          data?.message?.content ||
          data?.text ||
          (typeof data?.message === "string" ? data.message : null);

        const fromUser =
          data?.message?.from ||
          data?.message?.sender ||
          data?.from ||
          data?.sender ||
          null;

        console.log("🎯 Extracted:", { messageText, fromUser, conversationId });

        // ✅ crash-proof self check
        const fromNorm = (fromUser || "").toLowerCase().trim();
        const meNorm = (currentUserEmail || "").toLowerCase().trim();

        if (fromNorm && meNorm && fromNorm === meNorm) {
          console.log("🎯 Skipping notification - message from self");
          return;
        }

        if (messageText && conversationId) {
          addNotification({
            type: "NEW_MESSAGE",
            title: "New Message",
            message: messageText.length > 50 ? messageText.substring(0, 50) + "..." : messageText,
            from: fromUser || "User",
            conversationId,
            read: false,
          });
        } else {
          addNotification({
            type: "NEW_MESSAGE_GENERIC",
            title: "New Message",
            message: "You received a message",
            from: fromUser || "User",
            conversationId: conversationId || "unknown-" + Date.now(),
            read: false,
          });
        }
      });

      const unsubscribeError = socketService.subscribe("ERROR", (error) => {
        console.error("❌❌❌ NOTIFICATION CONTEXT SOCKET ERROR:", error);
        setSocketConnected(false);
      });

      return () => {
        console.log("🔌 NotificationContext: Cleaning up socket subscriptions");
        unsubscribeConnected();
        unsubscribeMessage();
        unsubscribeError();
        setSocketConnected(false);
      };
    } else {
      console.log("⚠️ NotificationContext: No userEmail or not authenticated, skipping socket");
      setSocketConnected(false);
    }
  }, [currentUserEmail, isAuthenticated, addNotification]);

  const markAsRead = useCallback((notificationId) => {
    console.log("📖 Marking notification as read:", notificationId);

    setNotifications((prev) => {
      const target = prev.find((n) => n.id === notificationId);
      if (!target || target.read) return prev;

      setUnreadCount((count) => Math.max(0, count - 1));
      return prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif));
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    console.log("📚 Marking all notifications as read");
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    console.log("🗑️ Clearing all notifications");
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  const requestNotificationPermission = useCallback(() => {
    console.log("🔔 Requesting notification permission");
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("🔔 Notification permission result:", permission);
        setHasPermission(permission === "granted");
      });
    }
  }, []);

  const testAddNotification = useCallback(() => {
    console.log("🧪 Manual test notification triggered");
    addNotification({
      type: "MANUAL_TEST",
      title: "Manual Test",
      message: "This is a manually triggered test notification at " + new Date().toLocaleTimeString(),
      from: "Tester",
      conversationId: "manual-test-" + Date.now(),
      read: false,
    });
  }, [addNotification]);

  const simulateSocketMessage = useCallback(() => {
    console.log("🔌 Simulating socket message");
    if (socketService.simulateTestMessage) {
      const testData = socketService.simulateTestMessage();
      console.log("🔌 Simulated message data:", testData);
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
    currentUserEmail,
  };

  console.log("🔔 NotificationProvider rendering:", {
    notificationCount: notifications.length,
    unreadCount,
    socketConnected,
    currentUserEmail: currentUserEmail || "undefined",
    hasPermission,
  });

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
