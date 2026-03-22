import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const skillsDropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const skillCategories = [
    { name: 'Art & Design', path: '/skill-category-browser?category=art', icon: 'Palette', count: 245 },
    { name: 'Baking & Cooking', path: '/skill-category-browser?category=baking', icon: 'ChefHat', count: 189 },
    { name: 'Coding & Tech', path: '/skill-category-browser?category=coding', icon: 'Code', count: 412 },
    { name: 'Sports & Fitness', path: '/skill-category-browser?category=sports', icon: 'Dumbbell', count: 156 },
    { name: 'Music & Audio', path: '/skill-category-browser?category=music', icon: 'Music', count: 298 },
    { name: 'AI & Automation', path: '/skill-category-browser?category=ai', icon: 'Bot', count: 167 }
  ];

  const primaryNavItems = [
    { label: 'Home', path: '/home-dashboard', icon: 'Home' },
    { label: 'Skills', path: '#', icon: 'GraduationCap', hasDropdown: true },
    { label: 'My Profile', path: '/user-profile-management', icon: 'User' },
    { label: 'Contact', path: '/contact-us', icon: 'MessageCircle' }
  ];

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (skillsDropdownRef?.current && !skillsDropdownRef?.current?.contains(event?.target)) {
        setIsSkillsOpen(false);
      }
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef?.current && !mobileMenuRef?.current?.contains(event?.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleSkillsClick = (e) => {
    e?.preventDefault();
    setIsSkillsOpen(!isSkillsOpen);
  };

  const handleCategoryClick = (path) => {
    navigate(path);
    setIsSkillsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setIsUserMenuOpen(false);
    navigate('/login');
  };

  const isActivePath = (path) => {
    if (path === '#') return false;
    return location?.pathname === path;
  };

  return (
    <header className="sticky top-0 z-100 bg-card border-b border-border shadow-sm">
      <nav className="flex items-center justify-between h-[60px] px-6">
        <div className="flex items-center gap-8">
          <Link to="/home-dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={24} color="var(--color-primary)" />
            </div>
            <span className="font-heading font-semibold text-xl text-foreground hidden sm:block">
              Skill Swap Hub
            </span>
          </Link>

          <ul className="hidden lg:flex items-center gap-6">
            {primaryNavItems?.map((item) => (
              <li key={item?.label} className="relative" ref={item?.hasDropdown ? skillsDropdownRef : null}>
                {item?.hasDropdown ? (
                  <button
                    onClick={handleSkillsClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-base transition-all duration-200 ${
                      isSkillsOpen
                        ? 'text-primary bg-primary/5' :'text-foreground hover:text-primary hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={18} />
                    <span>{item?.label}</span>
                    <Icon 
                      name="ChevronDown" 
                      size={16} 
                      className={`transition-transform duration-200 ${isSkillsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                ) : (
                  <Link
                    to={item?.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md font-medium text-base transition-all duration-200 ${
                      isActivePath(item?.path)
                        ? 'text-primary bg-primary/5' :'text-foreground hover:text-primary hover:bg-muted'
                    }`}
                  >
                    <Icon name={item?.icon} size={18} />
                    <span>{item?.label}</span>
                  </Link>
                )}

                {item?.hasDropdown && isSkillsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[600px] bg-popover border border-border rounded-lg shadow-elevated animate-scale-in z-200">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        {skillCategories?.map((category) => (
                          <button
                            key={category?.name}
                            onClick={() => handleCategoryClick(category?.path)}
                            className="flex items-start gap-3 p-3 rounded-md hover:bg-muted transition-colors duration-200 text-left group"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                              <Icon name={category?.icon} size={20} color="var(--color-primary)" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors duration-200">
                                {category?.name}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                                {category?.count} resources
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={18} color="var(--color-primary)" />
                </div>
                <Icon 
                  name="ChevronDown" 
                  size={16} 
                  className={`hidden sm:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-elevated animate-scale-in z-200">
                  <div className="p-2">
                    <Link
                      to="/user-profile-management"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 text-sm"
                    >
                      <Icon name="User" size={18} />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/user-profile-management?tab=resources"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors duration-200 text-sm"
                    >
                      <Icon name="BookOpen" size={18} />
                      <span>My Resources</span>
                    </Link>
                    <div className="h-px bg-border my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 text-sm"
                    >
                      <Icon name="LogOut" size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 rounded-md font-medium text-sm text-foreground hover:bg-muted transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md font-medium text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>
      </nav>
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-250 lg:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div 
            ref={mobileMenuRef}
            className="fixed top-[60px] left-0 right-0 bottom-0 bg-card border-t border-border z-300 lg:hidden overflow-y-auto animate-slide-in-right"
          >
            <div className="p-6">
              <nav className="space-y-2">
                {primaryNavItems?.map((item) => (
                  <div key={item?.label}>
                    {item?.hasDropdown ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-4 py-3 font-medium text-base text-muted-foreground">
                          <Icon name={item?.icon} size={20} />
                          <span>{item?.label}</span>
                        </div>
                        <div className="pl-4 space-y-1">
                          {skillCategories?.map((category) => (
                            <button
                              key={category?.name}
                              onClick={() => handleCategoryClick(category?.path)}
                              className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-muted transition-colors duration-200 text-left"
                            >
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Icon name={category?.icon} size={20} color="var(--color-primary)" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm text-foreground">
                                  {category?.name}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
                                  {category?.count} resources
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={item?.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-base transition-colors duration-200 ${
                          isActivePath(item?.path)
                            ? 'text-primary bg-primary/5' :'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon name={item?.icon} size={20} />
                        <span>{item?.label}</span>
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {!isAuthenticated && (
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-md font-medium text-center text-foreground bg-muted hover:bg-muted/80 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 rounded-md font-medium text-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;