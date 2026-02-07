// src/pages/messages.jsx - FULL CODE WITH USERNAME FIX & NOTIFICATIONS
import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { socketService } from "../services/socketService";
import {
  fetchConversations,
  sendMessage,
  addIncomingMessage,
} from "../store/slices/messagesSlice";

function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { userEmail, isAuthenticated } = useContext(AuthContext);
  const { markAsRead } = useNotifications();

  const { conversations, status, error } = useSelector((state) => state.messages);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [userNames, setUserNames] = useState({});  // Cache usernames
  const messagesEndRef = useRef(null);
  const notificationSoundRef = useRef(null);

  const currentUser = (userEmail || "").toLowerCase().trim();

  // Create notification sound
  useEffect(() => {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3');
    audio.volume = 0.2;
    notificationSoundRef.current = audio;
    
    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause();
        notificationSoundRef.current = null;
      }
    };
  }, []);

  // Fetch username for email
  const getUserName = async (email) => {
    if (!email || email === currentUser) return currentUser;
    if (userNames[email]) return userNames[email];
    
    try {
      const res = await fetch(`/api/users/by-email?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        const name = data.user?.name || email.split('@')[0];
        setUserNames(prev => ({...prev, [email]: name}));
        return name;
      }
    } catch (err) {
      console.error("Error fetching username:", err);
    }
    return email.split('@')[0];  // Fallback
  };

  // Load conversations from Mongo on page open
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      dispatch(fetchConversations(currentUser));
    }
  }, [dispatch, isAuthenticated, currentUser]);

  // Pre-fetch names for all conversations
  useEffect(() => {
    conversations.forEach(async (conv) => {
      const otherEmail = (conv?.participants || []).find((p) => p !== currentUser);
      if (otherEmail && !userNames[otherEmail]) {
        await getUserName(otherEmail);
      }
    });
  }, [conversations, currentUser]);

  // Auto-open a conversation when navigated from a board
  useEffect(() => {
    const convId = location.state?.conversationId;
    if (convId) {
      setSelectedConversationId(convId);
      
      // Mark any notifications for this conversation as read
      const notifications = JSON.parse(localStorage.getItem('skillswap_notifications') || '{}');
      const conversationNotifications = (notifications.notifications || [])
        .filter(n => n.conversationId === convId && !n.read)
        .map(n => n.id);
      
      conversationNotifications.forEach(id => markAsRead(id));
    }
  }, [location.state, markAsRead]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const otherParticipantEmail = useMemo(() => {
    return (selectedConversation?.participants || []).find((p) => p !== currentUser);
  }, [selectedConversation, currentUser]);

  const otherParticipantName = userNames[otherParticipantEmail] || 
                              otherParticipantEmail?.split('@')[0] || 'Unknown';

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    socketService.connect(currentUser);

    // Subscribe to new messages
    const unsubscribe = socketService.subscribe('NEW_MESSAGE', (data) => {
      if (data.conversationId && data.message) {
        dispatch(addIncomingMessage(data));
        
        // Play sound if not in current conversation
        if (data.conversationId !== selectedConversationId && notificationSoundRef.current) {
          try {
            notificationSoundRef.current.play();
          } catch (err) {
            console.log('Sound play failed:', err);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, currentUser, dispatch, selectedConversationId]);

  // Send message
  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim() || !selectedConversation) return;

    const to = otherParticipantEmail;
    const text = newMessage.trim();

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
      
      // Also send via socket for real-time
      if (socketService.isConnected()) {
        socketService.sendMessage({
          conversationId: selectedConversationId,
          from: currentUser,
          to,
          text,
        });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  // Scroll to bottom on new messages / conversation switch
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversationId, selectedConversation?.messages?.length]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId) {
      // Find notifications for this conversation and mark as read
      const notifications = JSON.parse(localStorage.getItem('skillswap_notifications') || '{}');
      const conversationNotifications = (notifications.notifications || [])
        .filter(n => n.conversationId === selectedConversationId && !n.read)
        .map(n => n.id);
      
      conversationNotifications.forEach(id => markAsRead(id));
    }
  }, [selectedConversationId, markAsRead]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <h1 className="text-3xl mb-4">Messages</h1>
        <p className="text-gray-600">Please log in to view your messages.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        <div className="text-sm text-gray-500">
          Real-time messaging with notifications
        </div>
      </div>

      {status === "loading" && (
        <div className="mb-6 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
            <span className="text-gray-600">Loading conversations…</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => dispatch(fetchConversations(currentUser))}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Conversations Sidebar */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Conversations</h2>
              <p className="text-sm text-gray-500 mt-1">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start a conversation from any board!</p>
                </div>
              ) : (
                <ul>
                  {conversations.map((conv) => {
                    const otherEmail = (conv?.participants || []).find((p) => p !== currentUser);
                    const displayName = userNames[otherEmail] || otherEmail?.split('@')[0] || 'Loading...';
                    const lastMessage = conv.messages?.[conv.messages.length - 1];
                    const isSelected = selectedConversationId === conv.id;
                    const hasUnread = false; // You can add unread logic here
                    
                    return (
                      <li
                        key={conv.id}
                        onClick={() => setSelectedConversationId(conv.id)}
                        className={`cursor-pointer p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          isSelected ? "bg-green-50 border-l-4 border-l-green-500" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{displayName}</div>
                            {lastMessage && (
                              <div className="text-sm text-gray-600 truncate mt-1">
                                <span className={hasUnread ? "font-medium" : ""}>
                                  {lastMessage.from === currentUser ? "You: " : ""}
                                  {lastMessage.text}
                                </span>
                              </div>
                            )}
                          </div>
                          {hasUnread && (
                            <div className="w-2 h-2 bg-green-600 rounded-full ml-2 mt-2"></div>
                          )}
                        </div>
                        {lastMessage && (
                          <div className="text-xs text-gray-400 mt-2">
                            {new Date(lastMessage.timestamp).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
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
            <div className="bg-white rounded-lg shadow h-full flex flex-col">
              {/* Conversation Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Conversation with {otherParticipantName}
                    </h2>
                    <p className="text-sm text-gray-500">{otherParticipantEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${socketService.isConnected() ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {socketService.isConnected() ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[500px] bg-gray-50">
                {(selectedConversation.messages || []).length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p>No messages yet</p>
                    <p className="text-sm mt-2">Send a message to start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedConversation.messages || []).map((msg) => {
                      const sender = (msg.from || "").toLowerCase();
                      const isMe = sender === currentUser;
                      const senderName = isMe ? "You" : userNames[sender] || sender.split('@')[0];
                      const timestamp = new Date(msg.timestamp);

                      const key = msg.id || msg.timestamp || `${msg.from}-${msg.to}-${msg.text}`;

                      return (
                        <div key={key} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isMe ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-lg p-3 ${isMe ? 'bg-green-100' : 'bg-white border border-gray-200'}`}>
                              <div className="font-medium text-sm text-gray-700 mb-1">
                                {senderName}
                              </div>
                              <p className="text-gray-800">{msg.text}</p>
                              <div className="text-xs text-gray-500 mt-2 text-right">
                                {timestamp.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: true
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
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type your message here..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                      newMessage.trim() 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Send
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Press Enter to send • Real-time updates active
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center h-full flex flex-col justify-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Select a Conversation</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Choose a conversation from the sidebar to view and send messages.
                You can start conversations from any board by clicking "Contact" on a post.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;