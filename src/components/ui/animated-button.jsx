import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trash2, Edit3 } from 'lucide-react';

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = '', 
  type = 'button',
  variant = 'primary',
  successMessage,
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [capturedSuccessMessage, setCapturedSuccessMessage] = useState('');

  const handleClick = async (e) => {
    if (disabled || isLoading) return;
    
    setIsLoading(true);
    
    // Capture the success message at the time of click
    const messageToShow = typeof successMessage === 'function' 
      ? successMessage() 
      : successMessage || 'Success!';
    setCapturedSuccessMessage(messageToShow);
    
    try {
      await onClick(e);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsLoading(false);
        setCapturedSuccessMessage('');
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setCapturedSuccessMessage('');
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getSuccessIcon = () => {
    switch (variant) {
      case 'danger':
        return <Trash2 className="w-4 h-4" />;
      case 'primary':
        return <Edit3 className="w-4 h-4" />;
      default:
        return <Check className="w-4 h-4" />;
    }
  };

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        relative overflow-hidden px-6 py-2 rounded-lg font-medium transition-all duration-200
        ${getVariantStyles()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      whileHover={!disabled && !isLoading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="flex items-center justify-center space-x-2"
          >
            {getSuccessIcon()}
            <span>{capturedSuccessMessage}</span>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center space-x-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Processing...</span>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center space-x-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default AnimatedButton; 