import React, { useState } from "react";
import Header from "../components/navigation/Header";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    difficulty: "all",
    type: "all",
  });

  const allSkills = [
    { id: 1, name: "React Hooks", category: "web", difficulty: "intermediate", type: "video", description: "Master React hooks with practical examples" },
    { id: 2, name: "Node.js API", category: "web", difficulty: "advanced", type: "course", description: "Build REST APIs with Express" },
    { id: 3, name: "Figma Design", category: "design", difficulty: "beginner", type: "tutorial", description: "UI/UX design fundamentals" },
    { id: 4, name: "Python ML", category: "data", difficulty: "intermediate", type: "course", description: "Machine learning with scikit-learn" },
    { id: 5, name: "Docker Basics", category: "devops", difficulty: "beginner", type: "video", description: "Containerization fundamentals" },
    { id: 6, name: "Tailwind CSS", category: "web", difficulty: "beginner", type: "tutorial", description: "Rapid UI development with utility classes" },
    { id: 7, name: "Database Design", category: "data", difficulty: "intermediate", type: "course", description: "SQL and NoSQL database fundamentals" },
    { id: 8, name: "Git Mastery", category: "devops", difficulty: "beginner", type: "video", description: "Version control with Git and GitHub" },
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "web", label: "Web Development" },
    { value: "design", label: "Design" },
    { value: "data", label: "Data Science" },
    { value: "devops", label: "DevOps" },
  ];

  const difficulties = [
    { value: "all", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  const types = [
    { value: "all", label: "All Types" },
    { value: "video", label: "Video" },
    { value: "course", label: "Course" },
    { value: "tutorial", label: "Tutorial" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = allSkills;

      if (searchQuery.trim()) {
        filtered = filtered.filter(skill =>
          skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (filters.category !== "all") {
        filtered = filtered.filter(skill => skill.category === filters.category);
      }
      if (filters.difficulty !== "all") {
        filtered = filtered.filter(skill => skill.difficulty === filters.difficulty);
      }
      if (filters.type !== "all") {
        filtered = filtered.filter(skill => skill.type === filters.type);
      }

      setResults(filtered);
      setLoading(false);
    }, 500);
  };

  const updateFilter = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: "all", difficulty: "all", type: "all" });
    setSearchQuery("");
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Search Skills
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find learning resources from our library
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, courses, tutorials..."
              className="w-full p-6 text-xl border-2 border-gray-200 rounded-3xl focus:ring-4 focus:ring-blue-500 focus:border-blue-500 shadow-lg transition-all duration-300 pr-12"
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex flex-wrap gap-4 justify-center mb-12 p-6 rounded-2xl border border-gray-200 shadow-xl bg-white bg-opacity-80">
          <select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => updateFilter("difficulty", e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {difficulties.map((diff) => (
              <option key={diff.value} value={diff.value}>{diff.label}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {types.map((typeItem) => (
              <option key={typeItem.value} value={typeItem.value}>{typeItem.label}</option>
            ))}
          </select>

          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all duration-200"
          >
            Clear Filters
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((skill) => (
              <div key={skill.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{skill.name}</h3>
                <p className="text-gray-600 mb-4">{skill.description}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">{skill.category}</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">{skill.difficulty}</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">{skill.type}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <svg className="w-24 h-24 mx-auto mb-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your search terms or filters</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
