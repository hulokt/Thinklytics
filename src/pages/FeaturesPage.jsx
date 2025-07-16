import React from 'react';
import { ArrowLeft, BarChart3, Target, BookOpen, Users, Clock, Award, Brain, Shield } from 'lucide-react';

const FeaturesPage = ({ onBack }) => {
  const features = [
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track your performance across all SAT sections with detailed analytics and insights.',
      benefits: ['Performance tracking', 'Weakness identification', 'Progress visualization']
    },
    {
      icon: Target,
      title: 'Personalized Study Plans',
      description: 'Get customized study recommendations based on your performance and goals.',
      benefits: ['Adaptive learning', 'Goal setting', 'Smart recommendations']
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Question Bank',
      description: 'Access thousands of high-quality SAT questions across all sections.',
      benefits: ['Official-style questions', 'Detailed explanations', 'Difficulty levels']
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Connect with other students and share study strategies.',
      benefits: ['Study groups', 'Discussion forums', 'Peer support']
    },
    {
      icon: Clock,
      title: 'Timed Practice Sessions',
      description: 'Practice with realistic time constraints to improve your pacing.',
      benefits: ['Real test conditions', 'Time management', 'Stamina building']
    },
    {
      icon: Award,
      title: 'Achievement System',
      description: 'Stay motivated with badges, streaks, and milestone rewards.',
      benefits: ['Progress rewards', 'Streak tracking', 'Motivation boosts']
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Get intelligent recommendations powered by machine learning.',
      benefits: ['Pattern recognition', 'Predictive analytics', 'Smart suggestions']
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security.',
      benefits: ['Data encryption', 'Privacy controls', 'Secure storage']
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      score: '1520',
      improvement: '+280 points',
      quote: 'The analytics feature helped me identify my weak areas and focus my study time effectively.',
      image: '/logo.png'
    },
    {
      name: 'Michael Chen',
      score: '1480',
      improvement: '+320 points',
      quote: 'The personalized study plans made all the difference in my preparation.',
      image: '/logo.png'
    },
    {
      name: 'Emily Rodriguez',
      score: '1560',
      improvement: '+240 points',
      quote: 'The community features kept me motivated throughout my entire prep journey.',
      image: '/logo.png'
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
            <h1 className="text-3xl font-bold homepage-text-primary">Features</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Powerful Features for
            <span className="homepage-gradient-text"> SAT Success</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Discover all the tools and features that make Thinklytics the most comprehensive 
            SAT preparation platform available.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
              <div className="w-12 h-12 rounded-lg homepage-feature-icon flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold homepage-text-primary mb-3">{feature.title}</h3>
              <p className="homepage-text-secondary mb-4">{feature.description}</p>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full"></div>
                    <span className="homepage-text-secondary text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-12 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                1
              </div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Sign Up & Set Goals</h4>
              <p className="homepage-text-secondary">
                Create your account and set your target SAT score to get personalized recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Practice & Track</h4>
              <p className="homepage-text-secondary">
                Log your practice questions and take timed quizzes to build your skills and confidence.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full homepage-feature-icon flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Analyze & Improve</h4>
              <p className="homepage-text-secondary">
                Review your analytics to identify weak areas and adjust your study plan accordingly.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="homepage-card rounded-xl p-8 shadow-lg mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Platform Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold blue-gradient-text mb-2">15,000+</div>
              <div className="text-sm homepage-text-secondary">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold blue-gradient-text mb-2">50,000+</div>
              <div className="text-sm homepage-text-secondary">Questions Solved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold blue-gradient-text mb-2">280+</div>
              <div className="text-sm homepage-text-secondary">Avg. Score Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold blue-gradient-text mb-2">95%</div>
              <div className="text-sm homepage-text-secondary">Student Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-12 text-center">What Students Say</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold homepage-text-primary">{testimonial.name}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="blue-gradient-text font-medium">{testimonial.score}</span>
                      <span className="homepage-text-secondary">({testimonial.improvement})</span>
                    </div>
                  </div>
                </div>
                <p className="homepage-text-secondary italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Experience These Features?</h3>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of students who are already using Thinklytics to achieve their SAT goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[var(--brand-60)] hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
              Start Free Trial
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-medium transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage; 