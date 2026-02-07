// src/pages/messages.jsx
import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { fetchConversations, sendMessage, addIncomingMessage } from "../store/slices/messagesSlice";
import { io } from "socket.io-client";

function Messages() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { userEmail, isAuthenticated } = useContext(AuthContext);

  const { conversations, status, error } = useSelector((state) => state.messages);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const currentUser = (userEmail || "").toLowerCase().trim();

  // Load conversations from Mongo on page open
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      dispatch(fetchConversations(currentUser));
    }
  }, [dispatch, isAuthenticated, currentUser]);

  // Auto-open a conversation when navigated from a board
  useEffect(() => {
    const convId = location.state?.conversationId;
    if (convId) setSelectedConversationId(convId);
  }, [location.state]);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const otherParticipant = (conv) =>
    (conv?.participants || []).find((p) => p !== currentUser) || "Unknown";

  // Send message (matches backend: from/to/text)
  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim() || !selectedConversation) return;

    const to = otherParticipant(selectedConversation);
    await dispatch(
      sendMessage({
        conversationId: selectedConversationId,
        from: currentUser,
        to,
        text: newMessage.trim(),
      })
    );

    setNewMessage("");
  };

  // Initialize socket connection
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const socket = io("http://localhost:5000", {
      auth: { email: currentUser },
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ SocketIO connected:", socket.id, "transport:", socket.io.engine.transport.name);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ SocketIO connect_error:", err?.message || err);
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 SocketIO disconnected:", reason);
    });

    // Server emits: { conversationId, message }
    socket.on("new_message", (payload) => {
      if (!payload?.conversationId || !payload?.message) return;
      dispatch(addIncomingMessage(payload));
    });

    return () => {
      socket.off("new_message");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.disconnect();
    };
  }, [isAuthenticated, currentUser, dispatch]);

  // Scroll to bottom on new messages / conversation switch
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
      <h1 className="text-3xl mb-4">Messages</h1>

      {status === "loading" && (
        <div className="mb-4 p-3 bg-white border rounded">Loading conversations…</div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex">
        <div className="w-1/3 border-r pr-4">
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
          <ul>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`cursor-pointer p-2 border-b hover:bg-gray-100 ${
                  selectedConversationId === conv.id ? "bg-blue-50" : ""
                }`}
              >
                {otherParticipant(conv)}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-2/3 pl-4">
          {selectedConversation ? (
            <>
              <h2 className="text-xl font-bold mb-4">
                Messages with {otherParticipant(selectedConversation)}
              </h2>

              <div className="border rounded p-4 mb-4 h-64 overflow-y-auto bg-white">
                {(selectedConversation.messages || []).map((msg) => {
                  // backend message shape: { from, to, text, timestamp }
                  const sender = (msg.from || "").toLowerCase();
                  const isMe = sender === currentUser;

                  return (
                    <div
                      key={msg.id || msg.timestamp || Math.random()}
                      className={`mb-2 ${isMe ? "text-right" : "text-left"}`}
                    >
                      <span
                        className={`inline-block p-2 rounded ${
                          isMe ? "bg-blue-100" : "bg-gray-100"
                        }`}
                      >
                        {msg.text}{" "}
                        <small className="text-gray-500">
                          ({msg.timestamp?.slice(11, 19) || ""})
                        </small>
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 rounded border border-gray-300 p-2"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-4 py-2 rounded ml-2 hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">Select a conversation to view messages.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
