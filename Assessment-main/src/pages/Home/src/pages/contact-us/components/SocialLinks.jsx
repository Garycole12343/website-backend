import React from 'react';
import Icon from '../../../components/AppIcon';

const SocialLinks = () => {
  const socialPlatforms = [
    {
      id: 1,
      name: 'Twitter',
      icon: 'Twitter',
      handle: '@SkillSwapHub',
      url: 'https://twitter.com/skillswaphub',
      followers: '12.5K',
      description: 'Latest updates and community highlights',
      color: 'text-[#1DA1F2]'
    },
    {
      id: 2,
      name: 'Facebook',
      icon: 'Facebook',
      handle: 'SkillSwapHub',
      url: 'https://facebook.com/skillswaphub',
      followers: '8.3K',
      description: 'Community discussions and events',
      color: 'text-[#1877F2]'
    },
    {
      id: 3,
      name: 'Instagram',
      icon: 'Instagram',
      handle: '@skillswaphub',
      url: 'https://instagram.com/skillswaphub',
      followers: '15.2K',
      description: 'Visual inspiration and success stories',
      color: 'text-[#E4405F]'
    },
    {
      id: 4,
      name: 'LinkedIn',
      icon: 'Linkedin',
      handle: 'Skill Swap Hub',
      url: 'https://linkedin.com/company/skillswaphub',
      followers: '6.8K',
      description: 'Professional networking and partnerships',
      color: 'text-[#0A66C2]'
    },
    {
      id: 5,
      name: 'YouTube',
      icon: 'Youtube',
      handle: 'SkillSwapHub',
      url: 'https://youtube.com/@skillswaphub',
      followers: '22.1K',
      description: 'Tutorial videos and platform guides',
      color: 'text-[#FF0000]'
    },
    {
      id: 6,
      name: 'Discord',
      icon: 'MessageSquare',
      handle: 'Skill Swap Community',
      url: 'https://discord.gg/skillswaphub',
      followers: '4.5K',
      description: 'Real-time chat and community support',
      color: 'text-[#5865F2]'
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-semibold text-foreground mb-2">
          Connect With Us
        </h2>
        <p className="text-muted-foreground text-sm">
          Join our community on social media for updates, tips, and inspiration
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {socialPlatforms?.map((platform) => (
          <a
            key={platform?.id}
            href={platform?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all group"
          >
            <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Icon name={platform?.icon} size={24} className={platform?.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground text-sm">
                  {platform?.name}
                </h3>
                <Icon name="ExternalLink" size={14} color="var(--color-muted-foreground)" />
              </div>
              <p className="text-xs text-primary font-medium mb-1">
                {platform?.handle}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {platform?.description}
              </p>
              <div className="flex items-center gap-1.5">
                <Icon name="Users" size={12} color="var(--color-muted-foreground)" />
                <span className="text-xs text-muted-foreground font-mono">
                  {platform?.followers} followers
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
        <div className="flex items-start gap-3">
          <Icon name="Bell" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Stay Updated
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Follow us on your preferred platform to receive instant updates about new features, community events, and exclusive content from our skill-sharing community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinks;