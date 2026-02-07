// src/pages/music-board/MusicBoard.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchMusicResources,
  createMusicResource,
  likeMusicResource
} from "../../store/slices/musicBoardSlice";
import { createConversation, sendMessage } from "../../store/slices/messagesSlice";
import { AuthContext } from "../../context/AuthContext";

// Modal Components
const ContactModal = ({ 
  isOpen, 
  onClose, 
  userName, 
  message, 
  onMessageChange, 
  onSend,
  isLoading,
  hasValidEmail 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Contact {userName}</h2>

        {!hasValidEmail ? (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
            This post doesn't have a valid owner email, so messaging can't start.
          </div>
        ) : null}

        <textarea
          value={message}
          onChange={onMessageChange}
          className="w-full border p-3 mb-4 rounded"
          placeholder="Write your message..."
          rows="4"
          disabled={!hasValidEmail || isLoading}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={isLoading || !message.trim() || !hasValidEmail}
            className={`bg-blue-600 text-white px-4 py-2 rounded ${isLoading || !message.trim() || !hasValidEmail ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddIdeaModal = ({ 
  isOpen, 
  onClose, 
  newIdea, 
  onIdeaChange, 
  onSubmit,
  isLoading 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Music Idea</h2>
        <form onSubmit={onSubmit}>
          <input
            placeholder="Title *"
            value={newIdea.title}
            onChange={(e) => onIdeaChange('title', e.target.value)}
            className="w-full p-3 mb-4 border rounded"
            required
            aria-label="Title"
            disabled={isLoading}
          />

          <textarea
            placeholder="Description *"
            value={newIdea.description}
            onChange={(e) => onIdeaChange('description', e.target.value)}
            className="w-full p-3 mb-4 border rounded"
            rows="4"
            required
            aria-label="Description"
            disabled={isLoading}
          />

          <input
            placeholder="Optional Link (e.g., SoundCloud, YouTube, Spotify)"
            value={newIdea.link}
            onChange={(e) => onIdeaChange('link', e.target.value)}
            className="w-full p-3 mb-4 border rounded"
            aria-label="Link"
            disabled={isLoading}
          />

          <input
            placeholder="Your Name *"
            value={newIdea.user}
            onChange={(e) => onIdeaChange('user', e.target.value)}
            className="w-full p-3 mb-4 border rounded"
            required
            aria-label="Your Name"
            disabled={isLoading}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
    user: ""
  });

  const [showModal, setShowModal] = useState(false);
  const [isAddingIdea, setIsAddingIdea] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactUserEmail, setContactUserEmail] = useState("");
  const [contactUserName, setContactUserName] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const currentUserEmail = useMemo(() => 
    (userEmail || "").toLowerCase().trim(), 
    [userEmail]
  );

  const hasValidContactEmail = useMemo(() => {
    const to = (contactUserEmail || "").toLowerCase().trim();
    return to && to !== "unknown@local" && to !== currentUserEmail;
  }, [contactUserEmail, currentUserEmail]);

  const paginatedResources = useMemo(() => 
    resources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [resources, currentPage]
  );

  const totalPages = Math.ceil(resources.length / itemsPerPage);

  // Debug: Log current user email
  useEffect(() => {
    console.log("Current User Email:", currentUserEmail);
    console.log("Music Resources:", resources);
  }, [currentUserEmail, resources]);

  useEffect(() => {
    dispatch(fetchMusicResources());
  }, [dispatch]);

  useEffect(() => {
    if (showModal || showContactModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showContactModal]);

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateNewIdea = () => {
    if (!newIdea.title.trim()) {
      alert("Title is required");
      return false;
    }
    if (!newIdea.description.trim()) {
      alert("Description is required");
      return false;
    }
    if (!newIdea.user.trim()) {
      alert("Your name is required");
      return false;
    }
    if (newIdea.link && !isValidUrl(newIdea.link)) {
      alert("Please enter a valid URL (include http:// or https://)");
      return false;
    }
    return true;
  };

  const handleIdeaChange = (field, value) => {
    setNewIdea(prev => ({ ...prev, [field]: value }));
  };

  const handleAddIdea = async (e) => {
    e.preventDefault();
    
    if (!validateNewIdea()) return;
    
    if (!currentUserEmail) {
      alert("You must be logged in to add an idea");
      return;
    }

    setIsAddingIdea(true);
    
    try {
      await dispatch(
        createMusicResource({
          title: newIdea.title.trim(),
          description: newIdea.description.trim(),
          link: newIdea.link.trim(),
          ownerEmail: currentUserEmail,
          ownerName: newIdea.user.trim()
        })
      ).unwrap();

      setNewIdea({ title: "", description: "", link: "", user: "" });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add idea:", err);
      alert("Failed to add idea. Please try again.");
    } finally {
      setIsAddingIdea(false);
    }
  };

  const handleLike = (idea) => {
    dispatch(likeMusicResource({ 
      id: idea.id, 
      currentLikes: idea.likes 
    }));
  };

  const handleContact = (email, name) => {
    const normalizedEmail = (email || "").toLowerCase().trim();
    setContactUserEmail(normalizedEmail);
    setContactUserName(name || normalizedEmail || "User");
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    const text = contactMessage.trim();
    if (!text) {
      alert("Please enter a message");
      return;
    }

    if (!currentUserEmail) {
      alert("You must be logged in to send a message.");
      return;
    }

    const to = (contactUserEmail || "").toLowerCase().trim();
    if (!to || to === "unknown@local") {
      alert("This post doesn't have a valid owner email, so messaging can't start.");
      return;
    }

    if (to === currentUserEmail) {
      alert("You can't message yourself.");
      return;
    }

    setIsSendingMessage(true);

    try {
      const convo = await dispatch(
        createConversation({ participants: [currentUserEmail, to] })
      ).unwrap();

      const conversationId = convo?.id;
      if (!conversationId) {
        alert("Could not create conversation.");
        return;
      }

      await dispatch(
        sendMessage({
          conversationId,
          from: currentUserEmail,
          to,
          text,
        })
      ).unwrap();

      setContactMessage("");
      setShowContactModal(false);
      navigate("/messages", { state: { conversationId } });
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(typeof err === "string" ? err : "Failed to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-slate-50">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Music Board</h1>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
          aria-label="Add new music idea"
        >
          + Add Music Idea
        </button>
      </div>

      {status === "loading" && (
        <div className="mb-6 p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <span className="text-gray-600">Loading music ideas from MongoDB…</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <p className="font-medium">Error: {error}</p>
          <button 
            onClick={() => dispatch(fetchMusicResources())}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      <AddIdeaModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        newIdea={newIdea}
        onIdeaChange={handleIdeaChange}
        onSubmit={handleAddIdea}
        isLoading={isAddingIdea}
      />

      {resources.length === 0 && status !== "loading" ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No music ideas yet. Be the first to share!</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium"
          >
            Add First Idea
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Likes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedResources.map((idea) => {
                    const ownerEmail = idea.ownerEmail || "";
                    const hasEmail = ownerEmail && 
                                    ownerEmail.trim() !== "" &&
                                    ownerEmail.toLowerCase().trim() !== "unknown@local";
                    
                    if (!hasEmail && idea.ownerEmail) {
                      console.log("Contact disabled for:", {
                        title: idea.title,
                        ownerEmail: idea.ownerEmail,
                        currentUserEmail: currentUserEmail,
                        isUnknown: ownerEmail.toLowerCase().trim() === "unknown@local",
                        isSame: ownerEmail.toLowerCase().trim() === currentUserEmail
                      });
                    }
                    
                    return (
                      <tr key={idea.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{idea.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700 max-w-xs">{idea.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {idea.link && isValidUrl(idea.link) ? (
                            <a
                              href={idea.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              Visit ↗
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleLike(idea)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg font-medium border border-purple-200 transition-colors"
                            aria-label={`Like ${idea.title}. Current likes: ${idea.likes || 0}`}
                          >
                            ❤️ Like ({idea.likes || 0})
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-700">{idea.ownerName || "Anonymous"}</div>
                          {ownerEmail && (
                            <div className="text-xs text-gray-500">Email: {ownerEmail}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              handleContact(
                                ownerEmail,
                                idea.ownerName || ownerEmail || "User"
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              hasEmail 
                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!hasEmail}
                            aria-label={hasEmail ? `Contact ${idea.ownerName || 'post owner'}` : "Contact unavailable"}
                            title={!hasEmail ? `Email: ${ownerEmail || "None"} | Current: ${currentUserEmail || "None"}` : ""}
                          >
                            {hasEmail ? "Contact" : "No Contact"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <ContactModal
        isOpen={showContactModal}
        onClose={() => {
          setShowContactModal(false);
          setContactMessage("");
        }}
        userName={contactUserName}
        message={contactMessage}
        onMessageChange={(e) => setContactMessage(e.target.value)}
        onSend={handleSendMessage}
        isLoading={isSendingMessage}
        hasValidEmail={hasValidContactEmail}
      />
    </div>
  );
}

export default MusicBoard;