import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useDispatch } from "react-redux";
import { addConversation } from "../store/slices/messagesSlice";
import Button from "../components/Button";

const ProfilePage = () => {
  const { isAuthenticated, userEmail } = useContext(AuthContext);
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const defaultProfile = {
    name: "",
    pronouns: "",
    age: "",
    skills: "",
    qualifications: "",
    image: ""
  };

  const [profile, setProfile] = useState(defaultProfile);
  const [savedProfile, setSavedProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({ author: "", content: "", rating: 5 });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState("");

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
        const loaded = { ...defaultProfile, ...(data.profile || {}) };
        setProfile(loaded);
        setSavedProfile(loaded);
        console.log('✅ Profile loaded:', loaded);
      } catch (err) {
        console.error('Profile load error:', err);
        setProfileError('Failed to load profile');
      } finally {
        setIsProfileLoading(false);
      }
    };
    loadProfile();
  }, [isAuthenticated, userEmail]);

  // Reviews localStorage
  const getReviewsKey = () => userEmail ? `${userEmail.replace(/[@.]/g, '_')}_reviews` : 'guest_reviews';
  useEffect(() => {
    const saved = localStorage.getItem(getReviewsKey());
    if (saved) setReviews(JSON.parse(saved));
  }, []);
  useEffect(() => {
    if (reviews.length) localStorage.setItem(getReviewsKey(), JSON.stringify(reviews));
  }, [reviews]);

  const isProfileEmpty = !profile.name && !profile.skills && !profile.qualifications;

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
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
        body: JSON.stringify({ email: userEmail, profile })
      });
      if (!res.ok) throw new Error(await res.text());
      setSavedProfile(profile);
      setIsEditing(false);
      setProfileError('');
      console.log('✅ Profile saved');
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

  // Reviews
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.content.trim()) return;
    const newReview = { ...formData, id: Date.now(), date: new Date().toLocaleDateString() };
    setReviews([newReview, ...reviews]);
    setFormData({ author: "", content: "", rating: 5 });
  };

  const renderStars = (rating) => Array(5).fill().map((_, i) => (
    <button key={i} onClick={() => setFormData({ ...formData, rating: i + 1 })} className={i < formData.rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}>
      ★
    </button>
  ));

  if (!isAuthenticated) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center"><h1>Login required</h1></div>;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <div className="space-x-2">
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

      {profileError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {profileError}
        </div>
      )}

      {isProfileLoading ? (
        <div className="text-center py-12">Loading profile...</div>
      ) : (
        <>
          {/* Profile Card */}
          <section className="bg-white shadow-lg rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
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
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <input name="age" value={profile.age} onChange={handleProfileChange} placeholder="Age" className="p-2 border rounded-lg" />
                    <input name="pronouns" value={profile.pronouns} onChange={handleProfileChange} placeholder="Pronouns" className="p-2 border rounded-lg" />
                  </div>
                ) : (
                  <div className="text-gray-600 mb-6 space-y-1">
                    {profile.age && <p>Age: {profile.age}</p>}
                    {profile.pronouns && <p>{profile.pronouns}</p>}
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

          {/* Reviews */}
          <section className="bg-white shadow-lg rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6">Reviews ({reviews.length})</h3>
            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-6 rounded-xl mb-8 space-y-4">
              <input name="author" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} 
                placeholder="Your name" className="w-full p-3 border rounded-lg" required />
              <textarea name="content" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} 
                placeholder="Your review" className="w-full p-3 border rounded-lg" rows={3} required />
              <div className="flex items-center space-x-1">{renderStars()}</div>
              <Button type="submit" variant="default">Add Review</Button>
            </form>
            {reviews.length ? (
              reviews.map((review) => (
                <div key={review.id} className="border-b pb-6 mb-6 last:border-b-0">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{review.author}</h4>
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <div className="mb-2">{Array(review.rating).fill().map((_, i) => <span key={i} className="text-yellow-400">★</span>)}</div>
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
