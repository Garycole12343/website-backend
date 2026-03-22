// src/pages/ai-tools-board/AiToolsBoard.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  addAiToolsResource,
  updateAiToolsLike,
} from "../../store/slices/aiToolsSlice";
import { addConversation } from "../../store/slices/messagesSlice";
import { saveState } from "../../store/localStorage";

function AiToolsBoard() {
  const dispatch = useDispatch();

  const aiToolsBoard = useSelector((state) => state.aiToolsBoard);
  const aiTools = aiToolsBoard?.aiToolsResources || [];

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

  useEffect(() => {
    saveState("aiToolsBoard", aiToolsBoard);
  }, [aiToolsBoard]);

  const handleAddIdea = (e) => {
    e.preventDefault();
    dispatch(addAiToolsResource({ ...newIdea, id: Date.now() }));
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

  const handleLike = (id) => {
    dispatch(updateAiToolsLike(id));
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
      <h1 className="text-3xl mb-4">AI Tools Board</h1>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-8"
      >
        Add Idea
      </button>

      {/* ---------- ADD IDEA MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New AI Tool</h2>
            <form onSubmit={handleAddIdea}>
              <input
                placeholder="Title"
                value={newIdea.title}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, title: e.target.value })
                }
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
                onChange={(e) =>
                  setNewIdea({ ...newIdea, link: e.target.value })
                }
                className="w-full rounded border p-3 mb-4"
              />

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
                onChange={(e) =>
                  setNewIdea({ ...newIdea, user: e.target.value })
                }
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
              <th>Title</th>
              <th>Description</th>
              <th>Link</th>
              <th>Date</th>
              <th>Likes</th>
              <th>User</th>
              <th>Contact</th>
            </tr>
          </thead>

          <tbody>
            {aiTools.map((idea) => (
              <tr key={idea.id}>
                <td>{idea.title}</td>
                <td>{idea.description}</td>
                <td>
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
                <td>{idea.datePosted}</td>
                <td>
                  <button
                    onClick={() => handleLike(idea.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Like ({idea.likes})
                  </button>
                </td>
                <td>{idea.user}</td>
                <td>
                  <button
                    onClick={() => handleContact(idea.user)}
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
            <h2 className="text-xl font-bold mb-4">
              Contact {contactUser}
            </h2>

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
