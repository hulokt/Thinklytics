import React from 'react';
import { ArrowLeft, Plus, Calendar, Target, BookOpen, Clock, CheckCircle, Edit3, Zap, Users, TrendingUp } from 'lucide-react';

const StudyPlansPage = ({ onBack }) => {
  const features = [
    {
      icon: Target,
      title: "Personalized Study Plans",
      description: "Create customized study plans based on your strengths, weaknesses, and target scores. Our AI analyzes your performance to suggest the most effective study strategies."
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Schedule your study sessions around your existing commitments. Set daily, weekly, or monthly goals that fit your lifestyle and learning pace."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your progress through each study plan with detailed analytics. See which areas you're improving in and where you need more focus."
    },
    {
      icon: Users,
      title: "Expert Templates",
      description: "Access pre-designed study plans created by SAT experts. Choose from quick review plans, comprehensive prep, or targeted weakness focus."
    }
  ];

  const planTypes = [
    {
      name: "Quick Review Plan",
      duration: "2-4 weeks",
      description: "Perfect for students with limited time who need to refresh key concepts before test day.",
      bestFor: "Students with 2-4 weeks until test day",
      features: ["Daily 30-minute sessions", "Focus on high-impact topics", "Practice test integration", "Progress checkpoints"]
    },
    {
      name: "Comprehensive Prep Plan",
      duration: "8-12 weeks",
      description: "Thorough preparation covering all SAT sections with detailed practice and review.",
      bestFor: "Students with 2-3 months to prepare",
      features: ["Daily 1-2 hour sessions", "Complete section coverage", "Regular practice tests", "Detailed analytics"]
    },
    {
      name: "Weakness Focus Plan",
      duration: "4-6 weeks",
      description: "Targeted practice on your weakest areas to maximize score improvement.",
      bestFor: "Students who know their weak areas",
      features: ["Customized content selection", "Intensive practice on weak topics", "Progress monitoring", "Adaptive difficulty"]
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Structured Learning",
      description: "Follow a proven study structure that ensures you cover all necessary topics systematically."
    },
    {
      icon: Clock,
      title: "Time Management",
      description: "Optimize your study time with efficient scheduling that fits your daily routine."
    },
    {
      icon: CheckCircle,
      title: "Goal Achievement",
      description: "Set clear, achievable goals and track your progress toward your target SAT score."
    }
  ];

  const studyPlanCapabilities = [
    "Create unlimited custom study plans",
    "Set personalized study goals and deadlines",
    "Track progress through each plan phase",
    "Receive notifications for scheduled sessions",
    "Adjust plans based on performance feedback",
    "Export study plans for offline reference",
    "Share plans with tutors or study partners",
    "Integrate with your question bank and quiz results"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Plans</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <Target className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Personalized
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Study Plans</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Transform your SAT preparation with intelligent, personalized study plans that adapt to your learning style, 
            schedule, and goals. Our comprehensive planning system helps you study smarter, not harder.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">How Our Study Plans Work</h3>
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

        {/* Plan Types */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Types of Study Plans</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {planTypes.map((plan, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">{plan.duration}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{plan.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Best for: {plan.bestFor}</p>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">Key Features:</h5>
                  <ul className="space-y-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Plan Capabilities */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">What You Can Do With Study Plans</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {studyPlanCapabilities.map((capability, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Why Study Plans Work</h3>
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

        {/* How to Create a Study Plan */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
          <h3 className="text-2xl font-bold mb-6">How to Create Your Perfect Study Plan</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Step-by-Step Process</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h5 className="font-medium mb-1">Assess Your Current Level</h5>
                    <p className="text-sm opacity-90">Take a diagnostic test to understand your strengths and weaknesses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h5 className="font-medium mb-1">Set Your Target Score</h5>
                    <p className="text-sm opacity-90">Define your goal score based on your college aspirations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h5 className="font-medium mb-1">Choose Your Timeline</h5>
                    <p className="text-sm opacity-90">Select how much time you have until your test date</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold text-sm">4</div>
                  <div>
                    <h5 className="font-medium mb-1">Get Your Custom Plan</h5>
                    <p className="text-sm opacity-90">Receive a personalized study plan tailored to your needs</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Tips for Success</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li>• Be realistic about your study time availability</li>
                <li>• Focus on your weakest areas first</li>
                <li>• Include regular practice tests in your plan</li>
                <li>• Review and adjust your plan as you progress</li>
                <li>• Stay consistent with your study schedule</li>
                <li>• Track your progress and celebrate milestones</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Ready to Start Your Study Plan?</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Log into Your Account</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Access your personalized dashboard where you can create and manage your study plans.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Choose Your Plan Type</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Select from our expert templates or create a custom plan based on your specific needs and timeline.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Follow Your Schedule</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Stick to your study plan and track your progress. Adjust as needed based on your performance and feedback.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlansPage; 