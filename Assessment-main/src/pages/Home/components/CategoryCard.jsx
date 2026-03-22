import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(category?.path);
  };

  return (
    <button
      onClick={handleClick}
      className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
          <Icon name={category?.icon} size={28} color="var(--color-primary)" />
        </div>
        
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {category?.name}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {category?.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="BookOpen" size={16} color="var(--color-muted-foreground)" />
            <span className="text-sm font-medium text-muted-foreground font-mono">
              {category?.resourceCount} Web Design
            </span>
          </div>
          
          
          <Icon 
            name="ArrowRight" 
            size={20} 
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" 
          />
        </div>
      </div>
    </button>
  );
};

export default CategoryCard;