import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ProfileHeader from './components/ProfileHeader';
import PersonalInfoForm from './components/PersonalInfoForm';
import SkillCategoriesSection from './components/SkillCategoriesSection';
import SkillShowcase from './components/SkillShowcase';
import PrivacySettings from './components/PrivacySettings';
import ResourcesSummary from './components/ResourcesSummary';

const UserProfileManagement = () => {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const [profileData] = useState({
    name: "Sarah Mitchell",
    email: "sarah.mitchell@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA, USA",
    bio: "Passionate educator and creative professional with 8+ years of experience in digital design and web development. I love sharing knowledge and helping others grow their skills through hands-on learning and collaborative projects.",
    website: "https://sarahmitchell.design",
    linkedin: "https://linkedin.com/in/sarahmitchell",
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_159d2c8f8-1763294679735.png",
    profileImageAlt: "Professional headshot of woman with long brown hair wearing white blouse smiling warmly at camera",
    joinedDate: "March 2023",
    resourceCount: 24
  });

  const [formData, setFormData] = useState({
    name: profileData?.name,
    email: profileData?.email,
    phone: profileData?.phone,
    location: profileData?.location,
    bio: profileData?.bio,
    website: profileData?.website,
    linkedin: profileData?.linkedin
  });

  const [errors, setErrors] = useState({});

  const [selectedCategories, setSelectedCategories] = useState([
  'art', 'coding', 'music']
  );

  const [skills, setSkills] = useState([
  {
    name: "UI/UX Design",
    level: "expert",
    portfolioLink: "https://sarahmitchell.design/portfolio",
    description: "10+ years of experience creating user-centered designs for web and mobile applications. Specialized in design systems, prototyping, and user research methodologies."
  },
  {
    name: "React Development",
    level: "advanced",
    portfolioLink: "https://github.com/sarahmitchell",
    description: "Building modern web applications with React, Redux, and TypeScript. Experienced in component architecture, state management, and performance optimization."
  },
  {
    name: "Digital Illustration",
    level: "intermediate",
    portfolioLink: "https://behance.net/sarahmitchell",
    description: "Creating digital artwork and illustrations using Procreate and Adobe Creative Suite. Focus on character design and editorial illustrations."
  }]
  );

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    emailNotifications: true
  });

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
  },
  {
    id: 2,
    title: "Mastering Figma: Design System Workshop",
    categoryIcon: "Palette",
    categoryColor: "bg-pink-100 text-pink-600",
    views: 892,
    comments: 32,
    rating: 4.9,
    postedDate: "1 week ago"
  },
  {
    id: 3,
    title: "Music Production Basics with Ableton Live",
    categoryIcon: "Music",
    categoryColor: "bg-purple-100 text-purple-600",
    views: 567,
    comments: 18,
    rating: 4.7,
    postedDate: "2 weeks ago"
  }];


  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

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

  const handleCategoryChange = (categoryId, checked) => {
    setSelectedCategories((prev) => {
      if (checked) {
        return [...prev, categoryId];
      } else {
        return prev?.filter((id) => id !== categoryId);
      }
    });
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
    setSkills((prev) => prev?.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index, field, value) => {
    setSkills((prev) => prev?.map((skill, i) =>
    i === index ? { ...skill, [field]: value } : skill
    ));
  };

  const handlePrivacyChange = (settingId) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [settingId]: !prev?.[settingId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData?.location?.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData?.bio?.trim()) {
      newErrors.bio = 'Bio is required';
    } else if (formData?.bio?.trim()?.length < 50) {
      newErrors.bio = 'Bio must be at least 50 characters';
    }

    if (formData?.website && !/^https?:\/\/.+/?.test(formData?.website)) {
      newErrors.website = 'Invalid URL format';
    }

    if (formData?.linkedin && !/^https?:\/\/.+/?.test(formData?.linkedin)) {
      newErrors.linkedin = 'Invalid URL format';
    }

    if (selectedCategories?.length === 0) {
      newErrors.categories = 'Please select at least one skill category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      console.log('Saving profile:', {
        formData,
        selectedCategories,
        skills,
        privacySettings,
        imagePreview
      });

      setIsEditMode(false);
      setShowSuccessMessage(true);

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
              Profile Management
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information, skills, and privacy settings
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditMode ?
            <>
                <Button
                variant="outline"
                onClick={handleCancel}
                iconName="X"
                iconPosition="left">

                  Cancel
                </Button>
                <Button
                variant="default"
                onClick={handleSave}
                iconName="Save"
                iconPosition="left">

                  Save Changes
                </Button>
              </> :

            <Button
              variant="default"
              onClick={() => setIsEditMode(true)}
              iconName="Edit"
              iconPosition="left">

                Edit Profile
              </Button>
            }
          </div>
        </div>

        {Object.keys(errors)?.length > 0 &&
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={24} color="var(--color-destructive)" />
              <div className="flex-1">
                <h3 className="font-semibold text-destructive mb-2">Please fix the following errors:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-destructive/80">
                  {Object.values(errors)?.map((error, index) =>
                <li key={index}>{error}</li>
                )}
                </ul>
              </div>
            </div>
          </div>
        }

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
          isEditMode={isEditMode}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange} />


        <SkillShowcase
          isEditMode={isEditMode}
          skills={skills}
          onSkillAdd={handleSkillAdd}
          onSkillRemove={handleSkillRemove}
          onSkillChange={handleSkillChange} />


        <PrivacySettings
          isEditMode={isEditMode}
          privacySettings={privacySettings}
          onPrivacyChange={handlePrivacyChange} />


        <ResourcesSummary
          resourceCount={profileData?.resourceCount}
          recentResources={recentResources} />


        {isEditMode &&
        <div className="mt-6 flex items-center justify-end gap-3 p-6 bg-card rounded-xl border border-border">
            <Button
            variant="outline"
            onClick={handleCancel}
            iconName="X"
            iconPosition="left">

              Cancel
            </Button>
            <Button
            variant="default"
            onClick={handleSave}
            iconName="Save"
            iconPosition="left">

              Save Changes
            </Button>
          </div>
        }
      </main>
    </div>);

};

export default UserProfileManagement;