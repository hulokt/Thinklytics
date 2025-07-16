import React from 'react';
import { ArrowLeft, TrendingUp, Users, BookOpen, Award, Calendar, Clock, Target } from 'lucide-react';

const DashboardPage = ({ onBack }) => {
  const stats = [
    { icon: Users, value: '15,247', label: 'Total Students', change: '+12%' },
    { icon: BookOpen, value: '3,891', label: 'Active Sessions', change: '+8%' },
    { icon: Award, value: '89%', label: 'Avg. Score Improvement', change: '+3%' },
    { icon: Target, value: '1,420', label: 'Avg. Score Increase', change: '+15%' }
  ];

  const recentActivity = [
    {
      type: 'quiz_completed',
      user: 'Sarah Johnson',
      action: 'completed Math Quiz #12',
      score: '92%',
      time: '2 hours ago'
    },
    {
      type: 'high_score',
      user: 'Michael Chen',
      action: 'achieved new high score',
      score: '1540',
      time: '3 hours ago'
    },
    {
      type: 'study_streak',
      user: 'Emily Rodriguez',
      action: 'reached 30-day study streak',
      score: null,
      time: '5 hours ago'
    },
    {
      type: 'question_added',
      user: 'Alex Thompson',
      action: 'added 15 new questions',
      score: null,
      time: '1 day ago'
    }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', score: 1580, improvement: '+340' },
    { name: 'Michael Chen', score: 1540, improvement: '+290' },
    { name: 'Emily Rodriguez', score: 1520, improvement: '+280' },
    { name: 'Alex Thompson', score: 1510, improvement: '+270' },
    { name: 'Jessica Lee', score: 1500, improvement: '+260' }
  ];

  const upcomingFeatures = [
    {
      title: 'AI-Powered Question Generation',
      description: 'Automatically generate practice questions based on user performance',
      status: 'In Development',
      eta: 'Q1 2025'
    },
    {
      title: 'Advanced Analytics Dashboard',
      description: 'Enhanced reporting and insights for educators and administrators',
      status: 'Planning',
      eta: 'Q2 2025'
    },
    {
      title: 'Mobile App Launch',
      description: 'Native iOS and Android applications for on-the-go studying',
      status: 'Design Phase',
      eta: 'Q3 2025'
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
            <h1 className="text-3xl font-bold homepage-text-primary">Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold homepage-text-primary mb-4">
            Platform
            <span className="homepage-gradient-text"> Overview</span>
          </h2>
          <p className="text-lg homepage-text-secondary max-w-2xl mx-auto">
            Monitor platform performance, user engagement, and key metrics in real-time.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="homepage-card p-6 rounded-xl shadow-lg homepage-hover-glow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg homepage-feature-icon flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold homepage-text-primary mb-1">{stat.value}</div>
              <div className="text-sm homepage-text-secondary">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="homepage-card rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold homepage-text-primary mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 rounded-full homepage-feature-icon flex items-center justify-center">
                      {activity.type === 'quiz_completed' && <BookOpen className="w-5 h-5 text-white" />}
                      {activity.type === 'high_score' && <Award className="w-5 h-5 text-white" />}
                      {activity.type === 'study_streak' && <TrendingUp className="w-5 h-5 text-white" />}
                      {activity.type === 'question_added' && <Target className="w-5 h-5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold homepage-text-primary">{activity.user}</span>
                        <span className="homepage-text-secondary">{activity.action}</span>
                        {activity.score && (
                          <span className="blue-gradient-text font-medium">({activity.score})</span>
                        )}
                      </div>
                      <div className="text-sm homepage-text-secondary mt-1">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div>
            <div className="homepage-card rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold homepage-text-primary mb-6">Top Performers</h3>
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold homepage-text-primary">{performer.name}</div>
                        <div className="text-sm homepage-text-secondary">{performer.improvement}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold blue-gradient-text">
                      {performer.score}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Features */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Upcoming Features</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingFeatures.map((feature, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold homepage-text-primary">{feature.title}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    feature.status === 'In Development' ? 'bg-blue-100 text-blue-700' :
                    feature.status === 'Planning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {feature.status}
                  </span>
                </div>
                <p className="homepage-text-secondary mb-4">{feature.description}</p>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 homepage-text-secondary" />
                  <span className="text-sm homepage-text-secondary">ETA: {feature.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 homepage-card rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6 text-center">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="homepage-cta-primary text-white p-4 rounded-lg font-medium hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Manage Users</span>
            </button>
            <button className="homepage-cta-secondary p-4 rounded-lg font-medium hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Content Library</span>
            </button>
            <button className="homepage-cta-secondary p-4 rounded-lg font-medium hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button className="homepage-cta-secondary p-4 rounded-lg font-medium hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Reports</span>
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12 blue-gradient-bg rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">System Status</h3>
          <p className="text-lg mb-6 opacity-90">
            All systems are operational and running smoothly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Database: Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>API: Healthy</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>CDN: Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Monitoring: Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 