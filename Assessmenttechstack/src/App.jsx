import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/navigation/Header";
import Home from "./pages/Home";
import Skills from "./pages/skills";
import ProfilePage from "./pages/profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact"; 
import ProtectedRoute from "./components/ProtectedRoute";
import AiToolsBoard from "./pages/ai-tools-board";
import ArtBoard from "./pages/art-board";
import CodingBoard from "./pages/coding-board";
import CookingBoard from "./pages/cooking-board";
import DesignBoard from "./pages/design-board";
import JavascriptBoard from "./pages/javascript-board";
import MusicBoard from "./pages/music-board";
import PhotographyBoard from "./pages/photography-board";
import ReactBoard from "./pages/react-board";
import WritingBoard from "./pages/writing-board";
import Messages from "./pages/messages";

function App() {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;