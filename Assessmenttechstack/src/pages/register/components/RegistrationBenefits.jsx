import React from 'react';
import Icon from '../../../components/AppIcon';

const RegistrationBenefits = () => {
  const benefits = [
    {
      icon: 'Users',
      title: 'Join the Community',
      description: 'Connect with thousands of skill enthusiasts and learners worldwide'
    },
    {
      icon: 'BookOpen',
      title: 'Access Resources',
      description: 'Browse and share educational content across multiple skill categories'
    },
    {
      icon: 'TrendingUp',
      title: 'Track Progress',
      description: 'Monitor your learning journey and showcase your achievements'
    },
    {
      icon: 'Award',
      title: 'Earn Recognition',
      description: 'Build your reputation through ratings and community feedback'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
          Why Join Skill Swap Hub?
        </h2>
        <p className="text-muted-foreground">
          Become part of a thriving community dedicated to skill sharing and collaborative learning
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {benefits?.map((benefit, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-200"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name={benefit?.icon} size={24} color="var(--color-primary)" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-foreground mb-1">
                {benefit?.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {benefit?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Icon name="Shield" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-foreground font-medium mb-1">
              Your Privacy Matters
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We use industry-standard encryption to protect your data. Your information is never shared without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationBenefits;