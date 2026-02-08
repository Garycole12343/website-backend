import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell"; // Import NotificationBell
import logo from "../../images/skillsphere-logo.png";

const Header = () => {
  const { isAuthenticated, userEmail, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="w-full border-b bg-white/80 backdrop-blur shadow-sm">
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
            <Link to="/" className="text-slate-600 hover:text-blue-600">
              Home
            </Link>
            <Link to="/skills" className="text-slate-600 hover:text-blue-600">
              Skills
            </Link>
            {isAuthenticated && (
              <Link to="/profile" className="text-slate-600 hover:text-blue-600">
                Profile
              </Link>
            )}
            {isAuthenticated && (
              <Link to="/messages" className="text-slate-600 hover:text-blue-600">
                Messages
              </Link>
            )}
            <Link to="/contact" className="text-slate-600 hover:text-blue-600">
              Contact
            </Link>

            {/* Notification Bell for authenticated users */}
            {isAuthenticated && (
              <div className="flex items-center">
                <NotificationBell />
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {userEmail && (
                  <span className="text-slate-600 text-sm">
                    Welcome, {userEmail.split("@")[0]}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-blue-600">
                  Login
                </Link>
                <Link to="/register" className="text-slate-600 hover:text-blue-600">
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