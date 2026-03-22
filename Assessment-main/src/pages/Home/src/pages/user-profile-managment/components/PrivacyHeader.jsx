import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ProfileHeader = ({ 
  isEditMode, 
  profileData, 
  onImageChange, 
  imagePreview 
}) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-8 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-card shadow-lg">
            <Image
              src={imagePreview || profileData?.profileImage}
              alt={profileData?.profileImageAlt}
              className="w-full h-full object-cover"
            />
          </div>
          {isEditMode && (
            <label className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
              <Icon name="Camera" size={32} color="var(--color-primary)" />
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            {profileData?.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-3">
            <div className="flex items-center gap-2">
              <Icon name="MapPin" size={18} />
              <span className="text-sm">{profileData?.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={18} />
              <span className="text-sm">Joined {profileData?.joinedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Award" size={18} />
              <span className="text-sm">{profileData?.resourceCount} Resources</span>
            </div>
          </div>
          <p className="text-foreground/80 text-base leading-relaxed max-w-2xl">
            {profileData?.bio}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;