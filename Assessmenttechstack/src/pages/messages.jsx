// src/pages/messages.jsx
import React, { useEffect, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AuthContext } from "../context/AuthContext";
import { fetchConversations, sendMessage } from "../store/slices/messagesSlice";

function Messages() {
  const dispatch = useDispatch();
  const { userEmail, isAuthenticated } = useContext(AuthContext);

  const { conversations, status, error } = useSelector((state) => state.messages);

  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const currentUser = (userEmail || "").toLowerCase();

  // Load conversations from Mongo on page open
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      dispatch(fetchConversations(currentUser));
    }
  }, [dispatch, isAuthenticated, currentUser]);

  const selectedConversation = conversations.find((c) => c.id === selectedConversationId);

  const otherParticipant = (conv) =>
    (conv.participants || []).find((p) => p !== currentUser) || "Unknown";

  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim()) return;

    await dispatch(
      sendMessage({
        conversationId: selectedConversationId,
        sender: currentUser,
        text: newMessage.trim()
      })
    );

    setNewMessage("");
  };

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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>
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
                {(selectedConversation.messages || []).map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${msg.sender === currentUser ? "text-right" : "text-left"}`}
                  >
                    <span
                      className={`inline-block p-2 rounded ${
                        msg.sender === currentUser ? "bg-blue-100" : "bg-gray-100"
                      }`}
                    >
                      {msg.text}{" "}
                      <small className="text-gray-500">
                        ({msg.timestamp?.slice(11, 19) || ""})
                      </small>
                    </span>
                  </div>
                ))}
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
