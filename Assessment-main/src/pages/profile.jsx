import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useDispatch } from "react-redux";
import { addConversation } from "../store/slices/messagesSlice";

const ProfilePage = () => {
  const { isAuthenticated, userEmail } = useContext(AuthContext);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Completely blank default profile
  const defaultProfile = {
    name: "",
    pronouns: "",
    age: "",
    skills: "",
    qualifications: "",
    image: "",
  };

  // Create a unique key for storage using email
  const getStorageKey = (prefix) => {
    if (userEmail) {
      // Use email as identifier, sanitize it for localStorage key
      const sanitizedEmail = userEmail.replace(/[@.]/g, '_');
      return `${prefix}_${sanitizedEmail}`;
    }
    return `${prefix}_guest`;
  };

  const getProfileKey = () => getStorageKey('profile');
  const getReviewsKey = () => getStorageKey('reviews');

  const [profile, setProfile] = useState(() => {
    if (!isAuthenticated) return defaultProfile;
    
    const key = getProfileKey();
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  // Start in edit mode if profile is completely empty
  const [isEditing, setIsEditing] = useState(() => {
    if (!isAuthenticated) return false;
    
    const key = getProfileKey();
    const saved = localStorage.getItem(key);
    if (!saved) return true;
    
    const parsed = JSON.parse(saved);
    return !parsed.name && !parsed.skills && !parsed.qualifications;
  });

  // Empty reviews array - no default reviews
  const [reviews, setReviews] = useState(() => {
    if (!isAuthenticated) return [];
    
    const key = getReviewsKey();
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({ author: "", content: "", rating: 5 });

  // Message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Save profile/reviews to localStorage
  useEffect(() => {
    if (isAuthenticated && (profile.name || profile.skills || profile.qualifications)) {
      const key = getProfileKey();
      localStorage.setItem(key, JSON.stringify(profile));
    }
  }, [profile, isAuthenticated, userEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      const key = getReviewsKey();
      localStorage.setItem(key, JSON.stringify(reviews));
    }
  }, [reviews, isAuthenticated, userEmail]);

  // Check if profile is empty
  const isProfileEmpty = !profile.name && !profile.skills && !profile.qualifications;

  // Profile handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, image: imageUrl }));
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const saveProfile = () => {
    console.log("Profile saved:", profile);
    setIsEditing(false);
  };

  // Review handlers
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStarClick = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.content.trim()) return;

    const newReview = {
      id: Date.now(),
      author: formData.author.trim(),
      content: formData.content.trim(),
      rating: formData.rating,
      date: new Date().toLocaleDateString(),
    };

    setReviews((prev) => [newReview, ...prev]);
    setFormData({ author: "", content: "", rating: 5 });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
        ★
      </span>
    ));
  };

  // Messaging handlers
  const handleMessageClick = () => {
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const conversation = {
      id: Date.now(),
      participants: ["You", profile.name || "User"],
      messages: [
        {
          sender: "You",
          text: messageText,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    };

    dispatch(addConversation(conversation));
    setMessageText("");
    setShowMessageModal(false);
  };

  // Show loading or login state
  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 text-gray-300 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Please Log In</h2>
          <p className="text-gray-500 mb-6">You need to be logged in to view and edit your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile Controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={saveProfile}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                disabled={!profile.name.trim()}
              >
                Save Profile
              </button>
              <button
                onClick={() => {
                  const key = getProfileKey();
                  const saved = localStorage.getItem(key);
                  if (saved) {
                    setIsEditing(false);
                  } else {
                    setProfile(defaultProfile);
                  }
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                Edit Profile
              </button>
              {!isProfileEmpty && (
                <button
                  onClick={handleMessageClick}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
                >
                  Message
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <section className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-16">
        <div className="relative">
          {profile.image ? (
            <img
              src={profile.image}
              alt="Profile"
              className="w-40 h-40 rounded-full object-cover shadow-lg"
            />
          ) : isEditing ? (
            <div className="w-40 h-40 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-gray-500 text-sm">Upload Photo</span>
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center shadow-lg">
              <span className="text-gray-400 text-lg">No photo</span>
            </div>
          )}
          {isEditing && (
            <>
              <button
                onClick={triggerFileInput}
                className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition shadow-md"
                title="Upload photo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
            </>
          )}
        </div>

        <div className="flex-1 space-y-6">
          {isEditing ? (
            <>
              <div>
                <label htmlFor="name" className="block mb-2 font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full md:w-2/3 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="age" className="block mb-2 font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    type="text"
                    id="age"
                    name="age"
                    value={profile.age}
                    onChange={handleProfileChange}
                    className="w-32 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                    placeholder="e.g. 25"
                  />
                </div>
                <div>
                  <label htmlFor="pronouns" className="block mb-2 font-medium text-gray-700">
                    Pronouns
                  </label>
                  <input
                    type="text"
                    id="pronouns"
                    name="pronouns"
                    value={profile.pronouns}
                    onChange={handleProfileChange}
                    className="w-32 rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                    placeholder="e.g. He/Him"
                  />
                </div>
              </div>
            </>
          ) : isProfileEmpty ? (
            <div className="text-center py-12">
              <div className="mb-8">
                <svg
                  className="w-24 h-24 text-gray-300 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <h2 className="text-3xl font-semibold text-gray-600 mb-4">
                  Create Your Profile
                </h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Share your skills, qualifications, and experience with the community.
                  A complete profile helps others connect with you.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition text-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{profile.name}</h1>
                <div className="space-y-2">
                  {profile.age && (
                    <p className="text-gray-600">
                      <span className="font-medium">Age:</span> {profile.age}
                    </p>
                  )}
                  {profile.pronouns && (
                    <p className="text-gray-600">
                      <span className="font-medium">Pronouns:</span> {profile.pronouns}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Skills Section - Only show in edit mode or if profile has skills */}
          {(isEditing || (!isProfileEmpty && profile.skills)) && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">Skills</h2>
              {isEditing ? (
                <textarea
                  id="skills"
                  name="skills"
                  value={profile.skills}
                  onChange={handleProfileChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  placeholder="List your skills (one per line)"
                />
              ) : profile.skills ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.split("\n").filter(Boolean).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {/* Qualifications Section - Only show in edit mode or if profile has qualifications */}
          {(isEditing || (!isProfileEmpty && profile.qualifications)) && (
            <div>
              <h2 className="text-2xl font-semibold mb-3">Qualifications</h2>
              {isEditing ? (
                <textarea
                  id="qualifications"
                  name="qualifications"
                  value={profile.qualifications}
                  onChange={handleProfileChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                  placeholder="List your qualifications (one per line)"
                />
              ) : profile.qualifications ? (
                <ul className="space-y-2 text-gray-700">
                  {profile.qualifications.split("\n").filter(Boolean).map((qualification, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{qualification}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Reviews - Only show if profile is created */}
      {!isProfileEmpty && (
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Reviews</h2>
            {reviews.length > 0 && (
              <span className="text-gray-600">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="mb-8 space-y-4 max-w-xl bg-gray-50 p-6 rounded-xl">
            <div>
              <label htmlFor="author" className="block mb-2 font-medium text-gray-700">
                Your Name
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="content" className="block mb-2 font-medium text-gray-700">
                Your Review
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={3}
                className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                placeholder="Share your experience with this user..."
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">Rating</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleStarClick(star)}
                    className={`text-2xl ${star <= formData.rating ? "text-yellow-500" : "text-gray-300 hover:text-yellow-300"}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition"
            >
              Submit Review
            </button>
          </form>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-gray-500">No reviews yet. Be the first to review this user!</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {reviews.map((review) => (
                <li key={review.id} className="border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-gray-900 font-semibold text-lg">{review.author}</p>
                    <span className="text-gray-500 text-sm">{review.date}</span>
                  </div>
                  <div className="mb-3">{renderStars(review.rating)}</div>
                  <p className="text-gray-700">{review.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Message {profile.name}</h2>
            <textarea
              placeholder="Write your message here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-4 mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:outline-none"
              rows={4}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="bg-gray-300 text-gray-800 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;