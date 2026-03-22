import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const SkillsPage = () => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get ALL resources from Redux - each board slice separately
  const allResources = useSelector((state) => ({
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
    return allResources[categoryKey]?.length || 0;
  };

  // Get all resources across all categories
  const getAllResources = useMemo(() => {
    let all = [];
    skillCategories.forEach((category) => {
      const resources = allResources[category.key] || [];
      const resourcesWithCategory = resources.map((resource) => ({
        ...resource,
        category: category.name,
        categoryKey: category.key,
      }));
      all = [...all, ...resourcesWithCategory];
    });
    return all;
  }, [allResources]);

  // Filter resources based on search or selected category
  const getFilteredResources = useMemo(() => {
    if (!searchTerm.trim()) {
      if (!selectedSkill) return [];
      const category = skillCategories.find((s) => s.name === selectedSkill);
      if (!category) return [];
      return allResources[category.key] || [];
    }

    const searchLower = searchTerm.toLowerCase();
    return getAllResources.filter(
      (resource) =>
        resource.title?.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower) ||
        resource.category?.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, selectedSkill, allResources, getAllResources]);

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
  };
  const isSearching = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* SEARCH BAR */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Skills Library</h1>
              <p className="text-gray-600">
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
                  className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>
          </div>
          {isSearching && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">🔍 Searching for: "{searchTerm}"</p>
                  <p className="text-sm text-blue-600 mt-1">
                    Found {getFilteredResources.length} resource{getFilteredResources.length !== 1 ? "s" : ""}
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
                onClick={() => setSelectedSkill(skill.name)}
                className={`p-4 rounded-xl border-2 transition cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md"
                    : hasSearchMatch
                    ? "bg-blue-50 border-blue-200 shadow-sm hover:shadow-md"
                    : "bg-white border-slate-300 shadow-sm hover:shadow-md"
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
        {(selectedSkill || isSearching) && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {isSearching ? `Search Results ${selectedSkill ? `in ${selectedSkill}` : ""}` : `Resources for ${selectedSkill}`}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-slate-600">
                  {getFilteredResources.length} item{getFilteredResources.length !== 1 ? "s" : ""}
                </span>
                {(selectedSkill || isSearching) && (
                  <button onClick={clearAll} className="text-sm text-slate-600 hover:text-slate-800">
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {getFilteredResources.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border shadow-sm">
                <p className="text-slate-600 mb-4">
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
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                  >
                    {isSearching ? "Clear Search" : "Browse All Skills"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-4 rounded-xl border bg-white shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                      {isSearching && resource.category && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                          {resource.category}
                        </span>
                      )}
                    </div>
                    {resource.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-3">{resource.description}</p>
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
                      {resource.user && <span className="text-xs text-slate-500">By: {resource.user}</span>}
                    </div>
                    {resource.likes !== undefined && resource.likes > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-slate-600">👍 {resource.likes} likes</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedSkill && !isSearching && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
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
