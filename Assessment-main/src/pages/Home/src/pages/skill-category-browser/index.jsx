import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/navigation/Header';
import CategoryHeader from './components/CategoryHeader';
import FilterPanel from './components/FilterPanel';
import SearchBar from './components/SearchBar';
import ResourceGrid from './components/ResourceGrid';

import Button from '../../components/ui/Button';

const SkillCategoryBrowser = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams?.get('category') || 'art';

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState({
    subcategory: 'all',
    difficulty: 'all',
    resourceType: 'all',
    sortBy: 'newest'
  });

  const categoryData = {
    art: {
      description: "Explore creative resources including digital art, painting, illustration, and design tutorials from expert artists.",
      subcategories: [
      { value: 'all', label: 'All Subcategories' },
      { value: 'digital-art', label: 'Digital Art' },
      { value: 'painting', label: 'Painting' },
      { value: 'illustration', label: 'Illustration' },
      { value: 'graphic-design', label: 'Graphic Design' },
      { value: 'photography', label: 'Photography' }]

    },
    baking: {
      description: "Master the art of baking with recipes, techniques, and tips from professional bakers and pastry chefs.",
      subcategories: [
      { value: 'all', label: 'All Subcategories' },
      { value: 'bread', label: 'Bread Making' },
      { value: 'pastries', label: 'Pastries' },
      { value: 'cakes', label: 'Cakes & Decorating' },
      { value: 'cookies', label: 'Cookies' },
      { value: 'desserts', label: 'Desserts' }]

    },
    coding: {
      description: "Learn programming languages, frameworks, and development tools through comprehensive tutorials and projects.",
      subcategories: [
      { value: 'all', label: 'All Subcategories' },
      { value: 'web-dev', label: 'Web Development' },
      { value: 'mobile-dev', label: 'Mobile Development' },
      { value: 'data-science', label: 'Data Science' },
      { value: 'devops', label: 'DevOps' },
      { value: 'game-dev', label: 'Game Development' }]

    },
    sports: {
      description: "Improve your athletic performance with training programs, technique guides, and fitness resources.",
      subcategories: [
      { value: 'all', label: 'All Subcategories' },
      { value: 'fitness', label: 'Fitness Training' },
      { value: 'yoga', label: 'Yoga & Meditation' },
      { value: 'team-sports', label: 'Team Sports' },
      { value: 'martial-arts', label: 'Martial Arts' },
      { value: 'nutrition', label: 'Sports Nutrition' }]

    },
    music: {
      description: "Develop your musical skills with lessons on instruments, music theory, production, and composition.",
      subcategories: [
      { value: 'all', label: 'All Subcategories' },
      { value: 'instruments', label: 'Instruments' },
      { value: 'theory', label: 'Music Theory' },
      { value: 'production', label: 'Music Production' },
      { value: 'vocals', label: 'Vocals & Singing' },
      { value: 'composition', label: 'Composition' }]

    },
    ai: {
      description: "Discover AI tools, machine learning resources, and automation techniques to enhance your productivity.",
      subcategories: [
      { value: 'all', label: 'All Subcategories' },
      { value: 'ml-basics', label: 'ML Fundamentals' },
      { value: 'nlp', label: 'Natural Language Processing' },
      { value: 'computer-vision', label: 'Computer Vision' },
      { value: 'ai-tools', label: 'AI Tools & Platforms' },
      { value: 'automation', label: 'Automation' }]

    }
  };

  const difficultyLevels = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }];


  const resourceTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'video', label: 'Video Tutorials' },
  { value: 'article', label: 'Articles & Guides' },
  { value: 'tool', label: 'Tools & Resources' },
  { value: 'course', label: 'Full Courses' }];


  const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'highest-rated', label: 'Highest Rated' },
  { value: 'most-viewed', label: 'Most Viewed' },
  { value: 'title-asc', label: 'Title (A-Z)' }];


  const mockResources = [
  {
    id: 1,
    title: "Complete Digital Painting Masterclass",
    description: "Learn professional digital painting techniques from concept to final artwork using industry-standard tools and workflows.",
    thumbnail: "https://images.unsplash.com/photo-1715678077681-e4163401e7a3",
    thumbnailAlt: "Digital artist working on colorful illustration using graphics tablet with stylus pen on modern computer setup",
    creatorName: "Sarah Mitchell",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14da91c34-1763294780479.png",
    creatorAvatarAlt: "Professional headshot of woman with brown hair wearing black turtleneck smiling at camera",
    rating: 4.8,
    views: "12.5k",
    difficulty: "intermediate",
    type: "course",
    duration: "8h 30m",
    isPremium: true,
    isFeatured: false,
    isBookmarked: false,
    category: "art",
    subcategory: "digital-art"
  },
  {
    id: 2,
    title: "Artisan Sourdough Bread Baking Guide",
    description: "Master the art of sourdough bread making with step-by-step instructions for creating perfect loaves at home.",
    thumbnail: "https://images.unsplash.com/photo-1588237316222-bb87b6b75cc9",
    thumbnailAlt: "Freshly baked golden brown sourdough bread loaf with crispy crust on wooden cutting board in rustic kitchen",
    creatorName: "James Baker",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10b71c915-1763291673625.png",
    creatorAvatarAlt: "Professional headshot of middle-aged man with gray beard wearing white chef coat smiling warmly",
    rating: 4.9,
    views: "8.2k",
    difficulty: "beginner",
    type: "video",
    duration: "45m",
    isPremium: false,
    isFeatured: true,
    isBookmarked: true,
    category: "baking",
    subcategory: "bread"
  },
  {
    id: 3,
    title: "React 18 Advanced Patterns & Best Practices",
    description: "Deep dive into React 18 features including concurrent rendering, suspense, and modern state management patterns.",
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1c3c86ae3-1764669618316.png",
    thumbnailAlt: "Software developer coding React application on dual monitor setup with colorful code editor and component tree visible",
    creatorName: "Alex Chen",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6e66ab6-1763296779800.png",
    creatorAvatarAlt: "Professional headshot of Asian man with short black hair wearing blue button-up shirt in modern office",
    rating: 4.7,
    views: "15.3k",
    difficulty: "advanced",
    type: "course",
    duration: "12h",
    isPremium: true,
    isFeatured: true,
    isBookmarked: false,
    category: "coding",
    subcategory: "web-dev"
  },
  {
    id: 4,
    title: "HIIT Workout Program for Beginners",
    description: "High-intensity interval training program designed for beginners to build strength and improve cardiovascular fitness.",
    thumbnail: "https://images.unsplash.com/photo-1675910518245-04081dc44b5f",
    thumbnailAlt: "Athletic woman in black sportswear performing high-intensity exercise outdoors in urban park setting during sunrise",
    creatorName: "Maria Rodriguez",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1607393af-1763300925414.png",
    creatorAvatarAlt: "Professional headshot of Hispanic woman with long dark hair in athletic wear smiling confidently",
    rating: 4.6,
    views: "9.7k",
    difficulty: "beginner",
    type: "video",
    duration: "30m",
    isPremium: false,
    isFeatured: false,
    isBookmarked: false,
    category: "sports",
    subcategory: "fitness"
  },
  {
    id: 5,
    title: "Music Production with Ableton Live 11",
    description: "Complete guide to electronic music production covering composition, sound design, mixing, and mastering techniques.",
    thumbnail: "https://images.unsplash.com/photo-1644535662386-d83f6fb96a43",
    thumbnailAlt: "Music producer working at professional studio desk with MIDI keyboard, audio interface, and multiple monitors showing DAW software",
    creatorName: "David Thompson",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_12455e16c-1763294482920.png",
    creatorAvatarAlt: "Professional headshot of man with short brown hair wearing headphones around neck in recording studio",
    rating: 4.8,
    views: "11.2k",
    difficulty: "intermediate",
    type: "course",
    duration: "10h 15m",
    isPremium: true,
    isFeatured: false,
    isBookmarked: true,
    category: "music",
    subcategory: "production"
  },
  {
    id: 6,
    title: "Introduction to Machine Learning with Python",
    description: "Learn fundamental machine learning concepts and implement algorithms using Python, scikit-learn, and TensorFlow.",
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1776ad126-1764646512120.png",
    thumbnailAlt: "Computer screen displaying Python code for machine learning model with data visualization graphs and neural network diagrams",
    creatorName: "Dr. Emily Watson",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15fc4e960-1763296851124.png",
    creatorAvatarAlt: "Professional headshot of woman with blonde hair wearing glasses and navy blazer in academic setting",
    rating: 4.9,
    views: "18.5k",
    difficulty: "intermediate",
    type: "course",
    duration: "15h",
    isPremium: true,
    isFeatured: true,
    isBookmarked: false,
    category: "ai",
    subcategory: "ml-basics"
  },
  {
    id: 7,
    title: "Watercolor Landscape Painting Techniques",
    description: "Explore watercolor painting methods for creating stunning landscapes with proper color mixing and brush techniques.",
    thumbnail: "https://images.unsplash.com/photo-1694082135831-c730f8c4ba04",
    thumbnailAlt: "Artist painting watercolor landscape on paper with vibrant blue sky and green mountains using fine brushes and palette",
    creatorName: "Lisa Anderson",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_15047d6a1-1764662485969.png",
    creatorAvatarAlt: "Professional headshot of woman with red hair wearing paint-splattered apron smiling in art studio",
    rating: 4.7,
    views: "6.8k",
    difficulty: "beginner",
    type: "video",
    duration: "1h 20m",
    isPremium: false,
    isFeatured: false,
    isBookmarked: false,
    category: "art",
    subcategory: "painting"
  },
  {
    id: 8,
    title: "French Pastry Fundamentals",
    description: "Master classic French pastry techniques including croissants, éclairs, and tarts with detailed step-by-step instructions.",
    thumbnail: "https://images.unsplash.com/photo-1581424505676-656f5517cb02",
    thumbnailAlt: "Elegant display of French pastries including golden croissants, chocolate eclairs, and fruit tarts on marble counter",
    creatorName: "Pierre Dubois",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_1b5d95a5e-1763299850376.png",
    creatorAvatarAlt: "Professional headshot of French chef with dark hair wearing traditional white chef hat and coat",
    rating: 4.9,
    views: "10.4k",
    difficulty: "advanced",
    type: "course",
    duration: "6h 45m",
    isPremium: true,
    isFeatured: false,
    isBookmarked: true,
    category: "baking",
    subcategory: "pastries"
  },
  {
    id: 9,
    title: "Full-Stack JavaScript Development Bootcamp",
    description: "Comprehensive bootcamp covering Node.js, Express, React, MongoDB, and modern deployment practices for web applications.",
    thumbnail: "https://img.rocket.new/generatedImages/rocket_gen_img_1339d031a-1764642895849.png",
    thumbnailAlt: "Developer workspace with laptop showing JavaScript code, coffee cup, notebook, and smartphone on wooden desk",
    creatorName: "Michael Brown",
    creatorAvatar: "https://img.rocket.new/generatedImages/rocket_gen_img_14d5770fa-1763294770713.png",
    creatorAvatarAlt: "Professional headshot of man with short dark hair wearing casual gray shirt in modern tech office",
    rating: 4.8,
    views: "22.1k",
    difficulty: "intermediate",
    type: "course",
    duration: "20h",
    isPremium: true,
    isFeatured: true,
    isBookmarked: false,
    category: "coding",
    subcategory: "web-dev"
  }];


  const searchSuggestions = [
  "Digital painting tutorials",
  "Sourdough bread recipe",
  "React hooks guide",
  "HIIT workout routine",
  "Music production basics",
  "Machine learning Python",
  "Watercolor techniques",
  "French pastry recipes",
  "JavaScript full stack"];


  const [filteredResources, setFilteredResources] = useState([]);
  const [displayedResources, setDisplayedResources] = useState([]);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filtered = mockResources?.filter((resource) => resource?.category === category);

      if (searchQuery) {
        filtered = filtered?.filter((resource) =>
        resource?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        resource?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        resource?.creatorName?.toLowerCase()?.includes(searchQuery?.toLowerCase())
        );
      }

      if (filters?.subcategory !== 'all') {
        filtered = filtered?.filter((resource) => resource?.subcategory === filters?.subcategory);
      }

      if (filters?.difficulty !== 'all') {
        filtered = filtered?.filter((resource) => resource?.difficulty === filters?.difficulty);
      }

      if (filters?.resourceType !== 'all') {
        filtered = filtered?.filter((resource) => resource?.type === filters?.resourceType);
      }

      switch (filters?.sortBy) {
        case 'highest-rated':
          filtered?.sort((a, b) => b?.rating - a?.rating);
          break;
        case 'most-viewed':
          filtered?.sort((a, b) => parseFloat(b?.views) - parseFloat(a?.views));
          break;
        case 'title-asc':
          filtered?.sort((a, b) => a?.title?.localeCompare(b?.title));
          break;
        default:
          break;
      }

      setFilteredResources(filtered);
      setDisplayedResources(filtered?.slice(0, 9));
      setHasMore(filtered?.length > 9);
      setLoading(false);
    }, 500);
  }, [category, searchQuery, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      subcategory: 'all',
      difficulty: 'all',
      resourceType: 'all',
      sortBy: 'newest'
    });
  };

  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      const currentLength = displayedResources?.length;
      const nextResources = filteredResources?.slice(currentLength, currentLength + 9);
      setDisplayedResources((prev) => [...prev, ...nextResources]);
      setHasMore(currentLength + 9 < filteredResources?.length);
      setLoading(false);
    }, 500);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
  };

  const currentCategoryData = categoryData?.[category] || categoryData?.art;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CategoryHeader
        category={category}
        totalResources={filteredResources?.length}
        description={currentCategoryData?.description} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            suggestions={searchSuggestions}
            onSuggestionClick={handleSuggestionClick} />

        </div>

        <div className="flex items-center justify-between mb-6 lg:hidden">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {displayedResources?.length} {displayedResources?.length === 1 ? 'Resource' : 'Resources'}
          </h2>
          <Button
            variant="outline"
            iconName="SlidersHorizontal"
            iconPosition="left"
            onClick={() => setIsFilterOpen(true)}>

            Filters
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              subcategories={currentCategoryData?.subcategories}
              difficultyLevels={difficultyLevels}
              resourceTypes={resourceTypes}
              sortOptions={sortOptions} />

          </div>

          <div className="lg:col-span-3">
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                {displayedResources?.length} {displayedResources?.length === 1 ? 'Resource' : 'Resources'}
              </h2>
            </div>

            <ResourceGrid resources={displayedResources} loading={loading && displayedResources?.length === 0} />

            {hasMore && !loading &&
            <div className="flex justify-center mt-8">
                <Button
                variant="outline"
                iconName="ChevronDown"
                iconPosition="right"
                onClick={handleLoadMore}>

                  Load More Resources
                </Button>
              </div>
            }

            {loading && displayedResources?.length > 0 &&
            <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Loading more resources...</span>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};

export default SkillCategoryBrowser;