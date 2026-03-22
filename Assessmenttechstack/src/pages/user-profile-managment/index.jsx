import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Button from '../../components/Button';
import Icon from '../../components/AppIcon';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoForm from './components/PersonalInfoForm';
import SkillCategoriesSection from './components/SkillCategoriesSection';
import SkillShowcase from './components/SkillShowcase';
import PrivacySettings from './components/PrivacySettings';
import ResourcesSummary from './components/ResourcesSummary';
import DangerZone from './components/DangerZone';
import SecuritySettings from './components/SecuritySettings';
import AccessibilitySettings from './components/AccessibilitySettings';
import { useTheme } from '../../context/ThemeContext';

const UserProfileManagement = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, updateUser } = useContext(AuthContext);
  const { theme: globalTheme, setTheme: setGlobalTheme } = useTheme();
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [selectedTheme, setSelectedTheme] = useState(
    user?.profile?.accessibility?.theme || globalTheme
  );

  const [profileData] = useState({
    name: user?.profile?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
    bio: user?.profile?.bio || "No bio yet.",
    website: user?.profile?.website || "",
    linkedin: user?.profile?.linkedin || "",
    profileImage: user?.profile?.profileImage || "",
    profileImageAlt: "User profile image",
    joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "Recently",
    resourceCount: user?.resourceCount || 0
  });

  const [formData, setFormData] = useState({
    name: user?.profile?.name || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
    bio: user?.profile?.bio || "No bio yet.",
    website: user?.profile?.website || "",
    linkedin: user?.profile?.linkedin || ""
  });

  const [errors, setErrors] = useState({});

  const [selectedCategories, setSelectedCategories] = useState(
    user?.interests || ['art', 'coding', 'music']
  );

  const [skills, setSkills] = useState(
    user?.profile?.skills_detail || [
      {
        name: "UI/UX Design",
        level: "expert",
        portfolioLink: "https://sarahmitchell.design/portfolio",
        description: "10+ years of experience creating user-centered designs for web and mobile applications."
      },
      {
        name: "React Development",
        level: "advanced",
        portfolioLink: "https://github.com/sarahmitchell",
        description: "Building modern web applications with React, Redux, and TypeScript."
      }
    ]
  );

  const [privacySettings, setPrivacySettings] = useState(
    user?.profile?.privacySettings || {
      profileVisibility: true,
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      emailNotifications: true
    }
  );

  const recentResources = [
  {
    id: 1,
    title: "Complete React Hooks Guide for Beginners",
    categoryIcon: "Code",
    categoryColor: "bg-blue-100 text-blue-600",
    views: 1243,
    comments: 45,
    rating: 4.8,
    postedDate: "2 days ago"
  }];

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      if (file?.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: 'Image size must be less than 5MB'
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader?.result);
      };
      reader?.readAsDataURL(file);
    }
  };

  const persistProfilePart = async (updatedPart) => {
    if (!user) return;
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          profile: {
            ...user?.profile,
            ...updatedPart
          }
        })
      });

      if (response.ok) {
        updateUser({
          ...user,
          profile: {
            ...user?.profile,
            ...updatedPart
          }
        });
        return true;
      }
    } catch (err) {
      console.error("Failed to persist profile update:", err);
    }
    return false;
  };

  const handleCategoryChange = (categoryId, checked) => {
    const newCategories = checked
      ? [...selectedCategories, categoryId]
      : selectedCategories?.filter((id) => id !== categoryId);
    
    setSelectedCategories(newCategories);
    persistProfilePart({ interests: newCategories });
  };

  const handleSkillAdd = () => {
    setSkills((prev) => [...prev, {
      name: '',
      level: 'beginner',
      portfolioLink: '',
      description: ''
    }]);
  };

  const handleSkillRemove = (index) => {
    const newSkills = skills?.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  const handleSkillChange = (index, field, value) => {
    setSkills((prev) => prev?.map((skill, i) =>
    i === index ? { ...skill, [field]: value } : skill
    ));
  };

  const handleSkillSave = async () => {
    await persistProfilePart({ skills_detail: skills });
  };

  const handlePrivacyChange = (settingId) => {
    const newPrivacySettings = {
      ...privacySettings,
      [settingId]: !privacySettings?.[settingId]
    };
    setPrivacySettings(newPrivacySettings);
    persistProfilePart({ privacySettings: newPrivacySettings });
  };

  const handleThemeChange = async (newTheme) => {
    setSelectedTheme(newTheme);
    setGlobalTheme(newTheme);
    
    // Persist immediately to profile if user is logged in
    if (user) {
      try {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user?.email,
            profile: {
              ...user?.profile,
              accessibility: {
                ...user?.profile?.accessibility,
                theme: newTheme
              }
            }
          })
        });
        
        // Update local context as well
        updateUser({
          ...user,
          profile: {
            ...user?.profile,
            accessibility: {
              ...user?.profile?.accessibility,
              theme: newTheme
            }
          }
        });
      } catch (err) {
        console.error("Failed to persist theme choice:", err);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.name?.trim()) newErrors.name = 'Name is required';
    if (!formData?.email?.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) newErrors.email = 'Invalid email format';
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

