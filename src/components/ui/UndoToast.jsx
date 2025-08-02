import React, { useState, useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';
import { useUndo } from '../../contexts/UndoContext';

const UndoToast = () => {
  const { showUndoToast, currentUndoAction, undoAction, setShowUndoToast } = useUndo();
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!showUndoToast || !currentUndoAction) return;

    setTimeLeft(5);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showUndoToast, currentUndoAction]);

  if (!showUndoToast || !currentUndoAction) return null;

  const getActionText = (type) => {
    switch (type) {
      case 'question':
        return 'Question deleted';
      case 'questions':
        return `${currentUndoAction.data.length} questions deleted`;
      case 'quiz':
        return 'Quiz deleted';
      case 'quizzes':
        return `${currentUndoAction.data.length} quizzes deleted`;
      default:
        return 'Item deleted';
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-lg border border-gray-700 dark:border-gray-600 px-4 py-3 flex items-center gap-3 min-w-[300px]">
        <div className="flex-1 flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">{getActionText(currentUndoAction.type)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Countdown circle */}
          <div className="relative w-6 h-6">
            <svg className="w-6 h-6 transform -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-600"
              />
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-blue-500 transition-all duration-1000 ease-linear"
                strokeDasharray={`${(timeLeft / 5) * 62.83} 62.83`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {timeLeft}
            </span>
          </div>
          
          {/* Undo button */}
          <button
            onClick={() => undoAction(currentUndoAction.id)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-xs font-medium transition-colors duration-200"
          >
            <RotateCcw className="w-3 h-3" />
            Undo
          </button>
          
          {/* Close button */}
          <button
            onClick={() => setShowUndoToast(false)}
            className="p-1 hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default UndoToast; 