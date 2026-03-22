import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addWritingResource,
  updateWritingLike,
} from "../../store/slices/writingBoardSlice";
import { addMessage } from "../../store/slices/messagesSlice";
import { saveState } from "../../store/localStorage";

function WritingBoard() {
  const dispatch = useDispatch();
  const board = useSelector(state => state.writingBoard);
  const writingIdeas = board?.writingResources || [];

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

  useEffect(() => {
    saveState("writingBoard", board);
  }, [board]);

  const handleAddIdea = e => {
    e.preventDefault();
    dispatch(addWritingResource({ ...newIdea, id: Date.now() }));
    setNewIdea({ title: "", description: "", link: "", datePosted: "", likes: 0, user: "" });
    setShowModal(false);
  };

  const handleLike = id => dispatch(updateWritingLike(id));

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
    <div className="min-h-screen p-6">
      <h1 className="text-3xl mb-6">Writing Board</h1>

      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6"
      >
        Add Writing Idea
      </button>

      {/* Add Idea Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">New Writing Idea</h2>
            <form onSubmit={handleAddIdea}>
              <input
                className="w-full p-3 mb-3 border rounded"
                placeholder="Title"
                value={newIdea.title}
                onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                required
              />
              <textarea
                className="w-full p-3 mb-3 border rounded"
                placeholder="Description"
                value={newIdea.description}
                onChange={e => setNewIdea({ ...newIdea, description: e.target.value })}
                required
              />
              <input
                className="w-full p-3 mb-3 border rounded"
                placeholder="Optional Link"
                value={newIdea.link}
                onChange={e => setNewIdea({ ...newIdea, link: e.target.value })}
              />
              <input
                type="date"
                className="w-full p-3 mb-3 border rounded"
                value={newIdea.datePosted}
                onChange={e => setNewIdea({ ...newIdea, datePosted: e.target.value })}
              />
              <input
                className="w-full p-3 mb-3 border rounded"
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
          <div className="bg-white p-6 rounded w-full max-w-md">
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

      {writingIdeas.length === 0 ? (
        <p>No writing ideas yet.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Description</th>
              <th className="border px-4 py-2">Link</th>
              <th className="border px-4 py-2">Date</th>
              <th className="border px-4 py-2">Likes</th>
              <th className="border px-4 py-2">User</th>
              <th className="border px-4 py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {writingIdeas.map(idea => (
              <tr key={idea.id}>
                <td className="border px-4 py-2">{idea.title}</td>
                <td className="border px-4 py-2">{idea.description}</td>
                <td className="border px-4 py-2">
                  {idea.link && (
                    <a href={idea.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">View</a>
                  )}
                </td>
                <td className="border px-4 py-2">{idea.datePosted}</td>
                <td className="border px-4 py-2 text-center">
                  <button onClick={() => handleLike(idea.id)} className="bg-blue-600 text-white px-2 py-1 rounded">
                    Like ({idea.likes})
                  </button>
                </td>
                <td className="border px-4 py-2">{idea.user}</td>
                <td className="border px-4 py-2 text-center">
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

export default WritingBoard;