const handleSave = async () => {
  if (validateForm()) {
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          profile: {
            ...user?.profile,
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            website: formData.website,
            linkedin: formData.linkedin,
            profileImage: imagePreview || user?.profile?.profileImage,
            interests: selectedCategories,
            skills_detail: skills,
            privacySettings: privacySettings,
            accessibility: {
              theme: selectedTheme
            }
          }
        })
      });

      if (response.ok) {
        const updatedProfileData = {
          ...user,
          interests: selectedCategories,
          profile: {
            ...user?.profile,
            name: formData.name,
            phone: formData.phone,
            location: formData.location,
            bio: formData.bio,
            website: formData.website,
            linkedin: formData.linkedin,
            profileImage: imagePreview || user?.profile?.profileImage,
            interests: selectedCategories,
            skills_detail: skills,
            privacySettings: privacySettings,
            accessibility: {
              theme: selectedTheme
            }
          }
        };
        updateUser(updatedProfileData);
        setIsEditMode(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const data = await response.json();
        setErrors({ submit: data.message || "Failed to update profile" });
      }
    } catch (err) {
      console.error("Save error:", err);
      setErrors({ submit: "Could not connect to the server." });
    }
  }
};

  const handleCancel = () => {
    setFormData({
      name: profileData?.name,
      email: profileData?.email,
      phone: profileData?.phone,
      location: profileData?.location,
      bio: profileData?.bio,
      website: profileData?.website,
      linkedin: profileData?.linkedin
    });
    setImagePreview(null);
    setErrors({});
    setIsEditMode(false);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.")) return;
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        logout();
        navigate('/register');
      } else {
        const data = await response.json();
        setErrors({ delete: data.message || 'Failed to delete account' });
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setErrors({ delete: 'Could not connect to server' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSuccessMessage &&
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg flex items-center gap-3 animate-fade-in">
            <Icon name="CheckCircle" size={24} color="var(--color-success)" />
            <div className="flex-1">
              <h3 className="font-semibold text-success">Profile Updated Successfully!</h3>
              <p className="text-sm text-success/80">Your changes have been saved.</p>
            </div>
          </div>
        }

        {errors.delete &&
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-3">
            <Icon name="AlertCircle" size={24} color="var(--color-destructive)" />
            <p className="text-destructive font-medium">{errors.delete}</p>
          </div>
        }

        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col gap-2">
            <Link to="/profile" className="text-sm text-primary hover:underline flex items-center gap-1 mb-2">
              <Icon name="ArrowLeft" size={16} />
              Back to Profile
            </Link>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information, skills, security, and privacy settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode ?
            <>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button variant="default" onClick={handleSave}>Save Changes</Button>
              </> :
            <Button variant="default" onClick={() => setIsEditMode(true)}>Edit Profile</Button>
            }
          </div>
        </div>

        <ProfileHeader
          isEditMode={isEditMode}
          profileData={profileData}
          onImageChange={handleImageChange}
          imagePreview={imagePreview} />

        <PersonalInfoForm
          isEditMode={isEditMode}
          formData={formData}
          errors={errors}
          onChange={handleInputChange} />

        <SkillCategoriesSection
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange} />

        <SkillShowcase
          skills={skills}
          onSkillAdd={handleSkillAdd}
          onSkillRemove={handleSkillRemove}
          onSkillChange={handleSkillChange}
          onSave={handleSkillSave} />

        <SecuritySettings />

        <PrivacySettings
          privacySettings={privacySettings}
          onPrivacyChange={handlePrivacyChange} />

        <ResourcesSummary
          resourceCount={profileData?.resourceCount}
          recentResources={recentResources} />

        <AccessibilitySettings
          selectedTheme={selectedTheme}
          onThemeChange={handleThemeChange} />

        <DangerZone onDeleteAccount={handleDeleteAccount} />

        {isEditMode &&
        <div className="mt-6 flex items-center justify-end gap-3 p-6 bg-card rounded-xl border border-border">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button variant="default" onClick={handleSave}>Save Changes</Button>
          </div>
        }
      </main>
    </div>);
};

export default UserProfileManagement;
