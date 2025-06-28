import React from 'react';
import { ArrowLeft, Users, MessageCircle, Trophy, Calendar, BookOpen, Heart, Star, TrendingUp, Award } from 'lucide-react';

const CommunityPage = ({ onBack }) => {
  const communityFeatures = [
    {
      icon: MessageCircle,
      title: "Study Groups",
      description: "Join or create study groups with students preparing for the same SAT sections. Share strategies, ask questions, and motivate each other."
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description: "Compete with peers on weekly and monthly leaderboards. Track your progress and celebrate achievements together."
    },
    {
      icon: Calendar,
      title: "Study Challenges",
      description: "Participate in themed study challenges and competitions. Earn badges and recognition for your dedication."
    },
    {
      icon: BookOpen,
      title: "Resource Sharing",
      description: "Share helpful study materials, tips, and strategies with the community. Learn from others' experiences."
    }
  ];

  const communityStats = [
    { icon: Users, value: "15,000+", label: "Active Students" },
    { icon: MessageCircle, value: "50,000+", label: "Messages Shared" },
    { icon: Trophy, value: "1,200+", label: "Study Groups" },
    { icon: Star, value: "95%", label: "Satisfaction Rate" }
  ];

  const upcomingEvents = [
    {
      title: "Math Mastery Challenge",
      date: "December 20, 2024",
      time: "2:00 PM EST",
      participants: "1,200+",
      type: "Competition"
    },
    {
      title: "Reading Comprehension Workshop",
      date: "December 22, 2024",
      time: "3:00 PM EST",
      participants: "800+",
      type: "Workshop"
    },
    {
      title: "Writing & Language Study Group",
      date: "December 24, 2024",
      time: "4:00 PM EST",
      participants: "600+",
      type: "Study Group"
    }
  ];

  const successStories = [
    {
      name: "Sarah M.",
      score: "1520",
      improvement: "+180 points",
      story: "The community helped me stay motivated and provided amazing study tips. I improved my score by 180 points!"
    },
    {
      name: "Michael R.",
      score: "1480",
      improvement: "+220 points",
      story: "Joining study groups was a game-changer. The accountability and support made all the difference."
    },
    {
      name: "Emily W.",
      score: "1550",
      improvement: "+150 points",
      story: "The challenges kept me engaged and the leaderboards pushed me to study harder. Highly recommend!"
    }
  ];

  const communityGuidelines = [
    "Be respectful and supportive of all community members",
    "Share accurate and helpful information",
    "Respect others' privacy and personal information",
    "No spam, advertising, or inappropriate content",
    "Encourage and motivate fellow students",
    "Report any violations to community moderators"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Community</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Join Our
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Community</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Connect with thousands of students preparing for the SAT. Share strategies, participate in challenges, 
            and motivate each other to achieve your goals.
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {communityStats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
                <stat.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Community Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Community Features</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {communityFeatures.map((feature, index) => (
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

        {/* Upcoming Events */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upcoming Community Events</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{event.title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{event.date} at {event.time}</span>
                    <span>•</span>
                    <span>{event.participants} participants</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-full">
                    {event.type}
                  </span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Success Stories</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{story.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-green-600">{story.score}</span>
                      <span className="text-sm text-green-600 font-medium">({story.improvement})</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm italic">"{story.story}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-white mb-6">Community Guidelines</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {communityGuidelines.map((guideline, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Heart className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span className="text-sm text-white opacity-90">{guideline}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Getting Started with the Community</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Complete Your Profile</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Add your target score, study goals, and interests to connect with like-minded students.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Join Study Groups</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Browse available study groups or create your own based on your specific needs and schedule.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Participate in Challenges</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Join weekly challenges and competitions to stay motivated and track your progress.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Share and Learn</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Contribute to the community by sharing your strategies and learning from others' experiences.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 