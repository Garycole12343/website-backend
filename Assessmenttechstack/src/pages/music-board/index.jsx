// src/pages/music-board/MusicBoard.jsx
import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMusicResources,
  createMusicResource,
  likeMusicResource
} from "../../store/slices/musicBoardSlice";
import { createConversation, sendMessage } from "../../store/slices/messagesSlice";
import { AuthContext } from "../../context/AuthContext";

function MusicBoard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userEmail } = useContext(AuthContext);

  const board = useSelector((state) => state.musicBoard);
  const resources = board?.musicResources || [];
  const status = board?.status || "idle";
  const error = board?.error || null;

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    link: "",
    datePosted: "", // UI only
    likes: 0,
    user: ""
  });

  const [showModal, setShowModal] = useState(false);

  /* ---------- CONTACT STATE ---------- */
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactUserEmail, setContactUserEmail] = useState("");
  const [contactUserName, setContactUserName] = useState("");
  const [contactMessage, setContactMessage] = useState("");

  const currentUserEmail = (userEmail || "").toLowerCase();

  // ✅ Load from MongoDB on mount
  useEffect(() => {
    dispatch(fetchMusicResources());
  }, [dispatch]);

  const handleAddIdea = async (e) => {
    e.preventDefault();

    await dispatch(
      createMusicResource({
        title: newIdea.title,
        description: newIdea.description,
        link: newIdea.link,
        ownerEmail: currentUserEmail || "unknown@local",
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
    dispatch(likeMusicResource({ id: idea.id, currentLikes: idea.likes }));
  };

  /* ---------- CONTACT HANDLERS ---------- */
  const handleContact = (email, name) => {
    setContactUserEmail((email || "").toLowerCase());
    setContactUserName(name || email || "User");
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!contactMessage.trim()) return;
    if (!currentUserEmail) return;

    const otherEmail = (contactUserEmail || "").toLowerCase();

    // Must have a valid email to message
    if (!otherEmail || otherEmail === "unknown@local") return;

    // Prevent messaging yourself
    if (otherEmail === currentUserEmail) return;

    try {
      // 1) Create (or fetch existing) conversation in MongoDB
      const convo = await dispatch(
        createConversation({ participants: [currentUserEmail, otherEmail] })
      ).unwrap();

      // 2) Send message to MongoDB
      await dispatch(
        sendMessage({
          conversationId: convo.id,
          sender: currentUserEmail,
          text: contactMessage.trim()
        })
      ).unwrap();

      setContactMessage("");
      setShowContactModal(false);

      // 3) Go to messages page and open convo
      navigate("/messages", { state: { conversationId: convo.id } });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl">Music Board</h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Add Music Idea
        </button>
      </div>

      {status === "loading" && (
        <div className="mb-4 p-3 rounded bg-white border">
          Loading music ideas from MongoDB…
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
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Music Idea</h2>
            <form onSubmit={handleAddIdea}>
              <input
                placeholder="Title"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
                required
              />

              <textarea
                placeholder="Description"
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
                required
              />

              <input
                placeholder="Optional Link"
                value={newIdea.link}
                onChange={(e) => setNewIdea({ ...newIdea, link: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
              />

              {/* UI only */}
              <input
                type="date"
                value={newIdea.datePosted}
                onChange={(e) => setNewIdea({ ...newIdea, datePosted: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
              />

              <input
                placeholder="Your Name"
                value={newIdea.user}
                onChange={(e) => setNewIdea({ ...newIdea, user: e.target.value })}
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
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- TABLE ---------- */}
      {resources.length === 0 ? (
        <p>No music ideas yet.</p>
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
            {resources.map((idea) => (
              <tr key={idea.id} className="border-t">
                <td className="p-2">{idea.title}</td>
                <td className="p-2">{idea.description}</td>
                <td className="p-2">
                  {idea.link && (
                    <a href={idea.link} target="_blank" rel="noreferrer" className="text-blue-600">
                      Visit
                    </a>
                  )}
                </td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => handleLike(idea)}
                    className="bg-purple-600 text-white px-2 py-1 rounded"
                  >
                    Like ({idea.likes || 0})
                  </button>
                </td>
                <td className="p-2">{idea.ownerName || ""}</td>
                <td className="p-2">
                  <button
                    onClick={() =>
                      handleContact(
                        idea.ownerEmail,
                        idea.ownerName || idea.user || idea.ownerEmail || "User"
                      )
                    }
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
            <h2 className="text-xl font-bold mb-4">Contact {contactUserName}</h2>

            {!contactUserEmail ? (
              <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
                This post doesn’t have an owner email, so messaging can’t start.
              </div>
            ) : null}

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

export default MusicBoard;
