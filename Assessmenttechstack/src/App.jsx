import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Header from "./components/navigation/Header";
import Home from "./pages/Home";
import Skills from "./pages/skills";
import ProfilePage from "./pages/profile";
import Login from "./pages/login";
import Register from "./pages/Register.jsx";
import Contact from "./pages/contact.jsx"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AiToolsBoard from "./pages/ai-tools-board/index.jsx";
import ArtBoard from "./pages/art-board/index.jsx";
import CodingBoard from "./pages/coding-board/index.jsx";
import CookingBoard from "./pages/cooking-board/index.jsx";
import DesignBoard from "./pages/design-board/index.jsx";
import JavascriptBoard from "./pages/javascript-board/index.jsx";
import MusicBoard from "./pages/music-board/index.jsx";
import PhotographyBoard from "./pages/photography-board/index.jsx";
import ReactBoard from "./pages/react-board/index.jsx";
import WritingBoard from "./pages/writing-board/index.jsx";
import Messages from "./pages/messages";

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Header />
            <main className="py-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/contact" element={<Contact />} /> 
                <Route path="/ai-tools" element={<AiToolsBoard />} />
                <Route path="/art" element={<ArtBoard />} />
                <Route path="/coding" element={<CodingBoard />} />
                <Route path="/cooking" element={<CookingBoard />} />
                <Route path="/design" element={<DesignBoard />} />
                <Route path="/javascript" element={<JavascriptBoard />} />
                <Route path="/music" element={<MusicBoard />} />
                <Route path="/photography" element={<PhotographyBoard />} />
                <Route path="/react" element={<ReactBoard />} />
                <Route path="/writing" element={<WritingBoard />} />
                
                {/* Protected Routes - only accessible when logged in */}
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;