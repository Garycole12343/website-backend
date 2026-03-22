import React from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  isOpen, 
  onClose,
  subcategories,
  difficultyLevels,
  resourceTypes,
  sortOptions 
}) => {
  const activeFilterCount = Object.values(filters)?.filter(v => v && v !== 'all')?.length;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div className={`
        fixed lg:static top-0 right-0 h-full lg:h-auto w-80 lg:w-full
        bg-card border-l lg:border-l-0 lg:border border-border rounded-none lg:rounded-lg
        shadow-elevated lg:shadow-sm z-50 lg:z-auto
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full lg:h-auto flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
            <h2 className="font-heading text-lg font-semibold text-foreground">Filters</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-muted transition-colors duration-200"
            >
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="hidden lg:flex items-center justify-between mb-2">
              <h2 className="font-heading text-lg font-semibold text-foreground">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {activeFilterCount} active
                </span>
              )}
            </div>

            <Select
              label="Subcategory"
              options={subcategories}
              value={filters?.subcategory}
              onChange={(value) => onFilterChange('subcategory', value)}
              placeholder="All subcategories"
            />

            <Select
              label="Difficulty Level"
              options={difficultyLevels}
              value={filters?.difficulty}
              onChange={(value) => onFilterChange('difficulty', value)}
              placeholder="All levels"
            />

            <Select
              label="Resource Type"
              options={resourceTypes}
              value={filters?.resourceType}
              onChange={(value) => onFilterChange('resourceType', value)}
              placeholder="All types"
            />

            <Select
              label="Sort By"
              options={sortOptions}
              value={filters?.sortBy}
              onChange={(value) => onFilterChange('sortBy', value)}
            />

            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                fullWidth
                iconName="X"
                iconPosition="left"
                onClick={onClearFilters}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;