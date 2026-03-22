import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AuthContext } from "../../context/AuthContext";
import { createConversation } from "../../store/slices/messagesSlice";
import logo from "../../images/skillsphere-logo.png"; 
function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { userEmail, isAuthenticated } = useContext(AuthContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!isAuthenticated || !userEmail) return;

      setLoadingMentors(true);
      try {
        const res = await fetch(`/api/users/recommendations?email=${encodeURIComponent(userEmail)}&limit=3`);
        if (res.ok) {
          const data = await res.json();
          
          
          if (data.similar_users?.length === 0) {
             console.log("No mentors found, triggering embedding update for self...");
             await fetch('/api/users/update-embedding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
             });
             
             const retryRes = await fetch(`/api/users/recommendations?email=${encodeURIComponent(userEmail)}&limit=3`);
             if (retryRes.ok) {
                const retryData = await retryRes.json();
                setMentors(retryData.similar_users || []);
             }
          } else {
            setMentors(data.similar_users || []);
          }
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoadingMentors(false);
      }
    };

    fetchRecommendations();
  }, [isAuthenticated, userEmail]);

  const handleConnect = async (mentorEmail, mentorName) => {
    if (!userEmail) return;
    
    try {
      const resultAction = await dispatch(createConversation({ 
        participants: [userEmail, mentorEmail] 
      }));
      
      if (createConversation.fulfilled.match(resultAction)) {
        navigate("/messages", { state: { conversationId: resultAction.payload.id } });
      }
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const boards = [
    {
      name: "AI Tools",
      path: "/ai-tools",
      titleClass: "text-purple-700",
      hoverBorder: "hover:border-purple-200",
      iconBg: "bg-purple-500",
    },
    {
      name: "Art",
      path: "/art",
      titleClass: "text-pink-700",
      hoverBorder: "hover:border-pink-200",
      iconBg: "bg-pink-500",
    },
    {
      name: "Coding",
      path: "/coding",
      titleClass: "text-green-700",
      hoverBorder: "hover:border-green-200",
      iconBg: "bg-green-500",
    },
    {
      name: "Cooking",
      path: "/cooking",
      titleClass: "text-orange-700",
      hoverBorder: "hover:border-orange-200",
      iconBg: "bg-orange-500",
    },
    {
      name: "Design",
      path: "/design",
      titleClass: "text-blue-700",
      hoverBorder: "hover:border-blue-200",
      iconBg: "bg-gray-500",
    },
    {
      name: "JavaScript",
      path: "/javascript",
      titleClass: "text-yellow-700",
      hoverBorder: "hover:border-yellow-200",
      iconBg: "bg-yellow-500",
    },
    {
      name: "Music",
      path: "/music",
      titleClass: "text-red-700",
      hoverBorder: "hover:border-red-200",
      iconBg: "bg-red-500",
    },
    {
      name: "Photography",
      path: "/photography",
      titleClass: "text-teal-700",
      hoverBorder: "hover:border-teal-200",
      iconBg: "bg-teal-500",
    },
    {
      name: "React",
      path: "/react",
      titleClass: "text-indigo-700",
      hoverBorder: "hover:border-indigo-200",
      iconBg: "bg-gray-500",
    },
    {
      name: "Writing",
      path: "/writing",
      titleClass: "text-muted-foreground",
      hoverBorder: "hover:border-border",
      iconBg: "bg-gray-500",
    },
  ];

  return (
    <div
      className="min-h-screen bg-background transition-colors duration-300 py-12 px-4"
    >
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-16">
        <h1 className="text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary tracking-tight">
          Welcome to the SkillSphere
        </h1>
        <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          Share and discover resources across different boards. Connect with fellow creators, learners, and innovators.
        </p>
      </div>

      {/* Suggested Mentors Section - AI Powered */}
      {isAuthenticated && mentors.length > 0 && (
        <div className="max-w-6xl mx-auto mb-20">
          <div className="flex items-center justify-center mb-8 space-x-3">
            <span className="text-2xl">✨</span>
            <h2 className="text-3xl font-bold text-foreground">Suggested For You</h2>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mentors.map((match, index) => {
              const user = match.user;
              const score = Math.round(match.similarity_score * 100);
              
              return (
                <div key={user.id || index} className="bg-card p-6 rounded-xl shadow-lg border border-border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        {user.firstName?.[0] || user.email?.[0] || "U"}
                      </div>
                      <div>
                        <Link to={`/profile/${encodeURIComponent(user.email)}`} className="hover:underline">
                          <h3 className="font-bold text-foreground">{user.firstName} {user.lastName}</h3>
                        </Link>
                        <p className="text-xs text-muted-foreground capitalize">{user.skillLevel || "Member"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-success">{score}%</span>
                      <span className="text-xs text-muted-foreground">Match</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-foreground/80 line-clamp-2">
                      {user.profile?.bio || `Interested in ${Array.isArray(user.interests) ? user.interests.join(", ") : (user.interests || "learning")}...`}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(typeof user.profile?.skills === 'string' 
                        ? user.profile.skills.split('\n') 
                        : (Array.isArray(user.profile?.skills) ? user.profile.skills : [])
                      ).filter(Boolean).slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleConnect(user.email, user.firstName)}
                    className="w-full py-2 bg-card border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Connect</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto mt-10">
        <h2 className="text-4xl font-bold text-center text-foreground mb-12">Explore Our Community Boards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link
              key={board.name}
              to={board.path}
              className={`bg-card rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-border ${board.hoverBorder}`}
            >
              <div className="flex items-center">
                {/* Icon square */}
                <div
                  className={`w-12 h-12 rounded-lg ${board.iconBg} mr-4 shadow-sm ring-1 ring-black/10 flex items-center justify-center`}
                >
                  {/* Inner mark (high contrast) */}
                  <div className="w-6 h-6 rounded-md bg-card/90" />
                </div>

                <div>
                  <h3 className={`text-xl font-bold ${board.titleClass} dark:text-foreground`}>{board.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">Explore resources and discussions</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <div className="bg-card rounded-2xl p-10 shadow-2xl border border-border">
          <h2 className="text-4xl font-bold text-foreground mb-4">Join Our Growing Community</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Thousands of creators, developers, artists, and innovators are already sharing knowledge and resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/skills"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg text-lg"
            >
              Explore Skills
            </Link>
            <Link
              to="/register"
              className="bg-card text-primary px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-all shadow-lg border border-border text-lg"
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
          className="group flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl hover:opacity-90 transition-all duration-300 transform hover:scale-110"
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
          <span className="absolute right-16 w-auto px-3 py-2 bg-popover text-popover-foreground text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-border whitespace-nowrap">
            Contact Us
            <span className="absolute top-1/2 right-[-6px] transform -translate-y-1/2 border-l-8 border-l-border border-y-8 border-y-transparent"></span>
          </span>
        </Link>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto mt-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card rounded-xl p-6 text-center border border-border shadow-md">
            <div className="text-4xl font-bold text-primary mb-2">1000+</div>
            <div className="text-foreground/80 font-medium">Active Members</div>
          </div>
          <div className="bg-card rounded-xl p-6 text-center border border-border shadow-md">
            <div className="text-4xl font-bold text-secondary mb-2">500+</div>
            <div className="text-foreground/80 font-medium">Resources Shared</div>
          </div>
          <div className="bg-card rounded-xl p-6 text-center border border-border shadow-md">
            <div className="text-4xl font-bold text-primary mb-2">50+</div>
            <div className="text-foreground/80 font-medium">Community Discussions</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
