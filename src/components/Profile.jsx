import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserStats } from '../lib/userPoints';
import { Calculator, Info } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user?.id) {
        setLoading(true);
        setCalculating(true);
        
        try {
          console.log('📊 Profile opened - starting automatic stats calculation...');
          
          // Wait for all stats to be calculated
          const stats = await getUserStats(user.id);
          
          if (stats) {
            console.log('✅ Profile stats loaded:', stats);
            setUserStats(stats);
          } else {
            // Show fallback data
            setUserStats({
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              avatar: user.email?.charAt(0).toUpperCase() || 'U',
              rank: 1,
              rank_position: 1,
              points: 0,
              questions_added: 0,
              quizzes_completed: 0,
              edits: 0,
              high_scores: 0,
              daily_logins: 0,
              streak_days: 0,
              progressToNext: 0,
              nextRankPoints: 100
            });
          }
        } catch (error) {
          console.error('Error loading user stats:', error);
          // Show fallback data on error
          setUserStats({
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            avatar: user.email?.charAt(0).toUpperCase() || 'U',
            rank: 1,
            rank_position: 1,
            points: 0,
            questions_added: 0,
            quizzes_completed: 0,
            edits: 0,
            high_scores: 0,
            daily_logins: 0,
            streak_days: 0,
            progressToNext: 0,
            nextRankPoints: 100
          });
        } finally {
          setCalculating(false);
          setLoading(false);
        }
      }
    };

    loadUserStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Calculator className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          {calculating ? (
            <>
              <p className="text-lg text-gray-800 dark:text-gray-200 font-semibold mb-2">Calculating Your Stats...</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Getting live data from your question bank and quiz history
              </p>
            </>
          ) : (
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading your profile...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Real-time Stats Info */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              Live Stats Calculation
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your stats are calculated in real-time from your actual question bank ({userStats?.questions_added || 0} questions) 
              and quiz history ({userStats?.quizzes_completed || 0} completed quizzes). 
              Edits and high scores are tracked locally and update automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-700/90 to-purple-800/90"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="flex flex-col lg:flex-row items-center lg:justify-between relative z-10 space-y-4 lg:space-y-0 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 flex-1">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20 flex-shrink-0">
                <span className="text-2xl sm:text-3xl font-bold">{userStats?.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{userStats?.name}</h2>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Level {userStats?.rank_position || 1}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">{userStats?.points || 0} pts</span>
                </div>
              </div>
            </div>
            
            {/* Live Stats Indicator */}
            <div className="text-center lg:text-right flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-2 sm:px-4 sm:py-2 rounded-xl">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Live Stats</span>
                </div>
                <p className="text-xs opacity-90">Auto-calculated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Statistics</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {userStats?.questions_added || 0}
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">Questions Added</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">from question bank</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {userStats?.quizzes_completed || 0}
              </div>
              <div className="text-sm text-green-800 dark:text-green-300 font-medium">Quizzes Completed</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">from quiz history</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {userStats?.edits || 0}
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">Edits</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">local counter</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                {userStats?.high_scores || 0}
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">High Scores</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">local counter</div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Level Progress</h4>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Level {userStats?.rank || 1}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {userStats?.points || 0}/{userStats?.nextRankPoints || 100}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${userStats?.progressToNext || 0}%` }}
              ></div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily Activity Days: <span className="font-semibold">{userStats?.daily_logins || 0}</span>
                {userStats?.streak_days > 0 && (
                  <span className="ml-4">
                    Current Streak: <span className="font-semibold text-blue-600 dark:text-blue-400">{userStats.streak_days} days</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 