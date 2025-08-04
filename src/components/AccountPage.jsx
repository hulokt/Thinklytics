import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuestionAnswers } from '../hooks/useUserData';
import { useQuizManager } from './QuizManager';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Edit2, 
  Save, 
  X, 
  Settings,
  Bell,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Clock,
  Target,
  TrendingUp,
  Award,
  Activity,
  Database,
  FileText,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const AccountPage = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const { completedQuizzes } = useQuizManager();
  const { data: questionAnswers } = useQuestionAnswers();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    joinDate: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: 'en',
    notifications: {
      email: true,
      weekly: true,
      achievements: true,
      reminders: true
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    questionsLogged: 0,
    quizzesCompleted: 0,
    averageScore: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    bestStreak: 0,
    accuracyRate: 0,
    improvementRate: 0
  });

  useEffect(() => {
    if (user) {
      const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
      setUserData({
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        joinDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'en',
        notifications: {
          email: true,
          weekly: true,
          achievements: true,
          reminders: true
        }
      });
    }
  }, [user]);

  // Calculate comprehensive statistics
  useEffect(() => {
    if (completedQuizzes !== undefined && questionAnswers !== undefined) {
      const completedArray = Array.isArray(completedQuizzes) ? completedQuizzes : [];
      const questionAnswersObj = questionAnswers && typeof questionAnswers === 'object' ? questionAnswers : {};

      // Calculate average score from completed quizzes
      const avgScore = completedArray.length > 0
        ? Math.round(
            completedArray.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / completedArray.length
          )
        : 0;

      // Count questions answered (unique questions)
      const questionsAnswered = Object.keys(questionAnswersObj).length;

      // Calculate total study time (sum of all quiz timeSpent values)
      const totalStudyTime = completedArray.reduce((total, quiz) => total + (quiz.timeSpent || 0), 0);

      // Calculate accuracy rate from question answers
      const allAnswers = Object.values(questionAnswersObj).flat();
      const totalAnswers = allAnswers.length;
      const correctAnswers = allAnswers.filter(answer => answer.isCorrect).length;
      const accuracyRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      // Calculate improvement rate (compare recent vs older quizzes)
      const recentQuizzes = completedArray.slice(-5);
      const olderQuizzes = completedArray.slice(-10, -5);
      const recentAvg = recentQuizzes.length > 0 ? recentQuizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / recentQuizzes.length : 0;
      const olderAvg = olderQuizzes.length > 0 ? olderQuizzes.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / olderQuizzes.length : 0;
      const improvementRate = olderAvg > 0 ? Math.round(((recentAvg - olderAvg) / olderAvg) * 100) : 0;

      // Calculate real streaks based on quiz completion dates
      const calculateStreaks = () => {
        if (completedArray.length === 0) return { currentStreak: 0, bestStreak: 0 };

        // Get unique dates when quizzes were completed
        const quizDates = completedArray
          .map(quiz => {
            const date = new Date(quiz.completedAt || quiz.createdAt || Date.now());
            return date.toDateString(); // Get just the date part
          })
          .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
          .sort(); // Sort chronologically

        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        // Calculate streaks
        for (let i = 0; i < quizDates.length; i++) {
          const currentDate = new Date(quizDates[i]);
          const previousDate = i > 0 ? new Date(quizDates[i - 1]) : null;

          if (i === 0 || (previousDate && isConsecutiveDay(previousDate, currentDate))) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }

          // Check if this is the current streak (last date is today or yesterday)
          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (currentDate.toDateString() === today.toDateString() || 
              currentDate.toDateString() === yesterday.toDateString()) {
            currentStreak = tempStreak;
          }

          bestStreak = Math.max(bestStreak, tempStreak);
        }

        // If no recent activity, current streak is 0
        if (currentStreak === 0 && tempStreak > 0) {
          const lastQuizDate = new Date(quizDates[quizDates.length - 1]);
          const today = new Date();
          const daysSinceLastQuiz = Math.floor((today - lastQuizDate) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastQuiz <= 1) {
            currentStreak = tempStreak;
          }
        }

        return { currentStreak, bestStreak };
      };

      const { currentStreak, bestStreak } = calculateStreaks();

      setStats({
        questionsLogged: questionsAnswered,
        quizzesCompleted: completedArray.length,
        averageScore: avgScore,
        totalStudyTime,
        currentStreak,
        bestStreak,
        accuracyRate,
        improvementRate
      });
    }
  }, [completedQuizzes, questionAnswers]);

  // Helper function to check if two dates are consecutive days
  const isConsecutiveDay = (date1, date2) => {
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  };

  // Calculate real achievements based on user data
  const getRealAchievements = () => {
    const achievements = [];
    
    // Check for perfect score achievement
    const hasPerfectScore = completedQuizzes?.some(quiz => quiz.score === 100);
    if (hasPerfectScore) {
      achievements.push({
        id: 'perfect-score',
        title: 'First Perfect Score',
        description: 'Achieved 100% on a quiz',
        icon: CheckCircle,
        color: 'green',
        unlocked: true
      });
    }

    // Check for streak achievements
    if (stats.currentStreak >= 7) {
      achievements.push({
        id: 'week-streak',
        title: '7-Day Streak',
        description: `Studied for ${stats.currentStreak} consecutive days`,
        icon: Activity,
        color: 'blue',
        unlocked: true
      });
    }

    if (stats.bestStreak >= 30) {
      achievements.push({
        id: 'month-streak',
        title: '30-Day Streak',
        description: `Maintained a ${stats.bestStreak}-day study streak`,
        icon: Activity,
        color: 'purple',
        unlocked: true
      });
    }

    // Check for question master achievement
    if (stats.questionsLogged >= 100) {
      achievements.push({
        id: 'question-master',
        title: 'Question Master',
        description: `Answered ${stats.questionsLogged}+ questions`,
        icon: Target,
        color: 'purple',
        unlocked: true
      });
    } else if (stats.questionsLogged >= 50) {
      achievements.push({
        id: 'question-apprentice',
        title: 'Question Apprentice',
        description: `Answered ${stats.questionsLogged} questions`,
        icon: Target,
        color: 'blue',
        unlocked: true
      });
    }

    // Check for quiz completion achievements
    if (stats.quizzesCompleted >= 50) {
      achievements.push({
        id: 'quiz-master',
        title: 'Quiz Master',
        description: `Completed ${stats.quizzesCompleted} quizzes`,
        icon: CheckCircle,
        color: 'green',
        unlocked: true
      });
    } else if (stats.quizzesCompleted >= 10) {
      achievements.push({
        id: 'quiz-enthusiast',
        title: 'Quiz Enthusiast',
        description: `Completed ${stats.quizzesCompleted} quizzes`,
        icon: CheckCircle,
        color: 'blue',
        unlocked: true
      });
    }

    // Check for accuracy achievement
    if (stats.accuracyRate >= 90) {
      achievements.push({
        id: 'accuracy-master',
        title: 'Accuracy Master',
        description: `Maintained ${stats.accuracyRate}% accuracy`,
        icon: Target,
        color: 'green',
        unlocked: true
      });
    } else if (stats.accuracyRate >= 80) {
      achievements.push({
        id: 'accuracy-expert',
        title: 'Accuracy Expert',
        description: `Maintained ${stats.accuracyRate}% accuracy`,
        icon: Target,
        color: 'blue',
        unlocked: true
      });
    }

    // Check for improvement achievement
    if (stats.improvementRate > 0) {
      achievements.push({
        id: 'improvement',
        title: 'On the Rise',
        description: `Improved by ${stats.improvementRate}%`,
        icon: TrendingUp,
        color: 'green',
        unlocked: true
      });
    }

    // If no achievements unlocked yet, show motivational ones
    if (achievements.length === 0) {
      achievements.push({
        id: 'first-quiz',
        title: 'First Steps',
        description: 'Complete your first quiz to unlock achievements',
        icon: Target,
        color: 'gray',
        unlocked: false
      });
    }

    return achievements.slice(0, 3); // Show top 3 achievements
  };

  const handleEdit = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setUserData(tempData);
    setIsEditing(false);
    // User profile update would be implemented here
  };

  const handleCancel = () => {
    setTempData({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNotificationToggle = (type) => {
    setUserData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (!userData.name) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading account information...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'data', label: 'Data & Privacy', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
                <p className="text-blue-100 text-lg">{userData.email}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Premium Member
                  </span>
                  <span className="text-blue-100 text-sm">
                    Member since {formatDate(userData.joinDate)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-5 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Total Questions</p>
                      <p className="text-3xl font-bold">{stats.questionsLogged}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Quizzes Completed</p>
                      <p className="text-3xl font-bold">{stats.quizzesCompleted}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Average Score</p>
                      <p className="text-3xl font-bold">{stats.averageScore}%</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-200" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Study Time</p>
                      <p className="text-3xl font-bold">{formatTime(stats.totalStudyTime)}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>

              {/* Performance Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                    Performance Insights
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Accuracy Rate</span>
                      <span className="font-semibold text-green-600">{stats.accuracyRate}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Improvement Rate</span>
                      <span className={`font-semibold ${stats.improvementRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.improvementRate >= 0 ? '+' : ''}{stats.improvementRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Current Streak</span>
                      <span className="font-semibold text-blue-600">{stats.currentStreak} days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">Best Streak</span>
                      <span className="font-semibold text-purple-600">{stats.bestStreak} days</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-500" />
                    Recent Achievements
                  </h3>
                  <div className="space-y-3">
                    {getRealAchievements().map((achievement, index) => {
                      const Icon = achievement.icon;
                      const getColorClasses = (color) => {
                        switch (color) {
                          case 'green':
                            return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
                          case 'blue':
                            return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
                          case 'purple':
                            return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400';
                          case 'gray':
                            return 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400';
                          default:
                            return 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400';
                        }
                      };
                      
                      return (
                        <div key={achievement.id} className={`flex items-center space-x-3 p-3 bg-white dark:bg-gray-600 rounded-lg ${!achievement.unlocked ? 'opacity-60' : ''}`}>
                          <div className={`w-8 h-8 ${getColorClasses(achievement.color)} rounded-full flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`font-medium text-gray-900 dark:text-white ${!achievement.unlocked ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                              {achievement.title}
                            </p>
                            <p className={`text-sm ${achievement.unlocked ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
                              {achievement.description}
                            </p>
                          </div>
                          {achievement.unlocked && (
                            <div className="ml-auto">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Settings */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempData.name || ''}
                        onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter your display name"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white">
                        {userData.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-400">
                      {userData.email}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Timezone</label>
                    <select
                      value={userData.timezone}
                      onChange={(e) => setUserData({ ...userData, timezone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                    <select
                      value={userData.language}
                      onChange={(e) => setUserData({ ...userData, language: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Security & Privacy</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Export */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Download className="w-5 h-5 mr-2 text-blue-500" />
                    Export Your Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    Download all your study data, including questions, quiz results, and analytics.
                  </p>
                  <div className="space-y-2">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 text-sm">
                      <Download className="w-4 h-4" />
                      <span>Export All Data (JSON)</span>
                    </button>
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 text-sm">
                      <FileText className="w-4 h-4" />
                      <span>Export Questions (CSV)</span>
                    </button>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 text-sm">
                      <Database className="w-4 h-4" />
                      <span>Export Analytics Report (PDF)</span>
                    </button>
                  </div>
                </div>

                {/* Data Import */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Upload className="w-5 h-5 mr-2 text-green-500" />
                    Import Data
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    Import questions and data from other sources or backup files.
                  </p>
                  <div className="space-y-2">
                    <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 text-sm">
                      <Upload className="w-4 h-4" />
                      <span>Import Questions (CSV)</span>
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 text-sm">
                      <Database className="w-4 h-4" />
                      <span>Import Backup (JSON)</span>
                    </button>
                  </div>
                </div>

                {/* Data Management */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Trash2 className="w-5 h-5 mr-2 text-red-500" />
                    Data Management
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    Manage and clean up your data. These actions cannot be undone.
                  </p>
                  <div className="space-y-2">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 text-sm">
                      <Trash2 className="w-4 h-4" />
                      <span>Delete All Quiz History</span>
                    </button>
                    <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Delete Account</span>
                    </button>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-500" />
                    Privacy Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    Control how your data is used and shared.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Data Analytics</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Allow anonymous usage analytics</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Public Profile</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Show profile in leaderboards</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-500" />
                  Notification Preferences
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Choose which notifications you'd like to receive and how you'd like to receive them.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates about your progress via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={userData.notifications.email}
                        onChange={() => handleNotificationToggle('email')}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Weekly Progress Reports</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get weekly summaries of your study progress</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={userData.notifications.weekly}
                        onChange={() => handleNotificationToggle('weekly')}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Achievement Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you unlock achievements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={userData.notifications.achievements}
                        onChange={() => handleNotificationToggle('achievements')}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Study Reminders</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive gentle reminders to study</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={userData.notifications.reminders}
                        onChange={() => handleNotificationToggle('reminders')}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 