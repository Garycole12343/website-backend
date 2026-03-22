// src/pages/react-board/ReactBoard.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addReactResource, updateReactLike } from "../../store/slices/reactBoardSlice";
import { addMessage } from "../../store/slices/messagesSlice";
import { saveState } from "../../store/localStorage";

function ReactBoard() {
  const dispatch = useDispatch();
  const board = useSelector(state => state.reactBoard);
  const reactIdeas = board?.reactResources || [];

  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    link: "",
    datePosted: "",
    likes: 0,
    user: "",
  });
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => saveState("reactBoard", board), [board]);

  const handleAddIdea = e => {
    e.preventDefault();
    dispatch(addReactResource({ ...newIdea, id: Date.now() }));
    setNewIdea({ title: "", description: "", link: "", datePosted: "", likes: 0, user: "" });
    setShowModal(false);
  };

  const handleLike = id => dispatch(updateReactLike(id));

  const handleContact = (user) => {
    setSelectedUser(user);
    setShowContactModal(true);
  };

  const handleSendMessage = e => {
    e.preventDefault();
    if (messageContent.trim() !== "") {
      dispatch(addMessage({
        id: Date.now(),
        to: selectedUser,
        content: messageContent,
        dateSent: new Date().toISOString(),
      }));
      setMessageContent("");
      setShowContactModal(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl mb-4">React Board</h1>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-8"
      >
        Add React Idea
      </button>

      {/* Add Idea Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New React Idea</h2>
            <form onSubmit={handleAddIdea}>
              <input
                className="w-full p-3 mb-4 border rounded"
                placeholder="Title"
                value={newIdea.title}
                onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                required
              />
              <textarea
                className="w-full p-3 mb-4 border rounded"
                placeholder="Description"
                value={newIdea.description}
                onChange={e => setNewIdea({ ...newIdea, description: e.target.value })}
                required
              />
              <input
                className="w-full p-3 mb-4 border rounded"
                placeholder="Optional Link"
                value={newIdea.link}
                onChange={e => setNewIdea({ ...newIdea, link: e.target.value })}
              />
              <input
                type="date"
                className="w-full p-3 mb-4 border rounded"
                value={newIdea.datePosted}
                onChange={e => setNewIdea({ ...newIdea, datePosted: e.target.value })}
              />
              <input
                className="w-full p-3 mb-4 border rounded"
                placeholder="Your Name"
                value={newIdea.user}
                onChange={e => setNewIdea({ ...newIdea, user: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Contact {selectedUser}</h2>
            <form onSubmit={handleSendMessage}>
              <textarea
                className="w-full p-3 mb-4 border rounded"
                placeholder="Your message..."
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowContactModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ideas Table */}
      {reactIdeas.length === 0 ? (
        <p>No React ideas yet.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Link</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Likes</th>
              <th className="py-2 px-4 border-b">User</th>
              <th className="py-2 px-4 border-b">Contact</th>
            </tr>
          </thead>
          <tbody>
            {reactIdeas.map(idea => (
              <tr key={idea.id}>
                <td className="py-2 px-4 border-b">{idea.title}</td>
                <td className="py-2 px-4 border-b">{idea.description}</td>
                <td className="py-2 px-4 border-b">
                  {idea.link && (
                    <a href={idea.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                  )}
                </td>
                <td className="py-2 px-4 border-b">{idea.datePosted}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button onClick={() => handleLike(idea.id)} className="bg-blue-600 text-white px-2 py-1 rounded">
                    Like ({idea.likes})
                  </button>
                </td>
                <td className="py-2 px-4 border-b">{idea.user}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button onClick={() => handleContact(idea.user)} className="bg-green-600 text-white px-2 py-1 rounded">
                    Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ReactBoard;
