import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';


const ResourceCard = ({ resource }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(resource?.isBookmarked || false);

  const handleBookmark = (e) => {
    e?.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = (e) => {
    e?.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: resource?.title,
        text: resource?.description,
        url: window.location?.href
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/resource-details?id=${resource?.id}`);
  };

  const difficultyColors = {
    beginner: 'bg-green-500/10 text-green-600',
    intermediate: 'bg-amber-500/10 text-amber-600',
    advanced: 'bg-red-500/10 text-red-600'
  };

  const typeIcons = {
    video: 'Video',
    article: 'FileText',
    tool: 'Wrench',
    course: 'GraduationCap'
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-elevated transition-all duration-300 cursor-pointer group"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={resource?.thumbnail}
          alt={resource?.thumbnailAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {resource?.isPremium && (
          <div className="absolute top-3 left-3 px-2 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-md flex items-center gap-1">
            <Icon name="Crown" size={12} />
            <span>Premium</span>
          </div>
        )}
        {resource?.isFeatured && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-md flex items-center gap-1">
            <Icon name="Star" size={12} />
            <span>Featured</span>
          </div>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className={`px-2 py-1 text-xs font-medium rounded-md ${difficultyColors?.[resource?.difficulty]}`}>
            {resource?.difficulty}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookmark}
              className="p-2 bg-background/90 backdrop-blur-sm rounded-md hover:bg-background transition-colors duration-200"
            >
              <Icon 
                name={isBookmarked ? 'Bookmark' : 'Bookmark'} 
                size={16}
                color={isBookmarked ? 'var(--color-primary)' : 'currentColor'}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-background/90 backdrop-blur-sm rounded-md hover:bg-background transition-colors duration-200"
            >
              <Icon name="Share2" size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon name={typeIcons?.[resource?.type]} size={16} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground capitalize">{resource?.type}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground font-mono">{resource?.duration}</span>
        </div>

        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {resource?.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {resource?.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={resource?.creatorAvatar}
                alt={resource?.creatorAvatarAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm text-foreground font-medium">{resource?.creatorName}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Icon name="Star" size={16} color="var(--color-accent)" />
              <span className="text-sm font-medium text-foreground font-mono">{resource?.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Icon name="Eye" size={16} />
              <span className="text-sm font-mono">{resource?.views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;