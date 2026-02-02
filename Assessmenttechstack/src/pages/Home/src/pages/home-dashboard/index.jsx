import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "../../components/navigation/Header";
import Icon from "../../components/AppIcon";
import CategoryCard from "./components/CategoryCard";
import FeaturedResourceCard from "./components/FeaturedResourceCard";
import ActivityFeedItem from "./components/ActivityFeedItem";

const QuickStatsCard = ({ stat }) => (
  <div className="p-6 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
        <Icon name={stat.icon || "BarChart3"} size={24} color="white" />
      </div>
      <div className="text-3xl font-bold text-foreground">
        {stat.value || "0"}
      </div>
    </div>
    <div>
      <h3 className="font-semibold text-foreground">
        {stat.title || "Metric"}
      </h3>
      <p className="text-sm text-muted-foreground">
        {stat.description || "Description"}
      </p>
    </div>
  </div>
);

const TrendingTopicsSection = ({ topics = [] }) => (
  <section className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
        <Icon name="TrendingUp" size={20} color="var(--color-accent)" />
      </div>
      <div>
        <h2 className="text-2xl font-heading font-bold text-foreground">
          Trending Topics
        </h2>
        <p className="text-sm text-muted-foreground">
          What&apos;s hot in our community right now
        </p>
      </div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {topics.map((topic, index) => (
        <div key={index} className="group">
          <div className="px-4 py-3 bg-muted rounded-lg hover:bg-accent/20 transition-colors cursor-pointer group-hover:scale-105 transform duration-200 border">
            <div className="font-medium text-foreground group-hover:text-accent">
              {topic.title || "Topic"}
            </div>
            <div className="text-xs text-muted-foreground">
              {topic.count || "0"} posts
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const HeroSection = ({ userName }) => (
  <section className="text-center py-20 px-4 bg-gradient-to-r from-background via-muted to-background rounded-3xl shadow-2xl">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-heading font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 leading-tight">
        Welcome back, <span className="text-primary">{userName}</span>
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
        Discover skills, share resources, and connect with a vibrant community
        of learners and creators.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
        <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
          <Icon name="Plus" size={20} />
          Share Resource
        </button>
        <button className="px-8 py-4 border-2 border-muted-foreground/50 text-foreground rounded-2xl font-semibold text-lg hover:bg-muted hover:border-accent transition-all duration-300 flex items-center gap-3">
          <Icon name="BookOpen" size={20} />
          Browse Skills
        </button>
      </div>
    </div>
  </section>
);

const HomeDashboard = () => {
  const [userName, setUserName] = useState("Explorer");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const categories = [
    {
      id: 1,
      title: "Web Development",
      icon: "Code",
      color: "blue",
      resources: 245,
    },
    {
      id: 2,
      title: "Design",
      icon: "Palette",
      color: "pink",
      resources: 189,
    },
    {
      id: 3,
      title: "Data Science",
      icon: "Database",
      color: "green",
      resources: 156,
    },
    {
      id: 4,
      title: "Mobile Apps",
      icon: "Smartphone",
      color: "purple",
      resources: 134,
    },
    {
      id: 5,
      title: "Marketing",
      icon: "Megaphone",
      color: "orange",
      resources: 98,
    },
    {
      id: 6,
      title: "DevOps",
      icon: "Server",
      color: "indigo",
      resources: 76,
    },
  ];

  const featuredResources = [
    {
      id: 1,
      title: "React Hooks Masterclass",
      author: "Sarah Johnson",
      category: "Web Dev",
      views: 2345,
      rating: 4.9,
    },
    {
      id: 2,
      title: "Figma to Code Workflow",
      author: "Mike Chen",
      category: "Design",
      views: 1987,
      rating: 4.8,
    },
    {
      id: 3,
      title: "Python Data Pipelines",
      author: "Ana Rodriguez",
      category: "Data",
      views: 1678,
      rating: 4.7,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: "john_doe",
      action: "published",
      resource: "Advanced CSS Grid",
      time: "2 min ago",
    },
    {
      id: 2,
      user: "design_guru",
      action: "updated",
      resource: "Figma Prototyping Guide",
      time: "5 min ago",
    },
    {
      id: 3,
      user: "data_ninja",
      action: "shared",
      resource: "Pandas Cheatsheet",
      time: "12 min ago",
    },
  ];

  const quickStats = [
    {
      id: 1,
      title: "Total Resources",
      value: "12.4K",
      description: "+1.2K this month",
      icon: "BookOpen",
    },
    {
      id: 2,
      title: "Active Users",
      value: "8.7K",
      description: "+456 today",
      icon: "Users",
    },
    {
      id: 3,
      title: "New Skills",
      value: "245",
      description: "+23 this week",
      icon: "Sparkles",
    },
    {
      id: 4,
      title: "Avg Rating",
      value: "4.8⭐",
      description: "Overall rating",
      icon: "Star",
    },
  ];

  const trendingTopics = [
    { title: "React 19", count: 456 },
    { title: "Tailwind CSS", count: 389 },
    { title: "Next.js 15", count: 312 },
    { title: "TypeScript", count: 287 },
    { title: "Vite", count: 234 },
    { title: "shadcn/ui", count: 198 },
    { title: "AI Tools", count: 167 },
    { title: "Docker", count: 145 },
  ];

  return (
    <>
      <Helmet>
        <title>Home Dashboard - Skill Swap Hub</title>
        <meta
          name="description"
          content="Discover skills, share resources, and connect with a vibrant community of learners and creators on Skill Swap Hub."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Hero */}
          <HeroSection userName={userName} />

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-10">
              {/* Categories */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon
                      name="Categories"
                      size={20}
                      color="var(--color-primary)"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">
                      Explore Categories
                    </h2>
                    <p className="text-sm text-gray-500">
                      Find resources by skill area
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </section>

              {/* Featured Resources */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Icon
                      name="Star"
                      size={20}
                      color="var(--color-secondary)"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">
                      Featured Resources
                    </h2>
                    <p className="text-sm text-gray-500">
                      Top rated content this week
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredResources.map((resource) => (
                    <FeaturedResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon
                      name="Activity"
                      size={20}
                      color="var(--color-accent)"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">
                      Recent Activity
                    </h2>
                    <p className="text-sm text-gray-500">
                      Stay updated with community activity
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <ActivityFeedItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </section>
            </div>

            {/* Right column */}
            <aside className="space-y-8">
              {/* Platform Statistics */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Icon
                      name="BarChart3"
                      size={20}
                      color="var(--color-secondary)"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">
                      Platform Statistics
                    </h2>
                    <p className="text-sm text-gray-500">
                      Real-time insights into our growing community
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickStats.map((stat) => (
                    <QuickStatsCard key={stat.id} stat={stat} />
                  ))}
                </div>
              </div>

              {/* Trending Topics */}
              <TrendingTopicsSection topics={trendingTopics} />
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default HomeDashboard;
