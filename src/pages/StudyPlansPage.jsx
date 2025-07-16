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
            <h1 className="text-3xl font-bold homepage-text-primary">Study Plans</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl homepage-feature-icon mb-6">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Personalized
            <span className="homepage-gradient-text"> Study Plans</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Transform your SAT preparation with intelligent, personalized study plans that adapt to your learning style, 
            schedule, and goals. Our comprehensive planning system helps you study smarter, not harder.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">How Our Study Plans Work</h3>
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

        {/* Plan Types */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Types of Study Plans</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {planTypes.map((plan, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <h4 className="text-lg font-semibold homepage-text-primary mb-2">{plan.name}</h4>
                <p className="text-sm blue-gradient-text font-medium mb-3">{plan.duration}</p>
                <p className="homepage-text-secondary text-sm mb-4">{plan.description}</p>
                <p className="text-xs homepage-text-muted mb-4">Best for: {plan.bestFor}</p>
                <div className="space-y-2">
                  <h5 className="font-medium homepage-text-primary text-sm">Key Features:</h5>
                  <ul className="space-y-1">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs homepage-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Plan Capabilities */}
        <div className="homepage-card rounded-2xl shadow-xl p-8 mb-16 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6 text-center">What You Can Do With Study Plans</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {studyPlanCapabilities.map((capability, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                <span className="homepage-text-secondary">{capability}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Why Study Plans Work</h3>
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

        {/* How to Create a Study Plan */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white mb-16">
          <h3 className="text-2xl font-bold mb-6">How to Create Your Perfect Study Plan</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Step-by-Step Process</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-[var(--brand-60)] flex items-center justify-center font-bold text-sm">1</div>
                  <div>
                    <h5 className="font-medium mb-1">Assess Your Current Level</h5>
                    <p className="text-sm opacity-90">Take a diagnostic test to understand your strengths and weaknesses</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-[var(--brand-60)] flex items-center justify-center font-bold text-sm">2</div>
                  <div>
                    <h5 className="font-medium mb-1">Set Your Target Score</h5>
                    <p className="text-sm opacity-90">Define your goal score based on your college aspirations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-[var(--brand-60)] flex items-center justify-center font-bold text-sm">3</div>
                  <div>
                    <h5 className="font-medium mb-1">Choose Your Timeline</h5>
                    <p className="text-sm opacity-90">Select how much time you have until your test date</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-full bg-white text-[var(--brand-60)] flex items-center justify-center font-bold text-sm">4</div>
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
        <div className="homepage-card rounded-2xl shadow-xl p-8 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Ready to Start Your Study Plan?</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Log into Your Account</h4>
                <p className="homepage-text-secondary">
                  Access your personalized dashboard where you can create and manage your study plans.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Choose Your Plan Type</h4>
                <p className="homepage-text-secondary">
                  Select from our expert templates or create a custom plan based on your specific needs and timeline.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Follow Your Schedule</h4>
                <p className="homepage-text-secondary">
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