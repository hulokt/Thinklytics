import React, { useState } from 'react';
import { ArrowLeft, Calendar, User, ArrowRight, BookOpen, Target, TrendingUp, Search } from 'lucide-react';

const BlogPage = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Posts', count: 12 },
    { id: 'tips', name: 'Study Tips', count: 5 },
    { id: 'strategy', name: 'Strategy', count: 4 },
    { id: 'updates', name: 'Updates', count: 3 }
  ];

  const featuredPost = {
    id: 1,
    title: "How to Improve Your SAT Score by 200+ Points in 3 Months",
    excerpt: "Discover proven strategies and techniques that thousands of students have used to dramatically improve their SAT scores.",
    author: "Dr. Sarah Chen",
    date: "2024-12-10",
    category: "Strategy",
    readTime: "8 min read",
    image: "/logo.png"
  };

  const posts = [
    {
      id: 2,
      title: "The Ultimate Guide to SAT Math Section",
      excerpt: "Master algebra, geometry, and statistics with our comprehensive guide to the SAT math section.",
      author: "Michael Rodriguez",
      date: "2024-12-08",
      category: "tips",
      readTime: "12 min read",
      image: "/logo.png"
    },
    {
      id: 3,
      title: "Reading Comprehension Strategies That Actually Work",
      excerpt: "Learn effective techniques for tackling the most challenging reading passages on the SAT.",
      author: "Dr. Emily Watson",
      date: "2024-12-05",
      category: "tips",
      readTime: "10 min read",
      image: "/logo.png"
    },
    {
      id: 4,
      title: "Common SAT Essay Mistakes to Avoid",
      excerpt: "Avoid these critical errors that can hurt your essay score and learn what graders really look for.",
      author: "Jennifer Kim",
      date: "2024-12-03",
      category: "tips",
      readTime: "6 min read",
      image: "/logo.png"
    },
    {
      id: 5,
      title: "New Features: AI-Powered Question Analysis",
      excerpt: "Introducing our latest AI technology that provides personalized insights into your practice questions.",
      author: "Thinklytics Team",
      date: "2024-12-01",
      category: "updates",
      readTime: "4 min read",
      image: "/logo.png"
    },
    {
      id: 6,
      title: "Test Day Preparation: A Complete Checklist",
      excerpt: "Everything you need to know to feel confident and prepared on SAT test day.",
      author: "Dr. Sarah Chen",
      date: "2024-11-28",
      category: "strategy",
      readTime: "7 min read",
      image: "/logo.png"
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen homepage-bg transition-colors duration-300">
      {/* Header */}
      <div className="homepage-card shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg homepage-card hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 homepage-text-primary" />
            </button>
            <h1 className="text-3xl font-bold homepage-text-primary">Blog</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            SAT Success
            <span className="homepage-gradient-text"> Stories</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Expert insights, proven strategies, and success stories to help you achieve your best SAT score.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 homepage-text-secondary" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 homepage-card homepage-text-primary focus:ring-2 focus:ring-[var(--brand-60)] focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'homepage-cta-primary text-white'
                      : 'homepage-card homepage-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <div className="homepage-card rounded-2xl shadow-xl overflow-hidden homepage-hover-glow">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] text-white text-sm font-medium">
                    Featured
                  </span>
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 homepage-text-secondary text-sm">
                    {featuredPost.category}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold homepage-text-primary mb-4">
                  {featuredPost.title}
                </h3>
                
                <p className="homepage-text-secondary mb-6 leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm homepage-text-secondary">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{featuredPost.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featuredPost.date)}</span>
                    </div>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  
                  <button className="homepage-cta-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                    <span>Read More</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="homepage-card rounded-xl shadow-lg overflow-hidden homepage-hover-glow">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 homepage-text-secondary text-xs">
                    {post.category}
                  </span>
                  <span className="homepage-text-secondary text-xs">{post.readTime}</span>
                </div>
                
                <h3 className="text-xl font-semibold homepage-text-primary mb-3 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="homepage-text-secondary mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm homepage-text-secondary">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                  </div>
                  
                  <button className="blue-gradient-text hover:underline font-medium">
                    Read More
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 blue-gradient-bg rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-lg mb-6 opacity-90">
            Get the latest SAT tips, strategies, and success stories delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="bg-white text-[var(--brand-60)] hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage; 