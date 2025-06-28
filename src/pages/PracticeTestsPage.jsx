import React from 'react';
import { ArrowLeft, Play, Clock, Target, BookOpen, CheckCircle, Edit3, Save, RotateCcw, BarChart3, Zap, Users } from 'lucide-react';

const PracticeTestsPage = ({ onBack }) => {
  const features = [
    {
      icon: BookOpen,
      title: "Custom Quiz Creation",
      description: "Create personalized practice tests from your question bank. Select specific topics, difficulty levels, and question types to target your weak areas."
    },
    {
      icon: Save,
      title: "Save Progress",
      description: "Never lose your work! Our system automatically saves your progress, so you can pause and resume tests at any time without losing your answers."
    },
    {
      icon: Edit3,
      title: "Answer Editing",
      description: "Review and edit your answers before submitting. Change your responses, flag questions for review, and ensure accuracy before finalizing your test."
    },
    {
      icon: BarChart3,
      title: "Detailed Analytics",
      description: "Get comprehensive feedback on your performance with detailed breakdowns by section, question type, and difficulty level."
    }
  ];

  const testTypes = [
    {
      name: "Section-Specific Tests",
      description: "Focus on individual SAT sections (Math, Reading, Writing) to master specific skills and concepts.",
      duration: "20-60 minutes",
      questions: "10-50 questions",
      bestFor: "Targeted practice on weak areas"
    },
    {
      name: "Full-Length Practice Tests",
      description: "Complete SAT simulations that mirror the actual test experience with proper timing and format.",
      duration: "3 hours",
      questions: "154 questions",
      bestFor: "Test day preparation and endurance"
    },
    {
      name: "Quick Review Tests",
      description: "Short, focused tests for quick review sessions or last-minute practice before study breaks.",
      duration: "10-30 minutes",
      questions: "5-20 questions",
      bestFor: "Daily practice and concept review"
    }
  ];

  const capabilities = [
    "Create unlimited custom practice tests",
    "Save tests in progress and resume later",
    "Edit answers before final submission",
    "Flag questions for later review",
    "Set custom time limits for each test",
    "Choose questions by difficulty level",
    "Filter by specific topics or question types",
    "Export test results and performance reports",
    "Compare performance across multiple tests",
    "Track improvement over time"
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Flexible Practice",
      description: "Practice on your own schedule with tests that adapt to your learning needs and time constraints."
    },
    {
      icon: Target,
      title: "Focused Improvement",
      description: "Target your weakest areas with customized tests designed to address specific skill gaps."
    },
    {
      icon: Users,
      title: "Real Test Experience",
      description: "Simulate actual test conditions to build confidence and improve time management skills."
    }
  ];

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Practice Tests</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <Play className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Master the SAT with
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Practice Tests</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Create personalized practice tests, save your progress, and edit answers as you go. Our comprehensive 
            testing system helps you build confidence and improve your SAT performance through targeted practice.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Practice Test Features</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test Types */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Types of Practice Tests</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testTypes.map((test, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{test.name}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{test.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">{test.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600 dark:text-gray-400">{test.questions}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Best for: {test.bestFor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What You Can Do With Practice Tests</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {capabilities.map((capability, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Practice Tests Work</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{benefit.title}</h4>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
          <h3 className="text-2xl font-bold mb-6">How Practice Tests Help You Succeed</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">For Test Preparation</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li>• Build familiarity with SAT question formats and timing</li>
                <li>• Identify and address knowledge gaps</li>
                <li>• Develop effective test-taking strategies</li>
                <li>• Improve time management skills</li>
                <li>• Build confidence through repeated practice</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Performance Tracking</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li>• Monitor improvement across different sections</li>
                <li>• Track progress on specific question types</li>
                <li>• Identify patterns in your performance</li>
                <li>• Set and achieve score improvement goals</li>
                <li>• Prepare detailed reports for college applications</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Use Practice Tests Effectively</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Create Your Test</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Select questions from your question bank based on the topics and difficulty levels you want to practice.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Take Your Time</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Work through the test at your own pace. You can save your progress and return to finish later if needed.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Review and Edit</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Before submitting, review all your answers and make any necessary changes. Flag questions you're unsure about.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Analyze Results</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Review your performance analytics to understand your strengths and areas for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeTestsPage; 