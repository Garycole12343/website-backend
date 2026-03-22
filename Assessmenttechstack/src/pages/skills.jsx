import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios"; // Import axios for API calls

// Assuming these are defined elsewhere, like in your Redux setup
// import { fetchResourcesByCategory } from '../store/slices/resourceSlice'; // Example, adjust path as needed

// Placeholder for a generic API service call function
// In a real app, this would be in a dedicated services file
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // Use Vite env var or default
  withCredentials: true, // To send cookies/session information
});

const SkillsPage = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentResources, setCurrentResources] = useState([]); // State to hold resources for the selected skill/search
  const [loadingReviews, setLoadingReviews] = useState({}); // State to manage loading for reviews
  const [newReviewData, setNewReviewData] = useState({}); // State to manage input for new reviews

  // Assume currentUser is available from Redux state
  const currentUser = useSelector((state) => state.auth?.currentUser); // Adjust path based on your Redux structure
  const userEmail = currentUser?.email;
  const userName = currentUser?.firstName || "Anonymous"; // Use first name or default to Anonymous

  // Get ALL resources from Redux - each board slice separately
  // Ensure your Redux store is configured to fetch resources and has these slices.
  const allResourcesRedux = useSelector((state) => ({
    javascriptResources: state.javascriptBoard?.javascriptResources || [],
    reactResources: state.reactBoard?.reactResources || [],
    codingResources: state.codingBoard?.codingResources || [],
    artResources: state.artBoard?.artResources || [],
    musicResources: state.musicBoard?.musicResources || [],
    designResources: state.designBoard?.designResources || [],
    photographyResources: state.photographyBoard?.photographyResources || [],
    cookingResources: state.cookingBoard?.cookingResources || [],
    aiToolsResources: state.aiToolsBoard?.aiToolsResources || [],
    writingResources: state.writingBoard?.writingResources || [],
  }));

  const skillCategories = [
    { name: "JavaScript", key: "javascriptResources", path: "/javascript" },
    { name: "React", key: "reactResources", path: "/react" },
    { name: "Coding", key: "codingResources", path: "/coding" },
    { name: "Art", key: "artResources", path: "/art" },
    { name: "Music", key: "musicResources", path: "/music" },
    { name: "Design", key: "designResources", path: "/design" },
    { name: "Photography", key: "photographyResources", path: "/photography" },
    { name: "Cooking", key: "cookingResources", path: "/cooking" },
    { name: "AI Tools", key: "aiToolsResources", path: "/ai-tools" },
    { name: "Writing", key: "writingResources", path: "/writing" },
  ];

  // Count resources for each category
  const getResourceCount = (categoryKey) => {
    return allResourcesRedux[categoryKey]?.length || 0;
  };

  // Combine all resources from Redux, ensuring 'reviews' is present
  const getAllResources = useMemo(() => {
    let all = [];
    skillCategories.forEach((category) => {
      const resources = allResourcesRedux[category.key] || [];
      const resourcesWithCategory = resources.map((resource) => ({
        ...resource,
        category: category.name,
        categoryKey: category.key,
        // Ensure reviews array exists
        reviews: resource.reviews || [],
      }));
      all = [...all, ...resourcesWithCategory];
    });
    return all;
  }, [allResourcesRedux]);

  // Effect to update currentResources based on selection or search
  useEffect(() => {
    const fetchResources = async () => {
      // If neither searching nor a category is selected, clear resources
      if (!searchTerm.trim() && !selectedSkill) {
        setCurrentResources([]);
        return;
      }

      try {
        let url = "/resources";
        const params = new URLSearchParams();
        
        if (selectedSkill) {
          params.append("category", selectedSkill);
        }
        
        if (searchTerm.trim()) {
          params.append("search", searchTerm.trim());
        }

        const response = await apiClient.get(`${url}?${params.toString()}`);
        setCurrentResources(response.data.resources || []);
      } catch (error) {
        console.error("Error fetching resources:", error);
        // Fallback to local filtering if API fails (optional, but good for robustness)
        if (!searchTerm.trim()) {
          if (selectedSkill) {
            const category = skillCategories.find((s) => s.name === selectedSkill);
            if (category) {
              setCurrentResources(allResourcesRedux[category.key] || []);
            }
          }
        } else {
          const searchLower = searchTerm.toLowerCase();
          const filtered = getAllResources.filter(
            (resource) =>
              resource.title?.toLowerCase().includes(searchLower) ||
              resource.description?.toLowerCase().includes(searchLower) ||
              resource.category?.toLowerCase().includes(searchLower)
          );
          setCurrentResources(filtered);
        }
      }
    };

    fetchResources();
  }, [selectedSkill, searchTerm, getAllResources, allResourcesRedux, skillCategories]);


  // Filter categories based on search
  const getFilteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return skillCategories;

    const searchLower = searchTerm.toLowerCase();
    const categoriesWithMatches = new Set();

    getAllResources.forEach((resource) => {
      if (
        resource.title?.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower)
      ) {
        categoriesWithMatches.add(resource.category);
      }
    });

    return skillCategories.filter((cat) => categoriesWithMatches.has(cat.name));
  }, [searchTerm, getAllResources]);

  const handleSearch = (e) => e.preventDefault();
  const clearSearch = () => setSearchTerm("");
  const clearAll = () => {
    setSearchTerm("");
    setSelectedSkill(null);
    setCurrentResources([]); // Clear resources when clearing all
  };
  const isSearching = searchTerm.trim().length > 0;

  // --- Review Submission Logic ---
  const handleReviewInputChange = (resourceId, field, value) => {
    setNewReviewData((prev) => ({
      ...prev,
      [resourceId]: {
        ...(prev[resourceId] || {}),
        [field]: value,
      },
    }));
  };

  const submitReview = async (resourceId) => {
    const reviewData = newReviewData[resourceId];
    if (!reviewData || !reviewData.rating || !reviewData.comment) {
      alert("Please provide a rating and a comment.");
      return;
    }

   

    setLoadingReviews((prev) => ({ ...prev, [resourceId]: true }));

    try {
      const response = await apiClient.post(`/resources/${resourceId}/reviews`, {
        userEmail: userEmail,
        userName: userName,
        rating: parseInt(reviewData.rating, 10),
        comment: reviewData.comment,
      });

      // Update the specific resource in the currentResources state with the new reviews
      setCurrentResources((prevResources) =>
        prevResources.map((res) => {
          if (res.id === resourceId) {
            return {
              ...res,
              reviews: response.data.resource.reviews, // Update with the full list of reviews from the backend
              updated_at: response.data.resource.updated_at // Update timestamp if needed
            };
          }
          return res;
        })
      );

      // Clear the input field for this resource
      setNewReviewData((prev) => {
        const newState = { ...prev };
        delete newState[resourceId];
        return newState;
      });
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setLoadingReviews((prev) => ({ ...prev, [resourceId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* SEARCH BAR */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Skills Library</h1>
              <p className="text-muted-foreground">
                Select a skill category to view resources or discuss ideas with the community.
              </p>
            </div>
            <form onSubmit={handleSearch} className="w-full md:w-80">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resources across all skills..."
                  className="w-full px-4 py-3 pl-10 pr-10 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">🔍</div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
          </div>
          {isSearching && (
            <div className="bg-background border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">🔍 Searching for: "{searchTerm}"</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Found {currentResources.length} resource{currentResources.length !== 1 ? "s" : ""}
                    {selectedSkill && ` in ${selectedSkill}`}
                  </p>
                </div>
                <button onClick={clearAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SKILL CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {getFilteredCategories.map((skill) => {
            const count = getResourceCount(skill.key);
            const isActive = selectedSkill === skill.name;
            const hasSearchMatch = isSearching && count > 0;

            return (
              <div
                key={skill.name}
                onClick={() => {
                  setSelectedSkill(skill.name);
                  setSearchTerm(""); // Clear search when a category is selected
                  // No need to fetch here, useEffect handles currentResources
                }}
                className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : hasSearchMatch
                    ? "bg-background border-blue-200 shadow-sm hover:shadow-md"
                    : "bg-card border-border shadow-sm hover:shadow-md"
                } ${hasSearchMatch ? "ring-2 ring-blue-100" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-semibold text-lg">{skill.name}</h2>
                  {hasSearchMatch && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">🔍</span>
                  )}
                </div>
                <p
                  className={`text-sm mt-2 ${
                    isActive ? "opacity-90" : hasSearchMatch ? "text-blue-700" : "opacity-80"
                  }`}
                >
                  {count} resource{count !== 1 ? "s" : ""}
                </p>
                <Link
                  to={skill.path}
                  className={`block mt-2 text-sm hover:underline ${isActive ? "text-blue-200" : "text-blue-600"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  View Board
                </Link>
              </div>
            );
          })}
        </div>

        {/* FILTERED RESOURCES / SEARCH RESULTS */}
        {(selectedSkill || isSearching) && currentResources.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {isSearching ? `Search Results ${selectedSkill ? `in ${selectedSkill}` : ""}` : `Resources for ${selectedSkill}`}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  {currentResources.length} item{currentResources.length !== 1 ? "s" : ""}
                </span>
                {(selectedSkill || isSearching) && (
                  <button onClick={clearAll} className="text-sm text-muted-foreground hover:text-muted-foreground">
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentResources.map((resource) => (
                <div
                  key={resource.id}
                  className="p-4 rounded-xl border bg-card shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                      {isSearching && resource.category && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                          {resource.category}
                        </span>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{resource.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      {resource.link && (
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          View resource
                        </a>
                      )}
                      {resource.user && (
                        <span className="text-xs text-muted-foreground">
                          By: <Link to={`/profile/${encodeURIComponent(resource.user)}`} className="text-blue-600 hover:underline">{resource.user}</Link>
                        </span>
                      )}
                    </div>
                    {resource.likes !== undefined && resource.likes > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">👍 {resource.likes} likes</span>
                      </div>
                    )}
                  </div>

                  {/* REVIEWS SECTION */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-md font-semibold mb-3">Reviews ({resource.reviews?.length || 0})</h4>
                    {/* Display Existing Reviews */}
                    <div className="max-h-48 overflow-y-auto mb-4 pr-2">
                      {resource.reviews && resource.reviews.length > 0 ? (
                        resource.reviews.map((review) => (
                          <div key={review.reviewId} className="mb-3 pb-3 border-b border-border last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{review.userName}</span>
                              <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center mb-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-lg ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                  ★
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
                      )}
                    </div>

                    {/* Review Submission Form */}
                    {!userEmail && (
                      <p className="text-sm text-red-600 text-center mb-3">Please <Link to="/login" className="font-medium hover:underline">log in</Link> to leave a review.</p>
                    )}

                    {userEmail && (
                      <div className="bg-background p-3 rounded-lg border border-border">
                        <h5 className="font-semibold mb-2 text-sm">Leave a Review</h5>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label htmlFor={`rating-${resource.id}`} className="block text-xs font-medium text-muted-foreground mb-1">Rating</label>
                            <select
                              id={`rating-${resource.id}`}
                              value={newReviewData[resource.id]?.rating || ""}
                              onChange={(e) => handleReviewInputChange(resource.id, 'rating', e.target.value)}
                              className="w-full px-2 py-1.5 border border-border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="" disabled>Select rating</option>
                              {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} star{r > 1 ? 's' : ''}</option>)}
                            </select>
                          </div>
                          {/* Hidden fields for userEmail and userName, populated from auth */}
                          <input type="hidden" value={userEmail} />
                          <input type="hidden" value={userName} />
                          {/* Comment field */}
                          <div className="col-span-2">
                            <label htmlFor={`comment-${resource.id}`} className="block text-xs font-medium text-muted-foreground mb-1">Comment</label>
                            <textarea
                              id={`comment-${resource.id}`}
                              rows="2"
                              value={newReviewData[resource.id]?.comment || ""}
                              onChange={(e) => handleReviewInputChange(resource.id, 'comment', e.target.value)}
                              placeholder="Share your thoughts..."
                              className="w-full px-2 py-1.5 border border-border rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            ></textarea>
                          </div>
                        </div>
                        <button
                          onClick={() => submitReview(resource.id)}
                          disabled={!newReviewData[resource.id]?.rating || !newReviewData[resource.id]?.comment || loadingReviews[resource.id]}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center"
                        >
                          {loadingReviews[resource.id] ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8.071l1.687-1.747z"></path>
                              </svg>
                              Submitting...
                            </>
                          ) : (
                            "Submit Review"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Resources Found / Initial State Message */}
        {(!selectedSkill && !isSearching && currentResources.length === 0) && (
          <div className="bg-card p-6 rounded-xl border shadow-sm text-center">
            <p className="text-muted-foreground">
              Please select a skill category from above or use the search bar to find resources.
            </p>
          </div>
        )}

        {(selectedSkill || isSearching) && currentResources.length === 0 && (
           <div className="bg-card p-6 rounded-xl border shadow-sm">
                <p className="text-muted-foreground mb-4">
                  {isSearching
                    ? `No resources found matching "${searchTerm}"`
                    : `No resources have been shared for ${selectedSkill} yet.`}
                </p>
                <div className="flex gap-3">
                  {selectedSkill && !isSearching && (
                    <Link
                      to={skillCategories.find((s) => s.name === selectedSkill)?.path || "/"}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-block"
                    >
                      Add Resources to {selectedSkill} Board
                    </Link>
                  )}
                  <button
                    onClick={clearAll}
                    className="bg-gray-200 text-muted-foreground px-4 py-2 rounded hover:bg-gray-300"
                  >
                    {isSearching ? "Clear Search" : "Browse All Skills"}
                  </button>
                </div>
              </div>
        )}


        {!selectedSkill && !isSearching && (
          <div className="bg-background p-6 rounded-xl border border-blue-200">
            <p className="text-blue-800 font-medium">💡 Tip: Click a skill card above to see matching resources.</p>
            <p className="text-blue-600 text-sm mt-2">
              Each skill has its own discussion board where you can share and discover resources.
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Use the search bar above to find resources across all skills.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsPage;
