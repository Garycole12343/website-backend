// src/pages/messages.jsx - COMPLETE UPDATED FOR SOCKET.IO
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
  const [userNames, setUserNames] = useState({});
  const messagesEndRef = useRef(null);

  const currentUser = (userEmail || "").toLowerCase().trim();

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
    return email.split('@')[0];
  };

  // Load conversations
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      dispatch(fetchConversations(currentUser));
    }
  }, [dispatch, isAuthenticated, currentUser]);

  // Auto-open conversation
  useEffect(() => {
    const convId = location.state?.conversationId;
    if (convId) {
      setSelectedConversationId(convId);
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

  // ✅✅✅ UPDATED: Initialize Socket.IO connection
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      console.log('💬 messages.jsx: Not authenticated, skipping socket');
      return;
    }

    console.log('💬 messages.jsx: Setting up Socket.IO for', currentUser);
    socketService.connect(currentUser);

    // ✅✅✅ Subscribe to NEW_MESSAGE events (Socket.IO format)
    const unsubscribe = socketService.subscribe('NEW_MESSAGE', (data) => {
      console.log('💬💬💬 messages.jsx: Received NEW_MESSAGE (Socket.IO):', data);
      
      // Socket.IO format: { conversationId: "...", message: { text: "...", from: "...", timestamp: "..." } }
      if (data.conversationId && data.message) {
        console.log('💬 Dispatching to Redux:', data.conversationId);
        dispatch(addIncomingMessage({
          conversationId: data.conversationId,
          message: {
            text: data.message.text,
            from: data.message.from,
            timestamp: data.message.timestamp || new Date().toISOString()
          }
        }));
      }
    });

    return () => {
      console.log('💬 messages.jsx: Cleaning up socket subscription');
      unsubscribe();
    };
  }, [isAuthenticated, currentUser, dispatch]);

  // Send message
  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim() || !selectedConversation) return;

    const to = otherParticipantEmail;
    const text = newMessage.trim();

    console.log('💬 Sending message:', { to, text, from: currentUser });

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
      
      // Also send via Socket.IO
      if (socketService.isConnected()) {
        console.log('💬 Sending via Socket.IO');
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

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversationId, selectedConversation?.messages?.length]);

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
          Real-time messaging with Socket.IO
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
                                {lastMessage.from === currentUser ? "You: " : ""}
                                {lastMessage.text}
                              </div>
                            )}
                          </div>
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
                      Conversation with {otherParticipantEmail?.split('@')[0] || 'User'}
                    </h2>
                    <p className="text-sm text-gray-500">{otherParticipantEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${socketService.isConnected() ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-500">
                      {socketService.isConnected() ? 'Socket.IO Connected' : 'Disconnected'}
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
                  Press Enter to send 
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
                Choose a conversation to view messages. You can start a new conversation from any board by clicking "Contact" on a skill that has been added.  
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;