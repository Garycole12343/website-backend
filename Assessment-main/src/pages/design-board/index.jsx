// src/pages/design-board/DesignBoard.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addDesignResource, updateDesignLike } from "../../store/slices/designBoardSlice";
import { saveState } from "../../store/localStorage";

function DesignBoard() {
  const dispatch = useDispatch();
  const board = useSelector(state => state.designBoard);
  const resources = board?.designResources || [];

  const [newIdea, setNewIdea] = useState({
    title: "",
    description: "",
    link: "",
    datePosted: "",
    likes: 0,
    user: "",
  });

  const [showModal, setShowModal] = useState(false);

  // Persist to localStorage whenever board changes
  useEffect(() => saveState("designBoard", board), [board]);

  const handleAddIdea = e => {
    e.preventDefault();
    dispatch(addDesignResource({ ...newIdea, id: Date.now() }));
    setNewIdea({ title: "", description: "", link: "", datePosted: "", likes: 0, user: "" });
    setShowModal(false);
  };

  const handleLike = id => dispatch(updateDesignLike(id));

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl mb-4">Design Board</h1>
      <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded mb-8">Add Idea</button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Idea</h2>
            <form onSubmit={handleAddIdea}>
              <input
                placeholder="Title"
                value={newIdea.title}
                onChange={e => setNewIdea({ ...newIdea, title: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={newIdea.description}
                onChange={e => setNewIdea({ ...newIdea, description: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
                required
              />
              <input
                placeholder="Optional Link"
                value={newIdea.link}
                onChange={e => setNewIdea({ ...newIdea, link: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
              />
              <input
                type="date"
                value={newIdea.datePosted}
                onChange={e => setNewIdea({ ...newIdea, datePosted: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
              />
              <input
                placeholder="Your Name"
                value={newIdea.user}
                onChange={e => setNewIdea({ ...newIdea, user: e.target.value })}
                className="w-full p-3 mb-4 border rounded"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <p>No design resources yet.</p>
      ) : (
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b text-center">Title</th>
              <th className="py-2 px-4 border-b text-center">Description</th>
              <th className="py-2 px-4 border-b text-center">Link</th>
              <th className="py-2 px-4 border-b text-center">Date</th>
              <th className="py-2 px-4 border-b text-center">Likes</th>
              <th className="py-2 px-4 border-b text-center">User</th>
            </tr>
          </thead>
          <tbody>
            {resources.map(idea => (
              <tr key={idea.id}>
                <td className="py-2 px-4 border-b">{idea.title}</td>
                <td className="py-2 px-4 border-b">{idea.description}</td>
                <td className="py-2 px-4 border-b">
                  {idea.link && <a href={idea.link} target="_blank" rel="noreferrer">{idea.link}</a>}
                </td>
                <td className="py-2 px-4 border-b">{idea.datePosted}</td>
                <td className="py-2 px-4 border-b text-center">
                  <button onClick={() => handleLike(idea.id)} className="bg-blue-600 text-white px-2 py-1 rounded">
                    Like ({idea.likes})
                  </button>
                </td>
                <td className="py-2 px-4 border-b">{idea.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DesignBoard;
