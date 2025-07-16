import React, { useState } from 'react';
import { ArrowLeft, Users, MessageSquare, Star, Calendar, Award, ChevronRight } from 'lucide-react';

const CommunityPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { icon: Users, value: '15,000+', label: 'Active Members' },
    { icon: MessageSquare, value: '50,000+', label: 'Discussions' },
    { icon: Star, value: '98%', label: 'Satisfaction Rate' },
    { icon: Award, value: '2,500+', label: 'Success Stories' }
  ];

  const features = [
    {
      icon: MessageSquare,
      title: 'Discussion Forums',
      description: 'Connect with fellow students, share strategies, and get help with challenging questions.'
    },
    {
      icon: Users,
      title: 'Study Groups',
      description: 'Join or create study groups with students who share your goals and schedule.'
    },
    {
      icon: Star,
      title: 'Peer Reviews',
      description: 'Get feedback on your practice essays and help others improve their writing.'
    },
    {
      icon: Award,
      title: 'Success Stories',
      description: 'Share your achievements and get inspired by others who have reached their goals.'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'SAT Math Strategy Workshop',
      date: 'Dec 20, 2024',
      time: '7:00 PM EST',
      attendees: 145,
      type: 'Workshop'
    },
    {
      id: 2,
      title: 'College Application Q&A',
      date: 'Dec 22, 2024',
      time: '6:00 PM EST',
      attendees: 89,
      type: 'Q&A'
    },
    {
      id: 3,
      title: 'Study Group Meetup',
      date: 'Dec 25, 2024',
      time: '4:00 PM EST',
      attendees: 32,
      type: 'Study Group'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      score: '1520',
      improvement: '+280 points',
      quote: 'The community support was incredible. I got help with every question and made lifelong friends!',
      image: '/logo.png'
    },
    {
      name: 'Michael Chen',
      score: '1480',
      improvement: '+320 points',
      quote: 'Study groups kept me motivated and accountable. I couldn\'t have done it without this community.',
      image: '/logo.png'
    },
    {
      name: 'Emily Rodriguez',
      score: '1560',
      improvement: '+240 points',
      quote: 'The peer review feature helped me improve my essay writing significantly.',
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
            <h1 className="text-3xl font-bold homepage-text-primary">Community</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Join Our Learning
            <span className="homepage-gradient-text"> Community</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Connect with thousands of students preparing for the SAT. Share strategies, 
            ask questions, and celebrate successes together.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl homepage-feature-icon mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold homepage-text-primary mb-2">{stat.value}</div>
              <div className="text-sm homepage-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Community Features</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg homepage-feature-icon flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold homepage-text-primary mb-2">{feature.title}</h4>
                    <p className="homepage-text-secondary">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {['overview', 'events', 'testimonials'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'homepage-cta-primary text-white'
                    : 'homepage-card homepage-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="homepage-card rounded-2xl shadow-xl p-8">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-2xl font-bold homepage-text-primary mb-6">Getting Started</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold homepage-text-primary mb-4">Join the Discussion</h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                      <div>
                        <h5 className="font-medium homepage-text-primary">Create Your Profile</h5>
                        <p className="homepage-text-secondary text-sm">Set up your profile and share your SAT goals</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                      <div>
                        <h5 className="font-medium homepage-text-primary">Find Your Community</h5>
                        <p className="homepage-text-secondary text-sm">Browse forums and find discussions that interest you</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                      <div>
                        <h5 className="font-medium homepage-text-primary">Start Contributing</h5>
                        <p className="homepage-text-secondary text-sm">Ask questions, share insights, and help others</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold homepage-text-primary mb-4">Community Guidelines</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="homepage-text-secondary text-sm">Be respectful and supportive</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="homepage-text-secondary text-sm">Share helpful resources and tips</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="homepage-text-secondary text-sm">Keep discussions focused on SAT prep</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="homepage-text-secondary text-sm">Celebrate each other's successes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <h3 className="text-2xl font-bold homepage-text-primary mb-6">Upcoming Events</h3>
              <div className="space-y-6">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold homepage-text-primary mb-2">{event.title}</h4>
                        <div className="flex items-center space-x-4 text-sm homepage-text-secondary">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{event.date}</span>
                          </div>
                          <span>{event.time}</span>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{event.attendees} attending</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-4 md:mt-0">
                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 homepage-text-secondary text-sm">
                          {event.type}
                        </span>
                        <button className="homepage-cta-primary text-white px-6 py-2 rounded-lg font-medium hover:shadow-xl transition-all duration-200">
                          Join Event
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'testimonials' && (
            <div>
              <h3 className="text-2xl font-bold homepage-text-primary mb-6">Success Stories</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
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
                    <p className="homepage-text-secondary text-sm italic">"{testimonial.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-16 blue-gradient-bg rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
          <p className="text-lg mb-6 opacity-90">
            Become part of a supportive community that's helped thousands of students achieve their SAT goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[var(--brand-60)] hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <span>Join Community</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-medium transition-colors">
              Browse Forums
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 