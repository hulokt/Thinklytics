import React from 'react';
import { ArrowLeft, BookOpen, BarChart3, Calendar, Target, Zap, Users, Shield, Smartphone, Globe } from 'lucide-react';

const FeaturesPage = ({ onBack }) => {
  const features = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Question Management",
      description: "Easily add, edit, and organize your SAT practice questions with detailed categorization by section, domain, and difficulty level.",
      color: "text-blue-600"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Quiz Creation",
      description: "Create custom quizzes from your question bank with intelligent filtering and selection tools.",
      color: "text-green-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Advanced Analytics",
      description: "Track your progress with detailed analytics, performance insights, and progress visualization.",
      color: "text-purple-600"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Study Planning",
      description: "Schedule practice sessions and track your study calendar with integrated planning tools.",
      color: "text-orange-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Progress",
      description: "Monitor your performance in real-time with instant feedback and progress tracking.",
      color: "text-yellow-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Features",
      description: "Connect with other students, share insights, and learn from the community.",
      color: "text-pink-600"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade security and privacy controls.",
      color: "text-red-600"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile Ready",
      description: "Access your study materials and take quizzes on any device, anywhere, anytime.",
      color: "text-indigo-600"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Cloud Sync",
      description: "Your progress syncs across all devices, so you never lose your study momentum.",
      color: "text-teal-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Features</h1>
                <p className="text-gray-600 dark:text-gray-400">Discover what makes Thinklytics powerful</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything you need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> ace the SAT</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Thinklytics provides comprehensive tools to help you master the SAT with intelligent practice, 
            detailed analytics, and personalized study planning.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to start your SAT journey?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already improving their scores with Thinklytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Get Started Free
            </button>
            <button
              onClick={() => window.location.href = '/about'}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage; 