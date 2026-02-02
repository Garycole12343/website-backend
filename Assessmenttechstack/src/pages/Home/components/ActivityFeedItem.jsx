import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const ActivityFeedItem = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity?.type) {
      case 'resource':
        return { name: 'BookOpen', color: 'var(--color-primary)' };
      case 'achievement':
        return { name: 'Award', color: 'var(--color-warning)' };
      case 'comment':
        return { name: 'MessageCircle', color: 'var(--color-secondary)' };
      case 'rating':
        return { name: 'Star', color: 'var(--color-warning)' };
      default:
        return { name: 'Activity', color: 'var(--color-muted-foreground)' };
    }
  };

  const icon = getActivityIcon();

  return (
    <div className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors duration-200">
      <div className="flex-shrink-0">
        <div className="relative">
          <Image
            src={activity?.userAvatar}
            alt={activity?.userAvatarAlt}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-background rounded-full flex items-center justify-center border-2 border-background">
            <Icon name={icon?.name} size={12} color={icon?.color} />
          </div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground mb-1">
          <span className="font-semibold">{activity?.userName}</span>
          {' '}
          <span className="text-muted-foreground">{activity?.action}</span>
        </p>
        
        {activity?.content && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {activity?.content}
          </p>
        )}
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="font-mono">{activity?.timestamp}</span>
          
          {activity?.category && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Icon name={activity?.categoryIcon} size={12} />
                {activity?.category}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedItem;