import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import logo from "../../images/skillsphere-logo.png";
import Icon from "../../components/AppIcon";
import ThemeToggle from "../ThemeToggle";

const Header = () => {
  const { isAuthenticated, userEmail, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const boards = [
    { name: "AI Tools", path: "/ai-tools", color: "text-purple-700" },
    { name: "Art", path: "/art", color: "text-pink-700" },
    { name: "Coding", path: "/coding", color: "text-green-700" },
    { name: "Cooking", path: "/cooking", color: "text-orange-700" },
    { name: "Design", path: "/design", color: "text-blue-700" },
    { name: "JavaScript", path: "/javascript", color: "text-yellow-700" },
    { name: "Music", path: "/music", color: "text-red-700" },
    { name: "Photography", path: "/photography", color: "text-teal-700" },
    { name: "React", path: "/react", color: "text-indigo-700" },
    { name: "Writing", path: "/writing", color: "text-gray-700" },
  ];

  return (
    <header className="w-full border-b bg-card/80 backdrop-blur shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <nav className="w-full">
        <div className="max-w-full mx-auto px-6 flex items-center justify-between py-3">
          {/* Logo */}
          <Link to="/">
            <img
              src={logo}
              alt="Skill Swap Hub Logo"
              className="h-10 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Navigation links */}
          <div className="flex gap-4 md:gap-6 text-sm md:text-base items-center">
            <Link to="/" className="text-foreground/80 hover:text-primary font-medium">
              Home
            </Link>
            <Link to="/skills" className="text-foreground/80 hover:text-primary font-medium">
              Skills
            </Link>
            
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md text-sm"
                >
                  Share Resource
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 bg-white shadow-2xl rounded-xl p-2 w-48 border border-slate-200 grid grid-cols-1 gap-1 z-50">
                    {boards.map((board) => (
                      <Link
                        key={board.name}
                        to={board.path}
                        onClick={() => setMenuOpen(false)}
                        className={`block px-3 py-2 ${board.color} hover:bg-slate-50 rounded-lg transition text-sm font-medium`}
                      >
                        {board.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && (
              <Link to="/profile" className="text-foreground/80 hover:text-primary font-medium">
                Profile
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/messages" className="text-foreground/80 hover:text-primary font-medium">
                Messages
              </Link>
            )}
            <Link to="/about" className="text-foreground/80 hover:text-primary font-medium">
              About Us
            </Link>
            <Link to="/contact" className="text-foreground/80 hover:text-primary font-medium">
              Contact
            </Link>

            {/* Notification Bell for authenticated users */}
            {isAuthenticated && (
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <NotificationBell />
                <Link to="/settings" title="Settings" className="text-foreground/80 hover:text-primary transition-colors">
                  <Icon name="Settings" size={24} />
                </Link>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-slate-600 text-sm hidden md:inline">
                  Welcome, {user?.profile?.name || 
                          `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 
                          userEmail?.split("@")[0] || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-foreground/80 hover:text-primary font-medium">
                  Login
                </Link>
                <Link to="/register" className="text-foreground/80 hover:text-primary font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
