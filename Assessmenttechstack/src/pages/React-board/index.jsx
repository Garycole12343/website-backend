// src/pages/react-board/ReactBoard.jsx
import React, { useState, useEffect, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchReactResources,
  createReactResource,
  likeReactResource
} from "../../store/slices/reactBoardSlice";
import { addMessage } from "../../store/slices/messagesSlice";
import { AuthContext } from "../../context/AuthContext";

function ReactBoard() {
  const dispatch = useDispatch();
  const { userEmail } = useContext(AuthContext);

  const board = useSelector((state) => state.reactBoard);
  const reactIdeas = board?.reactResources || [];
  const status = board?.status || "idle";
  const error = board?.error || null;

  const [showModal, setShowModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    link: "",
    datePosted: "", // UI only (not stored in Mongo)
    likes: 0,
    user: ""
  });

  const [messageContent, setMessageContent] = useState("");

  // ✅ Load from MongoDB on mount
  useEffect(() => {
    dispatch(fetchReactResources());
  }, [dispatch]);

  const handleAddIdea = async (e) => {
    e.preventDefault();

    await dispatch(
      createReactResource({
        title: newIdea.title,
        description: newIdea.description,
        link: newIdea.link,
        ownerEmail: userEmail || "unknown@local",
        ownerName: newIdea.user || ""
      })
    );

    setNewIdea({
      title: "",
      description: "",
      link: "",
      datePosted: "",
      likes: 0,
      user: ""
    });

    setShowModal(false);
  };

  const handleLike = (idea) => {
    dispatch(likeReactResource({ id: idea.id, currentLikes: idea.likes }));
  };

  const handleContact = (user) => {
    setSelectedUser(user);
    setShowContactModal(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageContent.trim() !== "") {
      dispatch(
        addMessage({
          id: Date.now(),
          to: selectedUser,
          content: messageContent,
          dateSent: new Date().toISOString()
        })
      );
      setMessageContent("");
      setShowContactModal(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl">React Board</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add React Idea
        </button>
      </div>

      {status === "loading" && (
        <div className="mb-4 p-3 rounded bg-white border">Loading React ideas from MongoDB…</div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}

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
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                required
              />
              <textarea
                className="w-full p-3 mb-4 border rounded"
                placeholder="Description"
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                required
              />
              <input
                className="w-full p-3 mb-4 border rounded"
                placeholder="Optional Link"
                value={newIdea.link}
                onChange={(e) => setNewIdea({ ...newIdea, link: e.target.value })}
              />
              {/* UI only */}
              <input
                type="date"
                className="w-full p-3 mb-4 border rounded"
                value={newIdea.datePosted}
                onChange={(e) => setNewIdea({ ...newIdea, datePosted: e.target.value })}
              />
              <input
                className="w-full p-3 mb-4 border rounded"
                placeholder="Your Name"
                value={newIdea.user}
                onChange={(e) => setNewIdea({ ...newIdea, user: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Add
                </button>
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
                onChange={(e) => setMessageContent(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Send
                </button>
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
              <th className="py-2 px-4 border-b">Likes</th>
              <th className="py-2 px-4 border-b">User</th>
              <th className="py-2 px-4 border-b">Contact</th>
            </tr>
          </thead>
          <tbody>
            {reactIdeas.map((idea) => (
              <tr key={idea.id}>
                <td className="py-2 px-4 border-b">{idea.title}</td>
                <td className="py-2 px-4 border-b">{idea.description}</td>
                <td className="py-2 px-4 border-b">
                  {idea.link && (
                    <a href={idea.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      View
                    </a>
                  )}
                </td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleLike(idea)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    Like ({idea.likes || 0})
                  </button>
                </td>
                <td className="py-2 px-4 border-b">{idea.ownerName || ""}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button
                    onClick={() => handleContact(idea.ownerName || "User")}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
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
