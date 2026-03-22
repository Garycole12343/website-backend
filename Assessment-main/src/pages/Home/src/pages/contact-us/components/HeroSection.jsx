import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const HeroSection = ({ userName }) => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl p-8 md:p-12 overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
            <Icon name="Sparkles" size={24} color="var(--color-primary)" />
          </div>
          <span className="text-sm font-medium text-primary font-mono">Welcome Back</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
          Hello, {userName}! 👋
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
          Discover new skills, share your expertise, and connect with a vibrant community of learners and creators. Your journey to mastery starts here.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="default"
            size="lg"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate('/user-profile-management?tab=resources')}
            className="shadow-lg hover:shadow-xl transition-shadow duration-200"
          >
            Share a Resource
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            iconName="Search"
            iconPosition="left"
            onClick={() => navigate('/skill-category-browser')}
          >
            Browse Skills
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Icon name="Users" size={20} color="var(--color-primary)" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">12,847</span> Active Members
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="BookOpen" size={20} color="var(--color-secondary)" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">3,421</span> Resources Shared
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} color="var(--color-success)" />
            <span className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">89%</span> Satisfaction Rate
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;