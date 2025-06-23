import React from 'react';
import { CheckCircle, Target, TrendingUp, Edit3, BookOpen, Award, Star } from 'lucide-react';
import DarkModeToggle from './ui/DarkModeToggle';

const Homepage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Redomind
              </h1>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <DarkModeToggle />
              <button
                onClick={onLogin}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 sm:px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200/50 dark:border-gray-700/50 mb-6 transition-colors duration-300">
              <Star className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Trusted by 10,000+ Students</span>
            </div>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 leading-tight transition-colors duration-300">
            Track Your SAT Mistakes and
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              Improve Fast
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0 transition-colors duration-300">
            Log your wrong answers, review question types, and turn mistakes into mastery with AI-powered insights and personalized practice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4 sm:px-0">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:shadow-lg transition-all duration-300 text-base sm:text-lg font-semibold w-full sm:w-auto"
            >
              Get Started Free
            </button>
            <button
              onClick={onLogin}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-600 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg transition-all duration-300 text-base sm:text-lg font-semibold w-full sm:w-auto"
            >
              Login
            </button>
          </div>
          
          {/* Simple stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">150+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Point Improvement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">10k+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Happy Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">98%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              Why Log Your Answers?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
              Transform your mistakes into your biggest advantage with strategic error tracking.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                Icon: TrendingUp,
                title: "Track Progress",
                description: "Monitor your improvement over time and see how your accuracy increases with targeted practice.",
                color: "from-blue-500 to-blue-600"
              },
              {
                Icon: Target,
                title: "Spot Weak Areas", 
                description: "Identify patterns in your mistakes to focus your study time on the topics that need the most work.",
                color: "from-green-500 to-green-600"
              },
              {
                Icon: Award,
                title: "Master Tricky Concepts",
                description: "Turn your biggest challenges into strengths by reviewing and practicing problem areas repeatedly.",
                color: "from-purple-500 to-purple-600"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-600"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <item.Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed transition-colors duration-300">
              Simple steps to transform your SAT preparation and boost your scores.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: 1,
                Icon: Edit3,
                title: "Log Wrong Answers",
                description: "Quickly input questions you got wrong, including the passage, question, and correct answer.",
                color: "from-blue-600 to-indigo-700"
              },
              {
                number: 2,
                Icon: BookOpen,
                title: "Build Smart Quizzes",
                description: "Create custom practice quizzes from your logged questions to focus on your weak areas.",
                color: "from-green-600 to-emerald-700"
              },
              {
                number: 3,
                Icon: CheckCircle,
                title: "Review and Improve", 
                description: "Take your custom quizzes, track your progress, and watch your SAT scores improve.",
                color: "from-purple-600 to-violet-700"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl shadow-lg`}>
                    {item.number}
                  </div>
                  <div className="mb-6">
                    <item.Icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mx-auto transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-300">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Improve Your SAT Score?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who have already improved their scores with strategic mistake tracking.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-gray-50 hover:shadow-lg transition-all duration-300 text-lg font-bold w-full sm:w-auto"
            >
              Start Free Today
            </button>
            <button
              onClick={onLogin}
              className="bg-transparent border-2 border-white text-white px-8 sm:px-10 py-4 sm:py-5 rounded-2xl hover:bg-white/10 backdrop-blur-sm hover:shadow-lg transition-all duration-300 text-lg font-bold w-full sm:w-auto"
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12 sm:py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Redomind</span>
            </div>
            
            <div className="flex space-x-6 sm:space-x-8 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Redomind. All rights reserved. Made with ❤️ for students everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage; 