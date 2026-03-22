import React from 'react';
import Icon from '../../../components/AppIcon';

const CategoryHeader = ({ category, totalResources, description }) => {
  const categoryIcons = {
    art: 'Palette',
    baking: 'ChefHat',
    coding: 'Code',
    sports: 'Dumbbell',
    music: 'Music',
    ai: 'Bot'
  };

  const categoryColors = {
    art: 'bg-purple-500/10 text-purple-600',
    baking: 'bg-amber-500/10 text-amber-600',
    coding: 'bg-blue-500/10 text-blue-600',
    sports: 'bg-green-500/10 text-green-600',
    music: 'bg-pink-500/10 text-pink-600',
    ai: 'bg-violet-500/10 text-violet-600'
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors?.[category] || 'bg-primary/10 text-primary'}`}>
            <Icon name={categoryIcons?.[category] || 'BookOpen'} size={32} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-2 capitalize">
              {category === 'ai' ? 'AI & Automation' : category} Resources
            </h1>
            <p className="text-base text-muted-foreground mb-3">
              {description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name="BookOpen" size={16} />
              <span className="font-mono">{totalResources?.toLocaleString()} resources available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader;