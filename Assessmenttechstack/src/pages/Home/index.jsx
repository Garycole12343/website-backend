import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../images/skillsphere-logo.png"; // adjust the path if needed


function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 py-12 px-4"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Navigation Bar */}
      <nav className="bg-white shadow-lg rounded-xl mb-12 p-4 flex justify-between items-center">
        <img
  src={logo}
  alt="Community Hub Logo"
  className="h-12 md:h-16 w-auto"
/>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Share Resource
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-2xl rounded-xl p-4 w-60 border border-slate-200">
              <div className="grid grid-cols-1 gap-1">
                <Link
                  to="/ai-tools"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-purple-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition"
                >
                  AI Tools
                </Link>
                <Link
                  to="/art"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-pink-700 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition"
                >
                  Art
                </Link>
                <Link
                  to="/coding"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-green-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition"
                >
                  Coding
                </Link>
                <Link
                  to="/cooking"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-orange-700 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition"
                >
                  Cooking
                </Link>
                <Link
                  to="/design"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-blue-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                >
                  Design
                </Link>
                <Link
                  to="/javascript"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition"
                >
                  JavaScript
                </Link>
                <Link
                  to="/music"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-red-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                >
                  Music
                </Link>
                <Link
                  to="/photography"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-teal-700 hover:bg-teal-50 hover:text-teal-600 rounded-lg transition"
                >
                  Photography
                </Link>
                <Link
                  to="/react"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition"
                >
                  React
                </Link>
                <Link
                  to="/writing"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-600 rounded-lg transition"
                >
                  Writing
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 tracking-tight">
          Welcome to the SkillSphere
        </h1>
        <p className="text-xl text-red mb-8 max-w-2xl mx-auto leading-relaxed">
          Share and discover resources across different boards. Connect with fellow creators, learners, and innovators.
        </p>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto mt-20">
        <h2 className="text-4xl font-bold text-center text-red mb-12">Explore Our Community Boards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: "AI Tools", color: "purple", path: "/ai-tools" },
            { name: "Art", color: "pink", path: "/art" },
            { name: "Coding", color: "green", path: "/coding" },
            { name: "Cooking", color: "orange", path: "/cooking" },
            { name: "Design", color: "blue", path: "/design" },
            { name: "JavaScript", color: "yellow", path: "/javascript" },
            { name: "Music", color: "red", path: "/music" },
            { name: "Photography", color: "teal", path: "/photography" },
            { name: "React", color: "indigo", path: "/react" },
            { name: "Writing", color: "gray", path: "/writing" },
          ].map((board) => (
            <Link
              key={board.name}
              to={board.path}
              className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 hover:border-${board.color}-200`}
            >
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg bg-${board.color}-100 flex items-center justify-center mr-4`}>
                  <div className={`w-8 h-8 rounded-lg bg-${board.color}-500 opacity-80`}></div>
                </div>
                <div>
                  <h3 className={`text-xl font-bold text-${board.color}-700`}>{board.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">Explore resources and discussions</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-2xl border border-white/20">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Join Our Growing Community</h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Thousands of creators, developers, artists, and innovators are already sharing knowledge and resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/skills"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg text-lg"
            >
              Explore Skills
            </Link>
            <Link
              to="/register"
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all shadow-lg border border-purple-200 text-lg"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </div>

      {/* Floating Contact Us Button - Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/contact"
          className="group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl hover:shadow-3xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-110"
          title="Contact Us"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          
          {/* Tooltip on hover */}
          <span className="absolute right-16 w-auto px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Contact Us
            <span className="absolute top-1/2 right-[-6px] transform -translate-y-1/2 border-l-8 border-l-gray-900 border-y-8 border-y-transparent"></span>
          </span>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
            <div className="text-gray-700 font-medium">Active Members</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
            <div className="text-gray-700 font-medium">Resources Shared</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
            <div className="text-gray-700 font-medium">Community Discussions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;