import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { formatRelativeTime } from '../lib/utils';
import '../styles/AnimatedList.css';

const AnimatedQuestionItem = ({ children, delay = 0, index, onMouseEnter, onClick }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5, triggerOnce: false });
  
  return (
    <motion.div
      ref={ref}
      data-index={index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
      transition={{ duration: 0.2, delay }}
      style={{ marginBottom: '1rem', cursor: 'pointer' }}
    >
      {children}
    </motion.div>
  );
};

const AnimatedQuestionList = ({
  questions = [],
  selectedQuestions = [],
  onQuestionToggle,
  getQuestionStatus,
  isQuestionFlagged,
  showGradients = true,
  enableArrowNavigation = true,
  className = '',
  displayScrollbar = true,
}) => {
  const listRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);
  const [visibleCount, setVisibleCount] = useState(10); // Start with 10 questions on mobile
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // For updating relative time

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Reset visible count when questions change
  useEffect(() => {
    setVisibleCount(10);
  }, [questions]);

  // Update current time every minute for relative timestamp updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute (60,000 ms)

    return () => clearInterval(interval);
  }, []);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setTopGradientOpacity(Math.min(scrollTop / 50, 1));
    const bottomDistance = scrollHeight - (scrollTop + clientHeight);
    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1)
    );
  };

  const loadMoreQuestions = () => {
    setVisibleCount(prev => Math.min(prev + 10, questions.length));
  };

  const showAllQuestions = () => {
    setVisibleCount(questions.length);
  };

  // Get questions to display based on mobile/desktop and visible count
  const questionsToShow = isMobile ? questions.slice(0, visibleCount) : questions;
  const hasMoreQuestions = isMobile && visibleCount < questions.length;
  
  // Debug: Check for duplicate IDs
  useEffect(() => {
    const ids = questionsToShow.map(q => q.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      console.warn('🚨 Found duplicate question IDs:', duplicates);
      console.warn('🚨 Questions with duplicate IDs:', questionsToShow.filter(q => duplicates.includes(q.id)));
    }
  }, [questionsToShow]);

  useEffect(() => {
    if (!enableArrowNavigation) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || (e.key === 'Tab' && !e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, questions.length - 1));
      } else if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < questions.length) {
          e.preventDefault();
          if (onQuestionToggle) {
            onQuestionToggle(questions[selectedIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [questions, selectedIndex, onQuestionToggle, enableArrowNavigation]);

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selectedItem = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedItem) {
      const extraMargin = 50;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemTop = selectedItem.offsetTop;
      const itemBottom = itemTop + selectedItem.offsetHeight;
      if (itemTop < containerScrollTop + extraMargin) {
        container.scrollTo({ top: itemTop - extraMargin, behavior: 'smooth' });
      } else if (itemBottom > containerScrollTop + containerHeight - extraMargin) {
        container.scrollTo({
          top: itemBottom - containerHeight + extraMargin,
          behavior: 'smooth',
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  const renderQuestion = (question, index) => {
    // Validate question data with consistent logic
    const hasBaseData = question && question.id && question.section;
    const isMathQuestion = question?.section === 'Math';
    const hasValidData = hasBaseData && (
      isMathQuestion ? true : (question.domain && question.questionType)
    );

    // Debug logging for problematic questions
    if (!hasValidData) {
      console.warn('🚨 Rendering question with missing data:', { 
        question: {
          id: question?.id,
          section: question?.section,
          domain: question?.domain,
          questionType: question?.questionType,
          isMathQuestion
        }, 
        index 
      });
    }
    
    const isSelected = selectedQuestions.includes(question.id);
    const status = getQuestionStatus ? getQuestionStatus(question.id) : null;
    const flagged = isQuestionFlagged ? isQuestionFlagged(question.id) : false;

    // Skip rendering if question has missing required data
    if (!hasValidData) {
      console.warn('🚨 Skipping question with missing data:', { 
        question: {
          id: question?.id,
          section: question?.section,
          domain: question?.domain,
          questionType: question?.questionType,
          isMathQuestion
        }, 
        index 
      });
      return null;
    }
    
    return (
      <AnimatedQuestionItem
        key={`${question.id}-${index}`}
        delay={0.1}
        index={index}
        onMouseEnter={() => setSelectedIndex(index)}
        onClick={() => onQuestionToggle && onQuestionToggle(question.id)}
      >
        <div className={`
          p-2 rounded-md border transition-all duration-200 cursor-pointer
          ${selectedIndex === index 
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 shadow-sm' 
            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
          }
          ${isSelected ? 'ring-1 ring-blue-400 dark:ring-blue-500' : ''}
        `}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onQuestionToggle && onQuestionToggle(question.id)}
                className="w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
              />
              {/* Question Number */}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded min-w-[20px] text-center flex-shrink-0 ${
                (question.origin === 'catalog')
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              }`}>
                {index + 1}
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 flex-1 min-w-0 transition-colors duration-300">
                <span className="font-medium truncate text-xs">{question.section}</span>
                {flagged && <span className="text-yellow-500 text-xs">🚩</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className={`text-xs px-2 py-0.5 rounded font-medium w-16 text-center transition-colors duration-300 ${
                question.difficulty === 'Easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                question.difficulty === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              }`}>
                {question.difficulty}
              </span>
            </div>
          </div>
          
          <div className="pl-5">
                          <p className="text-gray-800 dark:text-gray-200 text-xs leading-tight line-clamp-2 mb-1 transition-colors duration-300">
                {(() => {
                  if (!question.passageText || question.passageText.trim().length === 0) {
                    return 'No passage text';
                  }
                  const words = question.passageText.trim().split(/\s+/).slice(0, 10);
                  return `${words.join(' ')}${question.passageText.split(/\s+/).length > 10 ? '...' : ''}`;
                })()}
              </p>
            
            <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="truncate">{question.questionType}</span>
                {question.origin === 'catalog' ? (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    Catalog
                  </span>
                ) : (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                    Wrong Log
                  </span>
                )}
                {status && (
                  <>
                    <span className="text-gray-400 dark:text-gray-500">•</span>
                    <span className={`font-medium ${
                      status === 'correct' 
                        ? 'text-green-600' 
                        : status === 'incorrect' 
                        ? 'text-red-600'
                        : status === 'mixed'
                        ? 'text-yellow-600'
                        : 'text-gray-500'
                    }`}>
                      {status === 'correct' ? 'Correct' : status === 'incorrect' ? 'Wrong' : status === 'mixed' ? 'Mixed' : 'New'}
                    </span>
                  </>
                )}
              </div>
              <span className="text-gray-400 dark:text-gray-500 font-medium flex-shrink-0">
                {formatRelativeTime(question.createdAt || question.lastUpdated)}
              </span>
            </div>
          </div>
        </div>
      </AnimatedQuestionItem>
    );
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div
        ref={listRef}
        className={`h-full overflow-y-auto p-2 ${!displayScrollbar ? 'scrollbar-hide' : ''}`}
        onScroll={handleScroll}
        style={{
          scrollbarWidth: displayScrollbar ? 'thin' : 'none'
        }}
      >
        {questionsToShow.map((question, index) => renderQuestion(question, index))}
        
        {/* Load More Button for Mobile */}
        {hasMoreQuestions && (
          <div className="flex flex-col gap-2 mt-4 p-2">
            <button
              onClick={loadMoreQuestions}
              className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm"
            >
              Load More Questions ({Math.min(10, questions.length - visibleCount)} more)
            </button>
            <button
              onClick={showAllQuestions}
              className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 text-xs"
            >
              Show All ({questions.length} total)
            </button>
          </div>
        )}
      </div>
      
      {showGradients && (
        <>
          <div
            className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white dark:from-gray-800 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-800 to-transparent pointer-events-none transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
};

export default AnimatedQuestionList; 