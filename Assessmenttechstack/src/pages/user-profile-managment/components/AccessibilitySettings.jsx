import React from 'react';
import Icon from '../../../components/AppIcon';

const AccessibilitySettings = ({ isEditMode, selectedTheme, onThemeChange }) => {
  const themes = [
    { id: 'default', label: 'Default', icon: 'Sun' },
    { id: 'dark', label: 'Dark Mode', icon: 'Moon' },
    { id: 'high-contrast', label: 'High Contrast', icon: 'Contrast' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 bg-card rounded-xl border border-border">
        <h3 className="font-semibold text-lg text-foreground mb-4">Color Themes</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Adjust the application's color scheme to improve readability and visual comfort.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => onThemeChange(theme.id)}
              className={`flex items-center justify-center p-4 rounded-lg border-2 transition-all text-foreground
                          ${selectedTheme === theme.id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted/50'}`}
            >
              <Icon name={theme.icon} size={20} className="mr-2" />
              <span>{theme.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccessibilitySettings;