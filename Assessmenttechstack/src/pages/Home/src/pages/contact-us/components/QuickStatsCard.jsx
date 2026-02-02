import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStatsCard = ({ stat }) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat?.bgColor}`}>
          <Icon name={stat?.icon} size={24} color={stat?.iconColor} />
        </div>
        
        {stat?.trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${stat?.trend > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
            <Icon name={stat?.trend > 0 ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span className="text-xs font-semibold font-mono">{Math.abs(stat?.trend)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-heading font-bold text-foreground">
          {stat?.value}
        </p>
        <p className="text-sm text-muted-foreground">
          {stat?.label}
        </p>
      </div>
      {stat?.subtitle && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border font-mono">
          {stat?.subtitle}
        </p>
      )}
    </div>
  );
};

export default QuickStatsCard;