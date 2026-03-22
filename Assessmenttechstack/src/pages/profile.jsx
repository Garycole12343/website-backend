import React, { useState, useContext, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useDispatch } from "react-redux";
import { addConversation } from "../store/slices/messagesSlice";
import Button from "../components/Button";

const ProfilePage = () => {
  const { emailOrId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, userEmail } = useContext(AuthContext);
  
  // If emailOrId is provided, check if it matches the current user's email
  const isOwnProfile = !emailOrId || emailOrId === userEmail;
  // Use emailOrId if provided, otherwise fallback to current user's email
  const targetEmail = emailOrId || userEmail;

  const { 
    requestNotificationPermission, 
    hasPermission, 
    testAddNotification,
    socketConnected 
  } = useNotifications();
  const dispatch = useDispatch();

  const defaultProfile = {
    name: "",
    pronouns: "",
    age: "",
    skills: "",
    qualifications: "",
    profileImage: "",
    interests: [],
    skillLevel: "",
    bio: "",
    location: "",
    phone: "",
    website: "",
    linkedin: ""
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
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [formData, setFormData] = useState({ author: "", content: "", rating: 5 });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

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

  // Load profile on mount/login or when emailOrId changes
  useEffect(() => {
    const loadProfile = async () => {
      // If we're trying to view our own profile but not logged in
      if (!targetEmail && !isAuthenticated) {
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      setProfileError("");
      try {
        const res = await fetch(`/api/profile?email=${encodeURIComponent(targetEmail)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        
        // Also fetch the user's top-level interests and skill level
        // For others, use the user object returned from /api/profile
        const userObj = data.user || {};
        
        const loaded = { 
          ...defaultProfile, 
          ...(data.profile || {}),
          interests: userObj.interests || [],
          skillLevel: userObj.skillLevel || ""
        };
        
        setProfile(loaded);
        console.log('✅ Profile loaded:', loaded);

        // Load reviews for the target user
        await loadReviews(targetEmail);
      } catch (err) {
        console.error('Profile load error:', err);
        setProfileError('Failed to load profile');
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, [targetEmail, isAuthenticated]);

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
          userEmail: targetEmail, // The profile owner being reviewed
          author: formData.author,
          content: formData.content,
          rating: formData.rating
        })
      });

      if (!res.ok) throw new Error('Failed to save review');

      const newReview = await res.json();
      setReviews([newReview, ...reviews]);
      setFormData({ author: "", content: "", rating: 5 });
      setShowReviewForm(false); // Hide form after success

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
          <section className="bg-card shadow-lg rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column - Profile image and rating */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover ring-4 ring-border" />
                  ) : (
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xl">
                      {profile.name.charAt(0) || 'U'}
                    </div>
                  )}
                </div>

                {/* Average Rating Display - NEW */}
                {totalReviews > 0 && (
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      {renderAverageStars(averageRating)}
                      <span className="ml-2 font-bold text-lg">{averageRating}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
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
                          <span className="text-muted-foreground text-xs w-8">
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
                <h2 className="text-3xl font-bold mb-2">{profile.name || 'No name set'}</h2>

                <div className="text-muted-foreground mb-6 space-y-2">
                  <div className="flex flex-wrap gap-4">
                    {profile.age && <p><span className="font-medium">Age:</span> {profile.age}</p>}
                    {profile.pronouns && <p><span className="font-medium">Pronouns:</span> {profile.pronouns}</p>}
                    {profile.skillLevel && <p><span className="font-medium text-blue-600 capitalize">{profile.skillLevel}</span></p>}
                  </div>
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Interests</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.interests.map((int) => (
                          <span key={int} className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs capitalize">
                            {int}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

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
              </div>
            </div>
          </section>

          {/* Reviews Section */}
          <section className="bg-card shadow-lg rounded-2xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Reviews ({reviews.length})</h3>
            </div>

            {isReviewsLoading && reviews.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id || review.id} className="border-b pb-6 mb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{review.author}</h4>
                    <span className="text-sm text-muted-foreground">
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
              <div className="text-center py-12 text-muted-foreground">No reviews yet. Be the first!</div>
            )}
          </section>
        </>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowMessageModal(false)}>
          <div className="bg-card p-8 rounded-2xl max-w-md w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
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
