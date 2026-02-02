import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Icon from "../../../components/AppIcon";

const RegistrationForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    interests: [],
    skillLevel: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });

  const skillCategories = [
    { value: "art", label: "Art & Design", icon: "Palette" },
    { value: "baking", label: "Baking & Cooking", icon: "ChefHat" },
    { value: "coding", label: "Coding & Tech", icon: "Code" },
    { value: "sports", label: "Sports & Fitness", icon: "Dumbbell" },
    { value: "music", label: "Music & Audio", icon: "Music" },
    { value: "ai", label: "AI & Automation", icon: "Bot" }
  ];

  const skillLevels = [
    { value: "beginner", label: "Beginner", description: "Just starting out" },
    { value: "intermediate", label: "Intermediate", description: "Some experience" },
    { value: "advanced", label: "Advanced", description: "Highly skilled" },
    { value: "expert", label: "Expert", description: "Professional level" }
  ];

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: "", color: "" };

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    const strengthLevels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Weak", color: "bg-error" },
      { score: 2, label: "Fair", color: "bg-warning" },
      { score: 3, label: "Good", color: "bg-accent" },
      { score: 4, label: "Strong", color: "bg-success" },
      { score: 5, label: "Very Strong", color: "bg-success" }
    ];

    return strengthLevels[score];
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") setPasswordStrength(calculatePasswordStrength(value));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest]
    }));
    if (errors.interests) setErrors((prev) => ({ ...prev, interests: "" }));
  };

  const splitFullName = (fullName) => {
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ").trim() || "Unknown";
    return { firstName, lastName };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email)) newErrors.email = "Please enter a valid email address";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    else if (passwordStrength.score < 2) newErrors.password = "Password is too weak";

    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (formData.interests.length === 0) newErrors.interests = "Please select at least one interest";
    if (!formData.skillLevel) newErrors.skillLevel = "Please select your skill level";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors((prev) => ({ ...prev, submit: "" }));

    try {
      const { firstName, lastName } = splitFullName(formData.fullName);

      const payload = {
        firstName,
        lastName,
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        interests: formData.interests,
        skillLevel: formData.skillLevel
      };

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors((prev) => ({ ...prev, submit: data.message || "Registration failed" }));
        return;
      }

      // ✅ go to login after successful register
      navigate("/login", { state: { email: formData.email } });
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, submit: "Could not connect to the server." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="p-3 rounded-md border border-error bg-error/10 text-error text-sm">
          {errors.submit}
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleInputChange}
          error={errors.fullName}
          required
          disabled={isLoading}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
          disabled={isLoading}
        />

        <div>
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleInputChange}
            error={errors.password}
            required
            disabled={isLoading}
          />
          {formData.password && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground min-w-[80px]">
                  {passwordStrength.label}
                </span>
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Select Your Interests <span className="text-error">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillCategories.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => handleInterestToggle(category.value)}
                disabled={isLoading}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                  formData.interests.includes(category.value)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <span className="text-sm font-medium text-foreground">{category.label}</span>
                {formData.interests.includes(category.value) && (
                  <Icon name="Check" size={18} color="var(--color-primary)" className="ml-auto" />
                )}
              </button>
            ))}
          </div>

          {errors.interests && <p className="mt-2 text-sm text-error">{errors.interests}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Skill Level <span className="text-error">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {skillLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, skillLevel: level.value }));
                  if (errors.skillLevel) setErrors((prev) => ({ ...prev, skillLevel: "" }));
                }}
                disabled={isLoading}
                className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                  formData.skillLevel === level.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted"
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{level.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{level.description}</div>
                </div>
              </button>
            ))}
          </div>

          {errors.skillLevel && <p className="mt-2 text-sm text-error">{errors.skillLevel}</p>}
        </div>
      </div>

      <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};

export default RegistrationForm;
