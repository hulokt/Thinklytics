import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trophy, Edit, Target, Calendar, Star, CheckCircle } from 'lucide-react';

const PointsAnimation = ({ pointsAwarded, actionType, position = 'top-right', onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPoints, setShowPoints] = useState(false);

  useEffect(() => {
    if (pointsAwarded !== 0) {
      setIsVisible(true);
      // Show points after a brief delay
      setTimeout(() => setShowPoints(true), 200);
      
      // Hide animation after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setShowPoints(false);
        setTimeout(() => onComplete?.(), 300); // Call onComplete after fade out
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [pointsAwarded, onComplete]);

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'ADD_QUESTION':
        return <Plus className="w-4 h-4" />;
      case 'COMPLETE_QUIZ':
        return <CheckCircle className="w-4 h-4" />;
      case 'EDIT_QUESTION':
        return <Edit className="w-4 h-4" />;
      case 'DELETE_QUESTION':
        return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
        </svg>;
      case 'HIGH_SCORE':
        return <Trophy className="w-4 h-4" />;
      case 'DAILY_LOGIN':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getActionText = (actionType) => {
    switch (actionType) {
      case 'ADD_QUESTION':
        return 'Question Added!';
      case 'COMPLETE_QUIZ':
        return 'Quiz Completed!';
      case 'EDIT_QUESTION':
        return 'Question Edited!';
      case 'DELETE_QUESTION':
        return 'Question Deleted!';
      case 'HIGH_SCORE':
        return 'New High Score!';
      case 'DAILY_LOGIN':
        return 'Daily Login!';
      default:
        return 'Points Earned!';
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'ADD_QUESTION':
        return 'from-blue-500 to-blue-600';
      case 'COMPLETE_QUIZ':
        return 'from-green-500 to-green-600';
      case 'EDIT_QUESTION':
        return 'from-purple-500 to-purple-600';
      case 'DELETE_QUESTION':
        return 'from-red-500 to-red-600';
      case 'HIGH_SCORE':
        return 'from-yellow-500 to-yellow-600';
      case 'DAILY_LOGIN':
        return 'from-indigo-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'bottom-4 right-4'; // Changed from top-4 right-4 to bottom-4 right-4
    }
  };

  if (pointsAwarded === 0) return null;

  return (
    <div className={`fixed z-50 ${getPositionClasses()}`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 25,
              duration: 0.3 
            }}
            className="relative"
          >
            {/* Main notification card */}
            <div className={`bg-gradient-to-r ${getActionColor(actionType)} text-white rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden`}>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              
              <div className="relative px-4 py-3 flex items-center space-x-3">
                {/* Icon */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                >
                  {getActionIcon(actionType)}
                </motion.div>

                {/* Content */}
                <div className="flex flex-col min-w-0">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm font-semibold truncate"
                  >
                    {getActionText(actionType)}
                  </motion.div>
                  
                  <AnimatePresence>
                    {showPoints && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                        className="flex items-center space-x-1"
                      >
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-xs font-bold"
                        >
                          {pointsAwarded >= 0 ? '+' : ''}{pointsAwarded}
                        </motion.span>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.5, type: "spring", stiffness: 400 }}
                        >
                          <Star className="w-3 h-3 fill-current" />
                        </motion.div>
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          className="text-xs opacity-90"
                        >
                          points
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Progress bar animation */}
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "linear" }}
                className="h-1 bg-white/30"
              ></motion.div>
            </div>

            {/* Floating points effect */}
            <AnimatePresence>
              {showPoints && (
                <motion.div
                  initial={{ opacity: 0, y: 0, scale: 1 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -30, scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 pointer-events-none"
                >
                  <div className="flex items-center space-x-1 text-white font-bold text-lg drop-shadow-lg">
                    {pointsAwarded >= 0 ? (
                      <Plus className="w-4 h-4" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    )}
                    <span>{Math.abs(pointsAwarded)}</span>
                    <Star className="w-4 h-4 fill-current text-yellow-300" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PointsAnimation; 