import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { getUserStats } from '../lib/userPoints';
import { Calculator, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from './ui/CountUp';
import { useSoundSettings } from '../contexts/SoundSettingsContext';

// Import sound files
import rankingLoadedSound from '../assets/rankingLoadedPage.wav';

const Profile = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const { soundEnabled } = useSoundSettings();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [rankingAudio, setRankingAudio] = useState(null);
  const [animationStarted, setAnimationStarted] = useState(false);

  // Initialize ranking audio
  useEffect(() => {
    const audio = new Audio(rankingLoadedSound);
    audio.volume = 0.4;
    setRankingAudio(audio);
    
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  useEffect(() => {
    const loadUserStats = async () => {
      if (user?.id) {
        setLoading(true);
        setCalculating(true);
        
        try {
  
          
          // Wait for all stats to be calculated
          const stats = await getUserStats(user.id);
          
          if (stats) {
      
            setUserStats(stats);
            
            // Play ranking loaded sound when stats are successfully loaded
            if (rankingAudio && soundEnabled) {
              rankingAudio.currentTime = 0;
                      rankingAudio.play().catch(error => {
          // Audio play failed
        });
            }
            
            // Start animations after a short delay
            setTimeout(() => {
              setAnimationStarted(true);
            }, 500);
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
            
            setTimeout(() => {
              setAnimationStarted(true);
            }, 500);
          }
        } catch (error) {
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
          
          setTimeout(() => {
            setAnimationStarted(true);
          }, 500);
        } finally {
          setCalculating(false);
          setLoading(false);
        }
      }
    };

    loadUserStats();
  }, [user, rankingAudio]);

  // Memoize particle effect to avoid recreating on every render
  const particleEffect = useMemo(() => 
    [...Array(15)].map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 2;
      const size = Math.random() * 3 + 1;
      
      return {
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        size: `${size}px`,
        delay: `${delay}s`,
        duration: `${duration}s`
      };
    }), [isDarkMode]
  );

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
    <div className="relative h-full overflow-hidden">
      {/* Enhanced Background with Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-950/20 via-indigo-950/10 to-purple-950/20' 
            : 'bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-purple-100/60'
        }`}></div>
        
        {/* Main Floating Orbs */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20' 
            : 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20' 
            : 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15'
        }`}></div>
        
        {/* Additional Floating Elements */}
        <div className={`absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/15' 
            : 'bg-gradient-to-r from-purple-500/12 to-pink-500/12'
        }`}></div>
        <div className={`absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl animate-pulse delay-1500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15' 
            : 'bg-gradient-to-r from-cyan-500/12 to-blue-500/12'
        }`}></div>
        
        {/* Geometric Shapes */}
        <div className={`absolute top-20 left-10 w-32 h-32 border-2 rounded-2xl rotate-12 animate-float ${
          isDarkMode 
            ? 'border-blue-400/30 bg-transparent' 
            : 'border-blue-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 rounded-full animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' 
            : 'bg-gradient-to-br from-blue-500/15 to-indigo-500/15'
        }`}></div>
        <div className={`absolute bottom-32 left-20 w-20 h-20 border-2 rounded-lg rotate-45 animate-float-slow ${
          isDarkMode 
            ? 'border-purple-400/30 bg-transparent' 
            : 'border-purple-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        
        {/* Modern Abstract Shapes */}
        <div className={`absolute top-1/3 left-16 w-24 h-32 rounded-tl-3xl rounded-br-3xl animate-float delay-800 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20' 
            : 'bg-gradient-to-r from-blue-400/15 to-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-1/3 right-16 w-32 h-24 rounded-tr-3xl rounded-bl-3xl animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-400/20 to-indigo-400/20' 
            : 'bg-gradient-to-r from-purple-400/15 to-indigo-400/15'
        }`}></div>
        
        {/* Star-like Shapes */}
        <div className={`absolute top-1/3 right-1/6 w-8 h-8 transform rotate-45 animate-float delay-900 ${
          isDarkMode 
            ? 'bg-amber-400/25' 
            : 'bg-amber-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        <div className={`absolute bottom-2/5 left-1/8 w-6 h-6 transform -rotate-15 animate-float-slow delay-1100 ${
          isDarkMode 
            ? 'bg-lime-400/25' 
            : 'bg-lime-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        
        {/* Triangle Accents */}
        <div className={`absolute top-1/4 right-1/4 w-8 h-8 transform rotate-45 animate-float delay-1000 ${
          isDarkMode 
            ? 'bg-cyan-400/20' 
            : 'bg-cyan-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-12 h-12 transform -rotate-30 animate-float-delayed ${
          isDarkMode 
            ? 'bg-rose-400/20' 
            : 'bg-rose-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        
        {/* Shining Light Effects */}
        <div className={`absolute top-1/5 right-1/4 w-2 h-2 rounded-full animate-ping delay-500 ${
          isDarkMode ? 'bg-white/60' : 'bg-blue-300/70'
        }`}></div>
        <div className={`absolute bottom-1/5 left-1/4 w-1 h-1 rounded-full animate-ping delay-1200 ${
          isDarkMode ? 'bg-yellow-300/80' : 'bg-yellow-300/70'
        }`}></div>
        <div className={`absolute top-2/5 left-3/4 w-1.5 h-1.5 rounded-full animate-ping delay-800 ${
          isDarkMode ? 'bg-cyan-300/70' : 'bg-cyan-300/60'
        }`}></div>
        <div className={`absolute bottom-2/5 right-3/4 w-2.5 h-2.5 rounded-full animate-ping delay-1800 ${
          isDarkMode ? 'bg-pink-300/60' : 'bg-pink-300/50'
        }`}></div>
        
        {/* Particle Effect */}
        <div className="absolute inset-0">
          {particleEffect.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className={`absolute rounded-full animate-ping ${
                isDarkMode ? 'bg-blue-500/40' : 'bg-blue-500/30'
              }`}
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            ></div>
          ))}
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.05]`}>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px), 
                             radial-gradient(circle at 75% 75%, #6366f1 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
          }}></div>
        </div>
        
        {/* Floating Lines */}
        <div className={`absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform rotate-45 animate-pulse delay-1000`}></div>
        <div className={`absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent transform -rotate-45 animate-pulse delay-2000`}></div>
        <div className={`absolute top-2/3 left-0 w-24 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform rotate-12 animate-pulse delay-500`}></div>
        
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 rounded-tl-3xl ${
          isDarkMode ? 'border-blue-400/20' : 'border-blue-400/15'
        }`}></div>
        <div className={`absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 rounded-tr-3xl ${
          isDarkMode ? 'border-purple-400/20' : 'border-purple-400/15'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 rounded-bl-3xl ${
          isDarkMode ? 'border-cyan-400/20' : 'border-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 rounded-br-3xl ${
          isDarkMode ? 'border-indigo-400/20' : 'border-indigo-400/15'
        }`}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
      {/* Real-time Stats Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
      >
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
      </motion.div>

      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 px-8 py-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-indigo-700/90 to-purple-800/90"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="flex flex-col lg:flex-row items-center lg:justify-between relative z-10 space-y-4 lg:space-y-0 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 flex-1">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.4, type: "spring", stiffness: 200 }}
                className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20 flex-shrink-0"
              >
                <span className="text-2xl sm:text-3xl font-bold">{userStats?.avatar}</span>
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="text-2xl sm:text-3xl font-bold mb-2 truncate"
                >
                  {userStats?.name}
                </motion.h2>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs sm:text-sm font-medium"
                  >
                    Level {userStats?.rank_position || 1}
                  </motion.span>
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.0 }}
                    className="text-xl sm:text-2xl font-bold"
                  >
                    <CountUp 
                      from={0} 
                      to={userStats?.points || 0} 
                      duration={1.5} 
                      delay={1.2}
                      startWhen={animationStarted}
                    /> pts
                  </motion.span>
                </div>
              </div>
            </div>
            
            {/* Live Stats Indicator */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center lg:text-right flex-shrink-0"
            >
              <div className="bg-white/20 backdrop-blur-sm border border-white/20 px-3 py-2 sm:px-4 sm:py-2 rounded-xl">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm font-medium">Live Stats</span>
                </div>
                <p className="text-xs opacity-90">Auto-calculated</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="p-8">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="text-xl font-semibold text-gray-900 dark:text-white mb-6"
          >
            Your Statistics
          </motion.h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800"
            >
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                <CountUp 
                  from={0} 
                  to={userStats?.questions_added || 0} 
                  duration={1.2} 
                  delay={1.8}
                  startWhen={animationStarted}
                />
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">Questions Added</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">from question bank</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800"
            >
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                <CountUp 
                  from={0} 
                  to={userStats?.quizzes_completed || 0} 
                  duration={1.2} 
                  delay={2.0}
                  startWhen={animationStarted}
                />
              </div>
              <div className="text-sm text-green-800 dark:text-green-300 font-medium">Quizzes Completed</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">from quiz history</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 2.0 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800"
            >
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                <CountUp 
                  from={0} 
                  to={userStats?.edits || 0} 
                  duration={1.2} 
                  delay={2.2}
                  startWhen={animationStarted}
                />
              </div>
              <div className="text-sm text-purple-800 dark:text-purple-300 font-medium">Edits</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">local counter</div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 2.2 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800"
            >
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                <CountUp 
                  from={0} 
                  to={userStats?.high_scores || 0} 
                  duration={1.2} 
                  delay={2.4}
                  startWhen={animationStarted}
                />
              </div>
              <div className="text-sm text-yellow-800 dark:text-yellow-300 font-medium">High Scores</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">local counter</div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6"
          >
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Level Progress</h4>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Level {userStats?.rank || 1}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <CountUp 
                  from={0} 
                  to={userStats?.points || 0} 
                  duration={1.5} 
                  delay={2.6}
                  startWhen={animationStarted}
                />/{userStats?.nextRankPoints || 100}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: `${userStats?.progressToNext || 0}%` }}
                transition={{ 
                  duration: 2, 
                  delay: 2.8,
                  ease: "easeOut"
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full relative"
              >
                {/* Animated shine effect */}
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ 
                    duration: 2, 
                    delay: 3.5,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Daily Activity Days: <span className="font-semibold">
                  <CountUp 
                    from={0} 
                    to={userStats?.daily_logins || 0} 
                    duration={1.2} 
                    delay={3.0}
                    startWhen={animationStarted}
                  />
                </span>
                {userStats?.streak_days > 0 && (
                  <span className="ml-4">
                    Current Streak: <span className="font-semibold text-blue-600 dark:text-blue-400">
                      <CountUp 
                        from={0} 
                        to={userStats.streak_days} 
                        duration={1.2} 
                        delay={3.2}
                        startWhen={animationStarted}
                      /> days
                    </span>
                  </span>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 