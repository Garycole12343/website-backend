import React from 'react';
import Input from '../../../components/ui/Input';

const PersonalInfoForm = ({ 
  isEditMode, 
  formData, 
  errors, 
  onChange 
}) => {
  if (!isEditMode) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <span className="text-xl">👤</span>
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Personal Information
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          type="text"
          name="name"
          value={formData?.name}
          onChange={onChange}
          placeholder="Enter your full name"
          required
          error={errors?.name}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData?.email}
          onChange={onChange}
          placeholder="your.email@example.com"
          required
          error={errors?.email}
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          value={formData?.phone}
          onChange={onChange}
          placeholder="+1 (555) 000-0000"
          error={errors?.phone}
        />

        <Input
          label="Location"
          type="text"
          name="location"
          value={formData?.location}
          onChange={onChange}
          placeholder="City, State, Country"
          required
          error={errors?.location}
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-foreground mb-2">
            Bio <span className="text-destructive">*</span>
          </label>
          <textarea
            name="bio"
            value={formData?.bio}
            onChange={onChange}
            placeholder="Tell us about yourself, your skills, and what you're passionate about..."
            rows={4}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 resize-none"
          />
          {errors?.bio && (
            <p className="text-destructive text-sm mt-1">{errors?.bio}</p>
          )}
        </div>

        <Input
          label="Website/Portfolio"
          type="url"
          name="website"
          value={formData?.website}
          onChange={onChange}
          placeholder="https://yourportfolio.com"
          error={errors?.website}
        />

        <Input
          label="LinkedIn Profile"
          type="url"
          name="linkedin"
          value={formData?.linkedin}
          onChange={onChange}
          placeholder="https://linkedin.com/in/yourprofile"
          error={errors?.linkedin}
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;