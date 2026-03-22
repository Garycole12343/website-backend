import React from 'react';
import { useTheme } from '../context/ThemeContext';
import Icon from './AppIcon';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'default') setTheme('dark');
    else if (theme === 'dark') setTheme('high-contrast');
    else setTheme('default');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return 'Moon';
    if (theme === 'high-contrast') return 'Contrast';
    return 'Sun';
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Dark Mode';
    if (theme === 'high-contrast') return 'High Contrast';
    return 'Light Mode';
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-foreground transition-all duration-200 flex items-center gap-2 border border-border group"
      title={`Current: ${getThemeLabel()} - Click to change`}
      aria-label="Change theme"
    >
      <Icon 
        name={getThemeIcon()} 
        size={18} 
        className="text-primary group-hover:scale-110 transition-transform" 
      />
      <span className="text-xs font-medium hidden sm:inline uppercase tracking-wider">
        Theme
      </span>
    </button>
  );
};

export default ThemeToggle;
