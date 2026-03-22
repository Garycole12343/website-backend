// src/pages/cooking-board/CookingBoard.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addCookingResource, updateCookingLike } from "../../store/slices/cookingBoardSlice";
import { addConversation } from "../../store/slices/messagesSlice";
import { saveState } from "../../store/localStorage";

function CookingBoard() {
  const dispatch = useDispatch();
  const board = useSelector((state) => state.cookingBoard);
  const resources = board?.cookingResources || [];

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

  // Persist to localStorage whenever board changes
  useEffect(() => {
    saveState("cookingBoard", board);
  }, [board]);

  const handleAddIdea = (e) => {
    e.preventDefault();
    dispatch(addCookingResource({ ...newIdea, id: Date.now() }));
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

  const handleLike = (id) => dispatch(updateCookingLike(id));

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
    <div className="min-h-screen p-4">
      <h1 className="text-3xl mb-4">Cooking Board</h1>

      <button
        onClick={() => setShowModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded mb-8"
      >
        Add Recipe / Idea
      </button>

      {/* ---------- ADD IDEA MODAL ---------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Cooking Idea</h2>
            <form onSubmit={handleAddIdea}>
              <input
                placeholder="Title"
                value={newIdea.title}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, title: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded"
                required
              />

              <textarea
                placeholder="Description"
                value={newIdea.description}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, description: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded"
                required
              />

              <input
                placeholder="Optional Link"
                value={newIdea.link}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, link: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded"
              />

              <input
                type="date"
                value={newIdea.datePosted}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, datePosted: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded"
              />

              <input
                placeholder="Your Name"
                value={newIdea.user}
                onChange={(e) =>
                  setNewIdea({ ...newIdea, user: e.target.value })
                }
                className="w-full p-3 mb-4 border rounded"
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
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- TABLE ---------- */}
      {resources.length === 0 ? (
        <p>No cooking ideas yet.</p>
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
            {resources.map((idea) => (
              <tr key={idea.id}>
                <td>{idea.title}</td>
                <td>{idea.description}</td>
                <td>
                  {idea.link && (
                    <a
                      href={idea.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-green-600"
                    >
                      Visit
                    </a>
                  )}
                </td>
                <td>{idea.datePosted}</td>
                <td className="text-center">
                  <button
                    onClick={() => handleLike(idea.id)}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    Like ({idea.likes})
                  </button>
                </td>
                <td>{idea.user}</td>
                <td>
                  <button
                    onClick={() => handleContact(idea.user)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
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
              placeholder="Write your message..."
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
                className="bg-green-600 text-white px-4 py-2 rounded"
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

export default CookingBoard;
