import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ResourcesSummary = ({ resourceCount, recentResources }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
            <span className="text-xl">📚</span>
          </div>
          <div>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              My Posted Resources
            </h2>
            <p className="text-sm text-muted-foreground">
              {resourceCount} total resources shared
            </p>
          </div>
        </div>
        <Link to="/home-dashboard?tab=resources">
          <Button variant="outline" size="sm" iconName="ArrowRight" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {recentResources?.map((resource) => (
          <div
            key={resource?.id}
            className="flex items-center gap-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-200"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${resource?.categoryColor}`}>
              <Icon name={resource?.categoryIcon} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate mb-1">
                {resource?.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Icon name="Eye" size={14} />
                  {resource?.views}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="MessageCircle" size={14} />
                  {resource?.comments}
                </span>
                <span className="flex items-center gap-1">
                  <Icon name="Star" size={14} />
                  {resource?.rating}
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {resource?.postedDate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourcesSummary;