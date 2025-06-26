import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuestionAnswers } from '../hooks/useUserData';
import { useQuizManager } from './QuizManager';
import { User, Mail, Calendar, Shield, Edit2, Save, X, ArrowLeft } from 'lucide-react';

const AccountPage = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const { completedQuizzes } = useQuizManager();
  const { data: questionAnswers } = useQuestionAnswers();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    joinDate: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempData, setTempData] = useState({});
  const [stats, setStats] = useState({
    questionsLogged: 0,
    quizzesCompleted: 0,
    averageScore: 0
  });

  useEffect(() => {
    if (user) {
      const joinDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown';
      setUserData({
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        joinDate
      });
    }
  }, [user]);

  // Calculate real statistics
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

      // Count questions answered (keys in questionAnswers)
      const questionsAnswered = Object.keys(questionAnswersObj).length;

      setStats({
        questionsLogged: questionsAnswered,
        quizzesCompleted: completedArray.length,
        averageScore: avgScore,
      });
    }
  }, [completedQuizzes, questionAnswers]);

  const handleEdit = () => {
    setTempData({ ...userData });
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Note: In a real implementation, you would update the user profile via Supabase
    // For now, we'll just update the local state
    setUserData(tempData);
    setIsEditing(false);
    
    // TODO: Implement actual user profile update via Supabase
    console.log('User profile update would be implemented here:', tempData);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!userData.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      {/* Header - Modern Design */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:scale-110 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Account Settings</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="group relative flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden font-medium"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </div>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="group relative flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </div>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="group relative flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-5 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-700 to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-300 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-600"></div>
          
          {/* Profile Header */}
          <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 px-8 py-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-700/90 to-purple-800/90"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 relative z-10 text-center sm:text-left">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20 flex-shrink-0">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{userData.name}</h2>
                <p className="text-blue-100 text-base sm:text-lg truncate">{userData.email}</p>
                <div className="mt-3 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20 shadow-md">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  User Account
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempData.name || ''}
                    onChange={(e) => setTempData({ ...tempData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{userData.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-600 py-2">{userData.email}</p>
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <p className="text-gray-600 py-2">{formatDate(userData.joinDate)}</p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="border-t border-gray-200/50 p-8">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-8">Performance Dashboard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group relative bg-white rounded-3xl p-8 text-center border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-blue-600/20 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-blue-500/20 rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">{stats.questionsLogged}</div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Questions Answered</p>
                  <div className="mt-4 text-xs text-blue-600 font-medium">Total practiced</div>
                </div>
              </div>
              
              <div className="group relative bg-white rounded-3xl p-8 text-center border-2 border-gray-100 hover:border-emerald-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-emerald-400/10 to-emerald-500/20 rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">{stats.quizzesCompleted}</div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Quizzes Completed</p>
                  <div className="mt-4 text-xs text-emerald-600 font-medium">Sessions finished</div>
                </div>
              </div>
              
              <div className="group relative bg-white rounded-3xl p-8 text-center border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/20 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-purple-400/10 to-purple-500/20 rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">{stats.averageScore}<span className="text-2xl text-gray-600">%</span></div>
                  <p className="text-sm text-gray-600 font-semibold uppercase tracking-wider">Average Score</p>
                  <div className="mt-4 text-xs text-purple-600 font-medium">Overall performance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-xs text-gray-500">Receive updates about your progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
                  <p className="text-xs text-gray-500">Get weekly progress summaries</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage; 