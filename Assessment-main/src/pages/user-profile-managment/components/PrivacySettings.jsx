import React from 'react';
import Icon from '../../../components/AppIcon';

const PrivacySettings = ({ 
  isEditMode, 
  privacySettings, 
  onPrivacyChange 
}) => {
  const settings = [
    {
      id: 'profileVisibility',
      label: 'Public Profile',
      description: 'Allow others to view your profile and resources',
      icon: 'Eye'
    },
    {
      id: 'showEmail',
      label: 'Show Email',
      description: 'Display your email address on your profile',
      icon: 'Mail'
    },
    {
      id: 'showPhone',
      label: 'Show Phone',
      description: 'Display your phone number on your profile',
      icon: 'Phone'
    },
    {
      id: 'allowMessages',
      label: 'Allow Messages',
      description: 'Let other users send you direct messages',
      icon: 'MessageCircle'
    },
    {
      id: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive updates and notifications via email',
      icon: 'Bell'
    }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
          <span className="text-xl">🔒</span>
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Privacy Settings
        </h2>
      </div>
      <div className="space-y-4">
        {settings?.map((setting) => (
          <div
            key={setting?.id}
            className="flex items-start justify-between p-4 bg-muted rounded-lg"
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Icon name={setting?.icon} size={20} color="var(--color-primary)" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground mb-1">
                  {setting?.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {setting?.description}
                </p>
              </div>
            </div>
            <button
              onClick={() => isEditMode && onPrivacyChange(setting?.id)}
              disabled={!isEditMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                privacySettings?.[setting?.id]
                  ? 'bg-primary' :'bg-input'
              } ${!isEditMode ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  privacySettings?.[setting?.id] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrivacySettings;