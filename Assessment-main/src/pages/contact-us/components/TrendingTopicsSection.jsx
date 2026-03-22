import React from 'react';
import Icon from '../../../components/AppIcon';

const TrendingTopicsSection = ({ topics }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
          <Icon name="TrendingUp" size={20} color="var(--color-warning)" />
        </div>
        <h2 className="text-xl font-heading font-semibold text-foreground">
          Trending Topics
        </h2>
      </div>
      <div className="space-y-3">
        {topics?.map((topic, index) => (
          <button
            key={topic?.id}
            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors duration-200 text-left group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-lg font-heading font-bold text-muted-foreground font-mono">
                #{index + 1}
              </span>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                  {topic?.name}
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {topic?.mentions} mentions
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${topic?.growth > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                <Icon name={topic?.growth > 0 ? 'ArrowUp' : 'Minus'} size={12} />
                <span className="text-xs font-semibold font-mono">{topic?.growth}%</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendingTopicsSection;