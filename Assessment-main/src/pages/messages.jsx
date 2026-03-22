// src/pages/messages.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../store/slices/messagesSlice";

// CHANGE: Rename MessagesTab to Messages
function Messages({ currentUser = "You" }) {
  const dispatch = useDispatch();
  const conversations = useSelector((state) => state.messages.conversations);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  // Get the selected conversation from Redux state based on ID
  const selectedConversation = conversations.find(conv => conv.id === selectedConversationId);

  const handleSendMessage = () => {
    if (selectedConversationId && newMessage.trim()) {
      const message = {
        sender: currentUser,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString(),
      };
      dispatch(addMessage({ conversationId: selectedConversationId, message }));
      setNewMessage("");
    }
  };

  // Log for debugging
  useEffect(() => {
    console.log("Conversations updated:", conversations);
    if (selectedConversationId) {
      console.log("Selected conversation:", selectedConversation);
    }
  }, [conversations, selectedConversationId, selectedConversation]);

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <h1 className="text-3xl mb-4">Messages</h1>
      <div className="flex">
        <div className="w-1/3 border-r pr-4">
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
          <ul>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`cursor-pointer p-2 border-b hover:bg-gray-100 ${selectedConversationId === conv.id ? 'bg-blue-50' : ''}`}
              >
                {conv.participants.find(p => p !== currentUser)}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 pl-4">
          {selectedConversation ? (
            <>
              <h2 className="text-xl font-bold mb-4">
                Messages with {selectedConversation.participants.find(p => p !== currentUser)}
              </h2>
              <div className="border rounded p-4 mb-4 h-64 overflow-y-auto">
                {selectedConversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 ${msg.sender === currentUser ? "text-right" : "text-left"}`}
                  >
                    <span className={`inline-block p-2 rounded ${msg.sender === currentUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {msg.text} <small className="text-gray-500">({msg.timestamp})</small>
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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

// CHANGE: Export as default
export default Messages; // Not MessagesTab