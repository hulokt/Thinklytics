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
            <h1 className="text-3xl font-bold homepage-text-primary">Practice Tests</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl homepage-feature-icon mb-6">
            <Play className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Master the SAT with
            <span className="homepage-gradient-text"> Practice Tests</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Create personalized practice tests, save your progress, and edit answers as you go. Our comprehensive 
            testing system helps you build confidence and improve your SAT performance through targeted practice.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Practice Test Features</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg homepage-feature-icon flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold homepage-text-primary">{feature.title}</h4>
                </div>
                <p className="homepage-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Test Types */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Types of Practice Tests</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testTypes.map((test, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <h4 className="text-lg font-semibold homepage-text-primary mb-2">{test.name}</h4>
                <p className="homepage-text-secondary text-sm mb-4">{test.description}</p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="w-4 h-4 text-[var(--brand-60)]" />
                    <span className="homepage-text-muted">{test.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="w-4 h-4 text-[var(--brand-60)]" />
                    <span className="homepage-text-muted">{test.questions}</span>
                  </div>
                </div>
                <p className="text-xs homepage-text-muted">Best for: {test.bestFor}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div className="homepage-card rounded-2xl shadow-xl p-8 mb-16 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6 text-center">What You Can Do With Practice Tests</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {capabilities.map((capability, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2 flex-shrink-0"></div>
                <span className="homepage-text-secondary">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Why Practice Tests Work</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg text-center homepage-hover-glow">
                <div className="w-16 h-16 rounded-xl homepage-feature-icon flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold homepage-text-primary mb-3">{benefit.title}</h4>
                <p className="homepage-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white mb-16">
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
        <div className="homepage-card rounded-2xl shadow-xl p-8 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">How to Use Practice Tests Effectively</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Create Your Test</h4>
                <p className="homepage-text-secondary">
                  Select questions from your question bank based on the topics and difficulty levels you want to practice.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Take Your Time</h4>
                <p className="homepage-text-secondary">
                  Work through the test at your own pace. You can save your progress and return to finish later if needed.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Review and Edit</h4>
                <p className="homepage-text-secondary">
                  Before submitting, review all your answers and make any necessary changes. Flag questions you're unsure about.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon text-white flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Analyze Results</h4>
                <p className="homepage-text-secondary">
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