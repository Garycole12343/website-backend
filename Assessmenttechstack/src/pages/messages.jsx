// src/pages/messages.jsx - COMPLETE UPDATED FOR SOCKET.IO (TRIPLE-SEND FIXED)
// Sending = REST only
// Receiving = Socket.IO (ignores own messages to prevent duplicates)

import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { socketService } from "../services/socketService";
import {
  fetchConversations,
  sendMessage,
  addIncomingMessage,
  markConversationRead,
  deleteMessage,
  deleteConversation,
} from "../store/slices/messagesSlice";

function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { userEmail, isAuthenticated } = useContext(AuthContext);
  const { markAsRead, notifications } = useNotifications();

  const { conversations, status, error } = useSelector((state) => state.messages);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [userNames, setUserNames] = useState({});
  const messagesEndRef = useRef(null);

  const currentUser = (userEmail || "").toLowerCase().trim();

  // Handle delete conversation
  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm("Delete this entire conversation? This cannot be undone.")) return;
    
    try {
      await dispatch(deleteConversation({ conversationId })).unwrap();
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      alert("Failed to delete conversation");
    }
  };

  // Mark selected conversation as read and CLEAR corresponding notifications
  useEffect(() => {
    if (selectedConversationId && currentUser) {
      const conv = conversations.find(c => c.id === selectedConversationId);
      if (conv) {
        const lastMsg = conv.messages?.[conv.messages.length - 1];
        const lastReadTime = conv.last_read_by?.[currentUser];
        
        // Only mark as read if there's a new message since last read
        if (lastMsg && (!lastReadTime || new Date(lastMsg.timestamp) > new Date(lastReadTime))) {
           dispatch(markConversationRead({ conversationId: selectedConversationId, email: currentUser }));
           
           // Also clear any unread notifications for this conversation
           notifications.forEach(n => {
             if (n.conversationId === selectedConversationId && !n.read) {
               markAsRead(n.id);
             }
           });
        }
      }
    }
  }, [selectedConversationId, conversations, currentUser, dispatch, notifications, markAsRead]);

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (!selectedConversationId || !window.confirm("Delete this message?")) return;
    
    try {
      await dispatch(deleteMessage({ 
        conversationId: selectedConversationId, 
        messageId 
      })).unwrap();
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message");
    }
  };

  // Fetch username for an email and cache it (keyed by normalized email)
  const getUserName = async (email) => {
    const normalized = (email || "").toLowerCase().trim();
    if (!normalized || normalized === currentUser) return "You";
    if (userNames[normalized]) return userNames[normalized];

    try {
      const res = await fetch(
        `/api/users/by-email?email=${encodeURIComponent(normalized)}`
      );
      if (res.ok) {
        const data = await res.json();
        const name = data.user?.name || normalized.split("@")[0];
        setUserNames((prev) => ({ ...prev, [normalized]: name }));
        return name;
      }
    } catch (err) {
      console.error("Error fetching username:", err);
    }

    const fallback = normalized.split("@")[0];
    setUserNames((prev) => ({ ...prev, [normalized]: fallback }));
    return fallback;
  };

  // Load conversations
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      dispatch(fetchConversations(currentUser));
    }
  }, [dispatch, isAuthenticated, currentUser]);

  // Fetch usernames for all participants
  useEffect(() => {
    if (!conversations?.length || !currentUser) return;

    const uniqueEmails = new Set();
    conversations.forEach((c) => {
      (c.participants || []).forEach((p) => {
        const email = (p || "").toLowerCase().trim();
        if (email && email !== currentUser) uniqueEmails.add(email);
      });
    });

    uniqueEmails.forEach((email) => {
      if (!userNames[email]) getUserName(email);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, currentUser]);

  // ✅ Auto-open conversation (supports BOTH: ?conversation=ID and location.state)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const convId = params.get("conversation") || location.state?.conversationId;

    if (convId) {
      setSelectedConversationId(convId);

      const saved = JSON.parse(
        localStorage.getItem("skillswap_notifications") || "{}"
      );

      const ids = (saved.notifications || [])
        .filter((n) => n.conversationId === convId && !n.read)
        .map((n) => n.id);

      ids.forEach((id) => markAsRead(id));
    }
  }, [location.search, location.state, markAsRead]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const otherParticipantEmail = useMemo(() => {
    return (selectedConversation?.participants || []).find(
      (p) => (p || "").toLowerCase().trim() !== currentUser
    );
  }, [selectedConversation, currentUser]);

  const otherParticipantNormalized = useMemo(() => {
    return (otherParticipantEmail || "").toLowerCase().trim();
  }, [otherParticipantEmail]);

  const otherDisplayName = useMemo(() => {
    return (
      userNames[otherParticipantNormalized] ||
      otherParticipantNormalized?.split("@")[0] ||
      "User"
    );
  }, [userNames, otherParticipantNormalized]);

  // ✅ Socket.IO receive only (ignore own messages to avoid duplicates)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      console.log("💬 messages.jsx: Not authenticated, skipping socket subscribe");
      return;
    }

    const unsubscribe = socketService.subscribe("NEW_MESSAGE", (data) => {
      console.log("💬 messages.jsx: Received NEW_MESSAGE (Socket.IO):", data);

      const from = (data?.message?.from || data?.from || "").toLowerCase().trim();

      // ✅ If backend broadcasts to the sender too, ignore here (REST already added it)
      if (from && from === currentUser) {
        console.log("💬 messages.jsx: Ignoring own socket message to avoid duplicates");
        return;
      }

      if (data?.conversationId && data?.message) {
        dispatch(
          addIncomingMessage({
            conversationId: data.conversationId,
            message: {
              text: data.message.text,
              from: data.message.from,
              timestamp: data.message.timestamp || new Date().toISOString(),
            },
          })
        );
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, currentUser, dispatch]);

  // ✅ Send message (REST ONLY)
  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim() || !selectedConversation) return;

    const to = otherParticipantNormalized;
    const text = newMessage.trim();

    console.log("💬 Sending message via REST only:", { to, text, from: currentUser });

    try {
      await dispatch(
        sendMessage({
          conversationId: selectedConversationId,
          from: currentUser,
          to,
          text,
        })
      ).unwrap();

      setNewMessage("");

      // ✅ Do NOT also send via Socket.IO
      // Backend should emit `new_message` after saving REST message.
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversationId, selectedConversation?.messages?.length]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4">
        <h1 className="text-3xl mb-4">Messages</h1>
        <p className="text-muted-foreground">Please log in to view your messages.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <div className="text-sm text-muted-foreground">{error ? error : ""}</div>
      </div>

      {status === "loading" && (
        <div className="mb-6 p-4 rounded-lg bg-card border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <span className="text-muted-foreground">Loading conversations…</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Conversations Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-card rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Conversations</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {conversations.length} conversation
                {conversations.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-300 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation from any board!</p>
                </div>
              ) : (
                <ul>
                  {conversations.map((conv) => {
                    const otherEmail = (conv?.participants || []).find(
                      (p) => (p || "").toLowerCase().trim() !== currentUser
                    );
                    const otherKey = (otherEmail || "").toLowerCase().trim();

                    const displayName =
                      userNames[otherKey] || otherKey?.split("@")[0] || "User";

                    const lastMessage = conv.messages?.[conv.messages.length - 1];
                    const isSelected = selectedConversationId === conv.id;

                    // Calculate unread status
                    const lastReadTime = conv.last_read_by?.[currentUser];
                    const isUnread = lastMessage && 
                                    (String(lastMessage.from).toLowerCase().trim() !== currentUser) && 
                                    (!lastReadTime || new Date(lastMessage.timestamp) > new Date(lastReadTime));

                    return (
                      <li
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={`cursor-pointer p-4 border-b border-border hover:bg-background transition-colors relative ${
                          isSelected ? "bg-green-50 border-l-4 border-l-green-500" : ""
                        } ${isUnread ? "bg-background/30" : ""}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className={`font-medium ${isUnread ? "text-blue-900 font-bold" : "text-foreground"}`}>
                              {displayName}
                            </div>
                            {lastMessage && (
                              <div className={`text-sm mt-1 truncate ${isUnread ? "text-blue-800 font-semibold" : "text-muted-foreground"}`}>
                                {String(lastMessage.from || "").toLowerCase().trim() ===
                                currentUser
                                  ? "You: "
                                  : ""}
                                {lastMessage.text}
                              </div>
                            )}
                          </div>
                          {isUnread && (
                            <div className="ml-2 mt-1.5">
                              <div className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></div>
                            </div>
                          )}
                        </div>
                        {lastMessage && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(lastMessage.timestamp).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:w-2/3">
          {selectedConversation ? (
            <div className="bg-card rounded-lg shadow h-full flex flex-col">
              {/* Conversation Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      Conversation with <Link to={`/profile/${encodeURIComponent(otherParticipantNormalized)}`} className="text-blue-600 hover:underline">{otherDisplayName}</Link>
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleDeleteConversation(selectedConversation.id)}
                      className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm font-medium"
                      title="Delete entire conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Delete Conversation</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          socketService.isConnected() ? "bg-green-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="text-xs text-muted-foreground">
                        {socketService.isConnected() ? "Connected" : "Disconnected"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[500px] bg-background">
                {(selectedConversation.messages || []).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Send a message to start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedConversation.messages || []).map((msg) => {
                      const sender = (msg.from || "").toLowerCase().trim();
                      const isMe = sender === currentUser;

                      const senderName = isMe
                        ? "You"
                        : userNames[sender] || sender.split("@")[0] || "User";

                      const timestamp = new Date(msg.timestamp);
                      const key =
                        msg.id || msg.timestamp || `${msg.from}-${msg.to}-${msg.text}`;

                      return (
                        <div
                          key={key}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[70%] ${isMe ? "order-2" : "order-1"}`}>
                            <div
                              className={`rounded-lg p-3 relative group ${
                                isMe ? "bg-green-100" : "bg-card border border-border"
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4 mb-1">
                                <div className="font-medium text-sm text-muted-foreground">
                                  {senderName}
                                </div>
                                {isMe && (
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity p-0.5"
                                    title="Delete message"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <p className="text-muted-foreground break-words">{msg.text}</p>
                              <div className="text-xs text-muted-foreground mt-2 text-right">
                                {timestamp.toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message here..."
                    className="flex-1 rounded-lg border border-border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      newMessage.trim()
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-gray-300 text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    Send
                  </button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Press Enter to send</div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow p-12 text-center h-full flex flex-col justify-center">
              <svg
                className="w-24 h-24 mx-auto text-gray-300 mb-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Select a Conversation
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose a conversation to view messages. You can start a conversation
                from any board by clicking "Contact" on a skill that has been added.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
