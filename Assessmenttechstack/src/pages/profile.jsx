import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useDispatch } from "react-redux";
import { addConversation } from "../store/slices/messagesSlice";
import Button from "../components/Button";

const ProfilePage = () => {
  const { isAuthenticated, userEmail } = useContext(AuthContext);
  const { 
    requestNotificationPermission, 
    hasPermission, 
    testAddNotification,
    socketConnected 
  } = useNotifications();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const defaultProfile = {
    name: "",
    pronouns: "",
    age: "",
    skills: "",
    qualifications: "",
    image: "",
    interests: [],
    skillLevel: ""
  };

  const skillCategories = [
    { value: "art", label: "Art & Design" },
    { value: "baking", label: "Baking & Cooking" },
    { value: "coding", label: "Coding & Tech" },
    { value: "sports", label: "Sports & Fitness" },
    { value: "music", label: "Music & Audio" },
    { value: "ai", label: "AI & Automation" }
  ];

  const skillLevels = ["beginner", "intermediate", "advanced", "expert"];

  const [profile, setProfile] = useState(defaultProfile);
  const [savedProfile, setSavedProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [formData, setFormData] = useState({ author: "", content: "", rating: 5 });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");

  // Calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Get rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const averageRating = calculateAverageRating();
  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  // Render stars for average display
  const renderAverageStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <span key={i} className="text-yellow-400 text-lg">★</span>;
          } else if (i === fullStars && hasHalfStar) {
            return <span key={i} className="text-yellow-400 text-lg">⯨</span>; // Half star character
          } else {
            return <span key={i} className="text-gray-300 text-lg">★</span>;
          }
        })}
      </div>
    );
  };

  // Load profile on mount/login
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated || !userEmail) {
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      try {
        const res = await fetch(`/api/profile?email=${encodeURIComponent(userEmail)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        // Also fetch the user's top-level interests and skill level
        const userRes = await fetch(`/api/me`);
        const userData = await userRes.json();
        
        const loaded = { 
          ...defaultProfile, 
          ...(data.profile || {}),
          interests: userData.user?.interests || [],
          skillLevel: userData.user?.skillLevel || ""
        };
        
        setProfile(loaded);
        setSavedProfile(loaded);
        console.log('✅ Profile loaded:', loaded);

        // Load reviews after profile is loaded
        await loadReviews(userEmail);
      } catch (err) {
        console.error('Profile load error:', err);
        setProfileError('Failed to load profile');
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, [isAuthenticated, userEmail]);

  // Load reviews from MongoDB
  const loadReviews = async (email) => {
    if (!email) return;

    setIsReviewsLoading(true);
    setReviewsError("");

    try {
      const res = await fetch(`/api/reviews?userEmail=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviewsError('Failed to load reviews');
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const isProfileEmpty = !profile.name && !profile.skills && !profile.qualifications;

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleInterestToggle = (value) => {
    const currentInterests = Array.isArray(profile.interests) ? profile.interests : [];
    const newInterests = currentInterests.includes(value)
      ? currentInterests.filter(i => i !== value)
      : [...currentInterests, value];
    setProfile({ ...profile, interests: newInterests });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setProfile({ ...profile, image: e.target.result });
      reader.readAsDataURL(file);
    }
  };

  const saveProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: userEmail, 
          profile: profile 
        })
      });
      if (!res.ok) throw new Error(await res.text());
      
      // Explicitly trigger embedding update to ensure AI matching is current
      await fetch('/api/users/update-embedding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      setSavedProfile(profile);
      setIsEditing(false);
      setProfileError('');
      console.log('✅ Profile saved and AI embedding updated');
    } catch (err) {
      setProfileError(err.message);
      console.error('Save error:', err);
    }
  };

  const cancelEdit = () => {
    setProfile(savedProfile);
    setIsEditing(false);
    setProfileError('');
  };

  // Reviews - Submit to MongoDB
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.content.trim()) return;

    setIsReviewsLoading(true);
    setReviewsError("");

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: userEmail, // The profile owner
          author: formData.author,
          content: formData.content,
          rating: formData.rating
        })
      });

      if (!res.ok) throw new Error('Failed to save review');

      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setFormData({ author: "", content: "", rating: 5 });

    } catch (err) {
      console.error('Error saving review:', err);
      setReviewsError('Failed to save review');
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const renderStars = (rating) => Array(5).fill().map((_, i) => (
    <button
      key={i}
      onClick={() => setFormData({ ...formData, rating: i + 1 })}
      className={i < formData.rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}
      type="button"
    >
      ★
    </button>
  ));

  if (!isAuthenticated) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><h1>Login required</h1></div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Profile</h1>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              {socketConnected ? 'Real-time Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {!hasPermission && (
            <Button onClick={requestNotificationPermission} variant="outline" size="sm">
              Enable Notifications
            </Button>
          )}
          {isEditing ? (
            <>
              <Button onClick={saveProfile} disabled={!profile.name.trim()} variant="default">
                Save
              </Button>
              <Button onClick={cancelEdit} variant="outline">Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="default">
              {isProfileEmpty ? 'Create Profile' : 'Edit Profile'}
            </Button>
          )}
        </div>
      </div>

      {(profileError || reviewsError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {profileError || reviewsError}
        </div>
      )}

      {isProfileLoading ? (
        <div className="text-center py-12">Loading profile...</div>
      ) : (
        <>
          {/* Profile Card */}
          <section className="bg-white shadow-lg rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column - Profile image and rating */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profile.image ? (
                    <img src={profile.image} alt="Profile" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-gray-100" />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                      {profile.name.charAt(0) || 'U'}
                    </div>
                  )}
                  {isEditing && (
                    <Button onClick={() => fileInputRef.current?.click()} size="sm" className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-lg">
                      📷
                    </Button>
                  )}
                </div>

                {/* Average Rating Display - NEW */}
                {!isEditing && totalReviews > 0 && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {renderAverageStars(averageRating)}
                      <span className="ml-2 font-bold text-lg">{averageRating}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </div>

                    {/* Rating Distribution - Optional */}
                    <div className="mt-3 text-left text-sm w-48">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="w-3">{rating}★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width: `${(ratingDistribution[rating] / totalReviews) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs w-8">
                            {ratingDistribution[rating]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column - Profile info */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="Full Name *"
                    className="w-full text-3xl font-bold mb-4 p-2 border-b-2 border-gray-200 focus:border-blue-500 outline-none bg-transparent"
                  />
                ) : (
                  <h2 className="text-3xl font-bold mb-2">{profile.name || 'No name set'}</h2>
                )}

                {isEditing ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                      <select 
                        name="skillLevel" 
                        value={profile.skillLevel} 
                        onChange={handleProfileChange}
                        className="w-full p-2 border rounded-lg bg-white"
                      >
                        <option value="">Select Level</option>
                        {skillLevels.map(level => (
                          <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Interests (for AI matching)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {skillCategories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => handleInterestToggle(cat.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                              profile.interests.includes(cat.value)
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-200 hover:border-blue-200 text-gray-600"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <input name="age" value={profile.age} onChange={handleProfileChange} placeholder="Age" className="p-2 border rounded-lg" />
                      <input name="pronouns" value={profile.pronouns} onChange={handleProfileChange} placeholder="Pronouns" className="p-2 border rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 mb-6 space-y-2">
                    <div className="flex flex-wrap gap-4">
                      {profile.age && <p><span className="font-medium">Age:</span> {profile.age}</p>}
                      {profile.pronouns && <p><span className="font-medium">Pronouns:</span> {profile.pronouns}</p>}
                      {profile.skillLevel && <p><span className="font-medium text-blue-600 capitalize">{profile.skillLevel}</span></p>}
                    </div>
                    
                    {profile.interests && profile.interests.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.interests.map((int) => (
                            <span key={int} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                              {int}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isEditing ? (
                  <>
                    <textarea name="skills" value={profile.skills} onChange={handleProfileChange} placeholder="Skills (one per line)"
                      className="w-full p-4 border rounded-xl mb-4" rows={3} />
                    <textarea name="qualifications" value={profile.qualifications} onChange={handleProfileChange} placeholder="Qualifications"
                      className="w-full p-4 border rounded-xl" rows={3} />
                  </>
                ) : (
                  <>
                    {profile.skills && (
                      <div className="mb-6">
                        <h3 className="font-semibold mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {profile.skills.split('\n').filter(Boolean).map((skill, i) => (
                            <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.qualifications && (
                      <div>
                        <h3 className="font-semibold mb-2">Qualifications</h3>
                        <ul className="space-y-1">
                          {profile.qualifications.split('\n').filter(Boolean).map((qual, i) => (
                            <li key={i} className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>{qual}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-white shadow-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h3>

            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-xl mb-8 space-y-4">
              <input
                name="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Your name"
                className="w-full p-3 border rounded-lg"
                required
              />
              <textarea
                name="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Your review"
                className="w-full p-3 border rounded-lg"
                rows={3}
                required
              />
              <div className="flex items-center space-x-1">
                {renderStars()}
              </div>
              <Button type="submit" variant="default" disabled={isReviewsLoading}>
                {isReviewsLoading ? 'Saving...' : 'Add Review'}
              </Button>
            </form>

            {isReviewsLoading && reviews.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id || review.id} className="border-b pb-6 mb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{review.author}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt || review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-2">
                    {Array(review.rating).fill().map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p>{review.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">No reviews yet. Be the first!</div>
            )}
          </section>
        </>
      )}

      <input ref={fileInputRef} type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowMessageModal(false)}>
          <div className="bg-white p-8 rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6">Send Message</h3>
            <textarea value={messageText} onChange={e => setMessageText(e.target.value)}
              placeholder="Type your message..." className="w-full p-4 border rounded-xl mb-6 resize-none" rows={5} />
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowMessageModal(false)}>Cancel</Button>
              <Button variant="secondary" onClick={() => {
                if (messageText.trim()) {
                  dispatch(addConversation({
                    id: Date.now(),
                    participants: [userEmail, profile.name || 'User'],
                    messages: [{ sender: userEmail, text: messageText, timestamp: new Date().toLocaleString() }]
                  }));
                  setMessageText('');
                  setShowMessageModal(false);
                }
              }} disabled={!messageText.trim()}>
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;