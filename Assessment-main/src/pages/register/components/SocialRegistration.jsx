import React from 'react';

import Icon from '../../../components/AppIcon';

const SocialRegistration = () => {
  const socialProviders = [
    {
      name: 'Google',
      icon: 'Mail',
      color: 'hover:bg-[#EA4335]/10 hover:border-[#EA4335]',
      action: () => console.log('Google signup')
    },
    {
      name: 'GitHub',
      icon: 'Github',
      color: 'hover:bg-foreground/10 hover:border-foreground',
      action: () => console.log('GitHub signup')
    },
    {
      name: 'LinkedIn',
      icon: 'Linkedin',
      color: 'hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]',
      action: () => console.log('LinkedIn signup')
    }
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground font-medium">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {socialProviders?.map((provider) => (
          <button
            key={provider?.name}
            type="button"
            onClick={provider?.action}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-border transition-all duration-200 ${provider?.color}`}
          >
            <Icon name={provider?.icon} size={20} />
            <span className="text-sm font-medium text-foreground hidden sm:inline">
              {provider?.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SocialRegistration;