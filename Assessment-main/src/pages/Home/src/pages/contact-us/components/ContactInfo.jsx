import React from 'react';
import Icon from '../../../components/AppIcon';

const ContactInfo = () => {
  const contactMethods = [
    {
      id: 1,
      icon: 'Mail',
      title: 'General Inquiries',
      value: 'hello@skillswaphub.com',
      description: 'For general questions and information',
      responseTime: '2-3 business days'
    },
    {
      id: 2,
      icon: 'Headphones',
      title: 'Technical Support',
      value: 'support@skillswaphub.com',
      description: 'For technical issues and platform help',
      responseTime: '24-48 hours'
    },
    {
      id: 3,
      icon: 'Briefcase',
      title: 'Partnerships',
      value: 'partners@skillswaphub.com',
      description: 'For business collaboration opportunities',
      responseTime: '3-5 business days'
    },
    {
      id: 4,
      icon: 'Phone',
      title: 'Phone Support',
      value: '+1 (555) 123-4567',
      description: 'Available Monday-Friday, 9 AM - 6 PM EST',
      responseTime: 'Immediate during business hours'
    }
  ];

  const businessInfo = {
    address: '123 Innovation Street, Tech District, San Francisco, CA 94105, United States',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM EST\nSaturday: 10:00 AM - 4:00 PM EST\nSunday: Closed',
    timezone: 'Eastern Standard Time (EST, UTC-5)'
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
          Contact Methods
        </h2>
        <div className="space-y-4">
          {contactMethods?.map((method) => (
            <div
              key={method?.id}
              className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={method?.icon} size={24} color="var(--color-primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground text-sm mb-1">
                  {method?.title}
                </h3>
                <p className="text-primary text-sm font-medium mb-1">
                  {method?.value}
                </p>
                <p className="text-muted-foreground text-xs mb-2">
                  {method?.description}
                </p>
                <div className="flex items-center gap-1.5">
                  <Icon name="Clock" size={14} color="var(--color-muted-foreground)" />
                  <span className="text-xs text-muted-foreground font-mono">
                    Response: {method?.responseTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-card rounded-lg border border-border p-6">
        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
          Business Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Icon name="MapPin" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground text-sm mb-1">
                Office Address
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {businessInfo?.address}
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-start gap-3">
            <Icon name="Clock" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground text-sm mb-1">
                Business Hours
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                {businessInfo?.hours}
              </p>
            </div>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-start gap-3">
            <Icon name="Globe" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground text-sm mb-1">
                Timezone
              </h3>
              <p className="text-muted-foreground text-sm">
                {businessInfo?.timezone}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg border border-primary/20 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Icon name="Info" size={20} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground text-sm mb-1">
              Quick Response Tips
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              To help us respond faster, please include relevant details such as your account email, specific error messages, or screenshots when applicable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;