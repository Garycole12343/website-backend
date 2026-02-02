import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    interests: [],
    skillLevel: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  const skillCategories = [
    { value: 'art', label: 'Art & Design', icon: 'Palette' },
    { value: 'baking', label: 'Baking & Cooking', icon: 'ChefHat' },
    { value: 'coding', label: 'Coding & Tech', icon: 'Code' },
    { value: 'sports', label: 'Sports & Fitness', icon: 'Dumbbell' },
    { value: 'music', label: 'Music & Audio', icon: 'Music' },
    { value: 'ai', label: 'AI & Automation', icon: 'Bot' }
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Highly skilled' },
    { value: 'expert', label: 'Expert', description: 'Professional level' }
  ];

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: '' };

    if (password?.length >= 8) score++;
    if (password?.length >= 12) score++;
    if (/[a-z]/?.test(password) && /[A-Z]/?.test(password)) score++;
    if (/\d/?.test(password)) score++;
    if (/[^a-zA-Z0-9]/?.test(password)) score++;

    const strengthLevels = [
      { score: 0, label: '', color: '' },
      { score: 1, label: 'Weak', color: 'bg-error' },
      { score: 2, label: 'Fair', color: 'bg-warning' },
      { score: 3, label: 'Good', color: 'bg-accent' },
      { score: 4, label: 'Strong', color: 'bg-success' },
      { score: 5, label: 'Very Strong', color: 'bg-success' }
    ];

    return strengthLevels?.[score];
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev?.interests?.includes(interest)
        ? prev?.interests?.filter(i => i !== interest)
        : [...prev?.interests, interest]
    }));

    if (errors?.interests) {
      setErrors(prev => ({
        ...prev,
        interests: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.trim()?.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength?.score < 2) {
      newErrors.password = 'Password is too weak. Add uppercase, numbers, or special characters';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData?.interests?.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }

    if (!formData?.skillLevel) {
      newErrors.skillLevel = 'Please select your skill level';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service';
    }

    if (!formData?.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'You must agree to the Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const mockToken = `token_${Date.now()}_${Math.random()?.toString(36)?.substr(2, 9)}`;
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('userEmail', formData?.email);
      localStorage.setItem('userName', formData?.fullName);
      
      setIsLoading(false);
      navigate('/home-dashboard');
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData?.fullName}
          onChange={handleInputChange}
          error={errors?.fullName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
        />

        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData?.password}
            onChange={handleInputChange}
            error={errors?.password}
            required
          />
          {formData?.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${passwordStrength?.color}`}
                    style={{ width: `${(passwordStrength?.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground min-w-[80px]">
                  {passwordStrength?.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Use 8+ characters with uppercase, lowercase, numbers, and symbols
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData?.confirmPassword}
          onChange={handleInputChange}
          error={errors?.confirmPassword}
          required
        />
      </div>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Select Your Interests <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillCategories?.map((category) => (
              <button
                key={category?.value}
                type="button"
                onClick={() => handleInterestToggle(category?.value)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData?.interests?.includes(category?.value)
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  formData?.interests?.includes(category?.value)
                    ? 'bg-primary/20' :'bg-muted'
                }`}>
                  <Icon 
                    name={category?.icon} 
                    size={20} 
                    color={formData?.interests?.includes(category?.value) ? 'var(--color-primary)' : 'currentColor'}
                  />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {category?.label}
                </span>
                {formData?.interests?.includes(category?.value) && (
                  <Icon name="Check" size={18} color="var(--color-primary)" className="ml-auto" />
                )}
              </button>
            ))}
          </div>
          {errors?.interests && (
            <p className="mt-2 text-sm text-error">{errors?.interests}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Skill Level <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillLevels?.map((level) => (
              <button
                key={level?.value}
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, skillLevel: level?.value }));
                  if (errors?.skillLevel) {
                    setErrors(prev => ({ ...prev, skillLevel: '' }));
                  }
                }}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData?.skillLevel === level?.value
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  formData?.skillLevel === level?.value
                    ? 'border-primary bg-primary' :'border-border'
                }`}>
                  {formData?.skillLevel === level?.value && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {level?.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {level?.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors?.skillLevel && (
            <p className="mt-2 text-sm text-error">{errors?.skillLevel}</p>
          )}
        </div>
      </div>
      <div className="space-y-3 pt-2">
        <Checkbox
          label={
            <span className="text-sm">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline font-medium">
                Terms of Service
              </a>
            </span>
          }
          name="agreeToTerms"
          checked={formData?.agreeToTerms}
          onChange={handleInputChange}
          error={errors?.agreeToTerms}
          required
        />

        <Checkbox
          label={
            <span className="text-sm">
              I agree to the{' '}
              <a href="/privacy" className="text-primary hover:underline font-medium">
                Privacy Policy
              </a>
            </span>
          }
          name="agreeToPrivacy"
          checked={formData?.agreeToPrivacy}
          onChange={handleInputChange}
          error={errors?.agreeToPrivacy}
          required
        />
      </div>
      <Button
        type="submit"
        variant="default"
        size="lg"
        fullWidth
        loading={isLoading}
        iconName="UserPlus"
        iconPosition="left"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegistrationForm;