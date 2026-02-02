// src/pages/design-board/DesignBoard.jsx
import React, { useState, useEffect, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDesignResources,
  createDesignResource,
  likeDesignResource
} from "../../store/slices/designBoardSlice";
import { AuthContext } from "../../context/AuthContext";

function DesignBoard() {
  const dispatch = useDispatch();
  const { userEmail } = useContext(AuthContext);

  const board = useSelector((state) => state.designBoard);
  const resources = board?.designResources || [];
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

  // ✅ Load from MongoDB on mount
  useEffect(() => {
    dispatch(fetchDesignResources());
  }, [dispatch]);

  const handleAddIdea = async (e) => {
    e.preventDefault();

    await dispatch(
      createDesignResource({
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
    dispatch(likeDesignResource({ id: idea.id, currentLikes: idea.likes }));
  };

  return (
    <div className="min-h-screen p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl">Design Board</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Idea
        </button>
      </div>

      {status === "loading" && (
        <div className="mb-4 p-3 rounded bg-white border">
          Loading design resources from MongoDB…
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Idea</h2>
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
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Add
                </button>
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
              <th className="py-2 px-4 border-b text-center">Likes</th>
              <th className="py-2 px-4 border-b text-center">User</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((idea) => (
              <tr key={idea.id}>
                <td className="py-2 px-4 border-b">{idea.title}</td>
                <td className="py-2 px-4 border-b">{idea.description}</td>
                <td className="py-2 px-4 border-b">
                  {idea.link && (
                    <a href={idea.link} target="_blank" rel="noreferrer" className="text-blue-600">
                      Visit
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DesignBoard;
