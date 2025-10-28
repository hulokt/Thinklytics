import React, { useState } from 'react';
import { 
  Play, 
  Clock, 
  CheckCircle2, 
  Circle,
  FileText,
  Trash2,
  Trophy,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const ModernQuizCard = ({ 
  event, 
  onStart, 
  onDelete,
  compact = false,
  className 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusConfig = () => {
    switch (event.status) {
      case 'completed':
        return {
          gradient: 'from-emerald-500/10 to-green-500/5',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
          accent: 'text-emerald-700 dark:text-emerald-400',
        };
      case 'in-progress':
        return {
          gradient: 'from-blue-500/10 to-cyan-500/5',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Clock,
          iconColor: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          accent: 'text-blue-700 dark:text-blue-400',
        };
      case 'planned':
      default:
        return {
          gradient: 'from-purple-500/10 to-pink-500/5',
          border: 'border-purple-200 dark:border-purple-800',
          icon: Circle,
          iconColor: 'text-purple-600 dark:text-purple-400',
          iconBg: 'bg-purple-100 dark:bg-purple-900/30',
          accent: 'text-purple-700 dark:text-purple-400',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatScore = (score) => {
    return typeof score === 'number' ? Math.round(score) : '--';
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-lg",
        "bg-gradient-to-br",
        config.gradient,
        "border",
        config.border,
        "hover:shadow-lg",
        "transition-all duration-200",
        "backdrop-blur-sm",
        className
      )}
      onClick={() => event.status !== 'completed' && onStart?.(event)}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
      
      <div className="relative p-2.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-1.5 mb-2">
          {/* Left: Icon + Title */}
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            <div className={cn(
              "p-1.5 rounded-md shadow-sm",
              config.iconBg,
              "ring ring-white/40 dark:ring-gray-700/40"
            )}>
              <Icon className={cn("w-3.5 h-3.5", config.iconColor)} />
            </div>
            <div className="flex-1 min-w-0 pt-0">
              <h3 className="font-semibold text-xs text-gray-900 dark:text-white mb-0.5 line-clamp-1">
                {event.title || `Quiz ${event.quizNumber || ''}`}
              </h3>
              <div className="flex items-center gap-1">
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  config.iconBg,
                  config.accent
                )}>
                  {event.status === 'completed' ? '✓ Completed' : event.status === 'in-progress' ? '⏵ In Progress' : '○ Planned'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {event.status !== 'completed' && (
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onStart?.(event);
                }}
                className={cn(
                  "p-1.5 rounded-md transition-all shadow-sm",
                  config.iconBg,
                  config.iconColor,
                  "hover:shadow-md ring ring-white/40 dark:ring-gray-700/40"
                )}
                title={event.status === 'in-progress' ? 'Continue' : 'Start'}
              >
                <Play className="w-3 h-3" fill="currentColor" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(event);
              }}
              className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all shadow-sm hover:shadow-md"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </motion.button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-1.5">
          {/* Questions */}
          <div className="flex flex-col items-center justify-center p-1.5 bg-white/60 dark:bg-gray-800/60 rounded-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
            <FileText className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 mb-0.5" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {event.questions?.length || 0}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              Questions
            </span>
          </div>

          {/* Score or Time */}
          {event.status === 'completed' ? (
            <>
              <div className="flex flex-col items-center justify-center p-1.5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-md backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50">
                <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mb-0.5" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {formatScore(event.score)}%
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Score
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 bg-white/60 dark:bg-gray-800/60 rounded-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <TrendingUp className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 mb-0.5" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {event.correctAnswers || 0}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Correct
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center p-1.5 bg-white/60 dark:bg-gray-800/60 rounded-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <Clock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400 mb-0.5" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatTime(event.timeSpent)}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                  Time Spent
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-1.5 bg-white/60 dark:bg-gray-800/60 rounded-md backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 opacity-50">
                <Trophy className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mb-0.5" />
                <span className="text-sm font-bold text-gray-400 dark:text-gray-500">
                  --
                </span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                  Pending
                </span>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Hover effect shine (kept subtle) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
        animate={{ x: isHovered ? ['-200%', '200%'] : '-200%' }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default ModernQuizCard;
