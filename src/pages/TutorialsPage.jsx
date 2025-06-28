import React, { useState } from 'react';
import { ArrowLeft, Play, Clock, User, BookOpen, Video, FileText, Target, Star, TrendingUp, Filter, Search } from 'lucide-react';
import logoImage from "/logo.png";

const TutorialsPage = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const categories = [
    { id: 'all', name: 'All Tutorials' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'math', name: 'Math Strategies' },
    { id: 'reading', name: 'Reading & Writing' },
    { id: 'analytics', name: 'Analytics & Progress' },
    { id: 'advanced', name: 'Advanced Tips' }
  ];

  const tutorials = [
    {
      id: 1,
      title: "SAT Math Fundamentals: Algebra Basics",
      description: "Master the essential algebraic concepts that form the foundation of SAT Math success.",
      duration: "45 min",
      difficulty: "Beginner",
      category: "Math",
      rating: 4.8,
      views: 12500,
      thumbnail: logoImage,
      instructor: "Dr. Sarah Chen"
    },
    {
      id: 2,
      title: "Reading Comprehension Strategies",
      description: "Learn proven techniques to improve your reading speed and comprehension accuracy.",
      duration: "60 min",
      difficulty: "Intermediate",
      category: "Reading",
      rating: 4.9,
      views: 8900,
      thumbnail: logoImage,
      instructor: "Dr. Emily Watson"
    },
    {
      id: 3,
      title: "Writing and Language: Grammar Mastery",
      description: "Comprehensive guide to SAT grammar rules and common error patterns.",
      duration: "75 min",
      difficulty: "Advanced",
      category: "Writing",
      rating: 4.7,
      views: 6700,
      thumbnail: logoImage,
      instructor: "Michael Rodriguez"
    },
    {
      id: 4,
      title: "Time Management for SAT Success",
      description: "Strategic approaches to maximize your efficiency during the SAT exam.",
      duration: "30 min",
      difficulty: "Beginner",
      category: "Strategy",
      rating: 4.6,
      views: 10200,
      thumbnail: logoImage,
      instructor: "Dr. Sarah Chen"
    },
    {
      id: 5,
      title: "Advanced Problem Solving Techniques",
      description: "Advanced strategies for tackling the most challenging SAT questions.",
      duration: "90 min",
      difficulty: "Advanced",
      category: "Math",
      rating: 4.9,
      views: 5400,
      thumbnail: logoImage,
      instructor: "Dr. Emily Watson"
    },
    {
      id: 6,
      title: "Essay Writing for SAT Success",
      description: "Step-by-step guide to writing compelling SAT essays that score high.",
      duration: "50 min",
      difficulty: "Intermediate",
      category: "Writing",
      rating: 4.5,
      views: 7800,
      thumbnail: logoImage,
      instructor: "Michael Rodriguez"
    }
  ];

  const featuredTutorial = tutorials.find(t => t.featured);
  const regularTutorials = tutorials.filter(t => !t.featured);

  const filteredTutorials = selectedCategory === 'all' 
    ? regularTutorials 
    : regularTutorials.filter(tutorial => tutorial.category === selectedCategory);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'Intermediate': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'Advanced': return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tutorials</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <BookOpen className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Learn from
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Experts</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Master SAT strategies with our comprehensive video tutorials and guides. 
            Learn from experienced educators and improve your score with proven techniques.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Featured Tutorial */}
        {featuredTutorial && selectedCategory === 'all' && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Featured Tutorial</h3>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 relative">
                  <img 
                    src={featuredTutorial.thumbnail} 
                    alt={featuredTutorial.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Play className="w-16 h-16 text-white" />
                  </div>
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                      Featured
                    </span>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(featuredTutorial.difficulty)}`}>
                      {featuredTutorial.difficulty}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {featuredTutorial.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                    {featuredTutorial.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{featuredTutorial.instructor}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{featuredTutorial.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{featuredTutorial.rating}</span>
                      </div>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Watch Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tutorial Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {selectedCategory === 'all' ? 'All Tutorials' : categories.find(c => c.id === selectedCategory)?.name}
          </h3>
          {filteredTutorials.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTutorials.map((tutorial) => (
                <div key={tutorial.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <img 
                      src={tutorial.thumbnail} 
                      alt={tutorial.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(tutorial.difficulty)}`}>
                        {tutorial.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                      {tutorial.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{tutorial.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{tutorial.instructor}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{tutorial.rating}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">({tutorial.views})</span>
                      </div>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                        Watch →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No tutorials found</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Try selecting a different category or check back later for new content.
              </p>
            </div>
          )}
        </div>

        {/* Learning Path */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recommended Learning Path</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Start with Basics</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Begin with "Getting Started with Thinklytics" to understand the platform and basic features.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Master Analytics</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Learn to interpret your data with "Understanding Your Analytics Dashboard."
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Focus on Weak Areas</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Use analytics to identify weak areas and watch targeted tutorials for those sections.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Advanced Strategies</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Once comfortable with basics, explore advanced tutorials for optimization strategies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of students who are already improving their SAT scores with our expert tutorials.
          </p>
          <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialsPage; 