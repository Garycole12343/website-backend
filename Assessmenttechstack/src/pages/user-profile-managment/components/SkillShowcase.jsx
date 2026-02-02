import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SkillShowcase = ({ 
  isEditMode, 
  skills, 
  onSkillAdd, 
  onSkillRemove, 
  onSkillChange 
}) => {
  const expertiseLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const getExpertiseColor = (level) => {
    const colors = {
      beginner: 'bg-blue-100 text-blue-700',
      intermediate: 'bg-green-100 text-green-700',
      advanced: 'bg-orange-100 text-orange-700',
      expert: 'bg-purple-100 text-purple-700'
    };
    return colors?.[level] || colors?.beginner;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <span className="text-xl">⭐</span>
          </div>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            Skills Showcase
          </h2>
        </div>
        {isEditMode && (
          <Button
            variant="outline"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={onSkillAdd}
          >
            Add Skill
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {skills?.map((skill, index) => (
          <div key={index} className="bg-muted rounded-lg p-4">
            {isEditMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Skill Name"
                    type="text"
                    value={skill?.name}
                    onChange={(e) => onSkillChange(index, 'name', e?.target?.value)}
                    placeholder="e.g., React Development"
                    required
                  />
                  <Select
                    label="Expertise Level"
                    options={expertiseLevels}
                    value={skill?.level}
                    onChange={(value) => onSkillChange(index, 'level', value)}
                    required
                  />
                </div>
                <Input
                  label="Portfolio Link (Optional)"
                  type="url"
                  value={skill?.portfolioLink}
                  onChange={(e) => onSkillChange(index, 'portfolioLink', e?.target?.value)}
                  placeholder="https://example.com/portfolio"
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <textarea
                    value={skill?.description}
                    onChange={(e) => onSkillChange(index, 'description', e?.target?.value)}
                    placeholder="Describe your experience and achievements..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 resize-none"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  iconName="Trash2"
                  iconPosition="left"
                  onClick={() => onSkillRemove(index)}
                >
                  Remove Skill
                </Button>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                      {skill?.name}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getExpertiseColor(skill?.level)}`}>
                      {skill?.level?.charAt(0)?.toUpperCase() + skill?.level?.slice(1)}
                    </span>
                  </div>
                  {skill?.portfolioLink && (
                    <a
                      href={skill?.portfolioLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors duration-200"
                    >
                      <Icon name="ExternalLink" size={16} />
                      <span className="text-sm">View</span>
                    </a>
                  )}
                </div>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {skill?.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillShowcase;