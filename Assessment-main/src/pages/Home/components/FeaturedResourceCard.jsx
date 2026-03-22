import React from 'react';
import { useNavigate } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const FeaturedResourceCard = ({ resource }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/skill-category-browser?resource=${resource?.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left"
    >
      <div className="relative h-48 overflow-hidden bg-muted">
        <Image
          src={resource?.thumbnail}
          alt={resource?.thumbnailAlt}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-3 right-3 px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full flex items-center gap-1.5">
          <Icon name="Star" size={14} color="var(--color-warning)" className="fill-warning" />
          <span className="text-sm font-semibold text-foreground font-mono">{resource?.rating}</span>
        </div>
        
        {resource?.isNew && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
            NEW
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={resource?.categoryIcon} size={14} color="var(--color-primary)" />
          </div>
          <span className="text-xs font-medium text-primary">{resource?.category}</span>
        </div>
        
        <h3 className="text-lg font-heading font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {resource?.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {resource?.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Image
              src={resource?.creatorAvatar}
              alt={resource?.creatorAvatarAlt}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="text-sm font-medium text-foreground">{resource?.creatorName}</span>
          </div>
          
          <div className="flex items-center gap-1 text-muted-foreground">
            <Icon name="Eye" size={16} />
            <span className="text-sm font-mono">{resource?.views}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default FeaturedResourceCard;