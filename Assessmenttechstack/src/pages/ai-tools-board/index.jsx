// src/pages/ai-tools-board/AiToolsBoard.jsx
import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAiToolsResources,
  createAiToolsResource,
  likeAiToolsResource,
} from "../../store/slices/aiToolsSlice";
import { addConversation } from "../../store/slices/messagesSlice";
import { AuthContext } from "../../context/AuthContext";

function AiToolsBoard() {
  const dispatch = useDispatch();
  const { userEmail } = useContext(AuthContext);

  const aiToolsBoard = useSelector((state) => state.aiToolsBoard);
  const aiTools = aiToolsBoard?.aiToolsResources || [];
  const status = aiToolsBoard?.status || "idle";
  const error = aiToolsBoard?.error || null;

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    link: "",
    datePosted: "",
    likes: 0,
    user: "",
  });

  const [showModal, setShowModal] = useState(false);

  /* ---------- CONTACT STATE ---------- */
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactUser, setContactUser] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  // ✅ Load from MongoDB when board opens
  useEffect(() => {
    dispatch(fetchAiToolsResources());
  }, [dispatch]);

  const handleAddIdea = async (e) => {
    e.preventDefault();

    // ✅ Save to MongoDB
    await dispatch(
      createAiToolsResource({
        title: newIdea.title,
        description: newIdea.description,
        link: newIdea.link,
        ownerEmail: userEmail || "unknown@local",
        ownerName: newIdea.user || "",
      })
    );

    setNewIdea({
      title: "",
      description: "",
      link: "",
      datePosted: "",
      likes: 0,
      user: "",
    });
    setShowModal(false);
  };

  const handleLike = (idea) => {
    dispatch(likeAiToolsResource({ id: idea.id, currentLikes: idea.likes }));
  };

  /* ---------- CONTACT HANDLERS ---------- */
  const handleContact = (user) => {
    setContactUser(user);
    setShowContactModal(true);
  };

  const handleSendMessage = () => {
    if (!contactMessage.trim()) return;

    dispatch(
      addConversation({
        id: Date.now(),
        participants: ["You", contactUser],
        messages: [
          {
            sender: "You",
            text: contactMessage,
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      })
    );

    setContactMessage("");
    setShowContactModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl">AI Tools Board</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Idea
        </button>
      </div>

      {/* status / error */}
      {status === "loading" && (
        <div className="mb-4 p-3 rounded bg-white border">
          Loading AI tools from MongoDB…
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {/* ---------- ADD IDEA MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New AI Tool</h2>
            <form onSubmit={handleAddIdea}>
              <input
                placeholder="Title"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="w-full rounded border p-3 mb-4"
                required
              />

              <textarea
                placeholder="Description"
                value={newIdea.description}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, description: e.target.value })
                }
                className="w-full rounded border p-3 mb-4"
                required
              />

              <input
                placeholder="Optional Link"
                value={newIdea.link}
                onChange={(e) => setNewIdea({ ...newIdea, link: e.target.value })}
                className="w-full rounded border p-3 mb-4"
              />

              {/* Keeping your datePosted field in the UI (not stored in Mongo currently) */}
              <input
                type="date"
                value={newIdea.datePosted}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, datePosted: e.target.value })
                }
                className="w-full rounded border p-3 mb-4"
              />

              <input
                placeholder="Your Name"
                value={newIdea.user}
                onChange={(e) => setNewIdea({ ...newIdea, user: e.target.value })}
                className="w-full rounded border p-3 mb-4"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Add Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- TABLE ---------- */}
      {aiTools.length === 0 ? (
        <p>No AI tools added yet.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Description</th>
              <th className="text-left p-2">Link</th>
              <th className="text-left p-2">Likes</th>
              <th className="text-left p-2">User</th>
              <th className="text-left p-2">Contact</th>
            </tr>
          </thead>

          <tbody>
            {aiTools.map((idea) => (
              <tr key={idea.id} className="border-t">
                <td className="p-2">{idea.title}</td>
                <td className="p-2">{idea.description}</td>
                <td className="p-2">
                  {idea.link && (
                    <a
                      href={idea.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600"
                    >
                      Visit
                    </a>
                  )}
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleLike(idea)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Like ({idea.likes || 0})
                  </button>
                </td>
                <td className="p-2">{idea.ownerName || idea.user || ""}</td>
                <td className="p-2">
                  <button
                    onClick={() => handleContact(idea.ownerName || idea.user || "User")}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ---------- CONTACT MODAL ---------- */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Contact {contactUser}</h2>

            <textarea
              value={contactMessage}
              onChange={(e) => setContactMessage(e.target.value)}
              className="w-full border p-3 mb-4"
              placeholder="Your message"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowContactModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiToolsBoard;
