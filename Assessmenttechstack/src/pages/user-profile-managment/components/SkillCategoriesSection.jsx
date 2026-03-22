import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox, CheckboxGroup } from '../../../components/Checkbox';

const SkillCategoriesSection = ({ 
  selectedCategories, 
  onCategoryChange 
}) => {
  const skillCategories = [
    { id: 'art', name: 'Art & Design', icon: 'Palette', color: 'text-pink-500' },
    { id: 'baking', name: 'Baking & Cooking', icon: 'ChefHat', color: 'text-orange-500' },
    { id: 'coding', name: 'Coding & Tech', icon: 'Code', color: 'text-blue-500' },
    { id: 'sports', name: 'Sports & Fitness', icon: 'Dumbbell', color: 'text-green-500' },
    { id: 'music', name: 'Music & Audio', icon: 'Music', color: 'text-purple-500' },
    { id: 'ai', name: 'AI & Automation', icon: 'Bot', color: 'text-cyan-500' }
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
          <span className="text-xl">🎯</span>
        </div>
        <h2 className="font-heading text-xl font-semibold text-foreground">
          Skill Categories
        </h2>
      </div>
      <CheckboxGroup label="Select your areas of interest">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillCategories?.map((category) => (
            <Checkbox
              key={category?.id}
              label={
                <div className="flex items-center gap-2">
                  <Icon name={category?.icon} size={18} className={category?.color} />
                  <span>{category?.name}</span>
                </div>
              }
              checked={selectedCategories?.includes(category?.id)}
              onChange={(e) => onCategoryChange(category?.id, e?.target?.checked)}
            />
          ))}
        </div>
      </CheckboxGroup>
    </div>
  );
};

export default SkillCategoriesSection;
