import React from 'react';
import { ArrowLeft, TrendingUp, Target, Calendar, BookOpen, Award, Clock, BarChart3, Eye, Zap, Shield } from 'lucide-react';

const DashboardPage = ({ onBack }) => {
  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Track your performance across all SAT sections with detailed analytics that show your strengths and weaknesses. See your accuracy rates, question completion trends, and improvement over time."
    },
    {
      icon: Target,
      title: "Progress Tracking",
      description: "Monitor your study goals and achievements with visual progress indicators. Set weekly and monthly targets for questions logged, study time, and quiz completion."
    },
    {
      icon: TrendingUp,
      title: "Performance Insights",
      description: "Get intelligent insights about your learning patterns. Identify which question types you struggle with most and receive personalized recommendations for improvement."
    },
    {
      icon: Clock,
      title: "Study Time Analytics",
      description: "Track how much time you spend studying each section and optimize your study schedule. See patterns in your most productive study times and sessions."
    }
  ];

  const benefits = [
    {
      icon: Eye,
      title: "Visual Progress",
      description: "See your improvement over time with interactive charts and graphs that make it easy to understand your progress at a glance."
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate feedback on your performance with real-time updates and notifications about your achievements and areas for improvement."
    },
    {
      icon: Shield,
      title: "Data-Driven Decisions",
      description: "Make informed decisions about your study strategy based on comprehensive analytics and performance metrics."
    }
  ];

  const dashboardCapabilities = [
    "View your overall SAT score progression over time",
    "Analyze performance by section (Math, Reading, Writing)",
    "Track accuracy rates for different question types",
    "Monitor study time and session productivity",
    "Set and track personalized study goals",
    "Export your progress reports for college applications",
    "Compare your performance to target scores",
    "Identify patterns in your learning behavior"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Features</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <BarChart3 className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Personal
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Analytics Hub</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive dashboard provides you with deep insights into your SAT preparation journey. 
            Track your progress, identify areas for improvement, and make data-driven decisions to maximize your score potential.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Core Dashboard Features</h3>
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

        {/* Dashboard Capabilities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What You Can Do With Your Dashboard</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {dashboardCapabilities.map((capability, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Our Dashboard Works</h3>
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
          <h3 className="text-2xl font-bold mb-6">How the Dashboard Helps You Succeed</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">For Students</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li>• Understand your learning patterns and optimize study time</li>
                <li>• Focus on your weakest areas with targeted practice</li>
                <li>• Track improvement and stay motivated with visual progress</li>
                <li>• Make informed decisions about test preparation strategies</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">For Parents & Tutors</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li>• Monitor student progress and identify areas needing attention</li>
                <li>• Provide targeted support based on detailed analytics</li>
                <li>• Track study consistency and time management</li>
                <li>• Celebrate achievements and milestones together</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Getting Started with Your Dashboard</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Start Logging Questions</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Begin by logging your SAT practice questions. The more data you provide, the more accurate your analytics will be.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Review Your Analytics</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Check your dashboard regularly to see your progress, identify patterns, and understand your performance trends.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Adjust Your Strategy</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Use the insights from your dashboard to refine your study plan and focus on areas that need the most attention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 