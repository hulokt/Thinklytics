import React, { useState, useEffect, useMemo } from 'react';
import AnimatedQuestionList from './AnimatedQuestionList';
import { useQuestionAnswers } from '../hooks/useUserData';
import { useQuizManager, QUIZ_STATUS } from './QuizManager';
import { 
  SAT_SECTIONS, 
  getDomainOptions, 
  getQuestionTypeOptions,
  getQuestionTypeOptionsByDomain,
  READING_WRITING_DOMAINS,
  MATH_DOMAINS,
  READING_WRITING_QUESTION_TYPES_BY_DOMAIN,
  MATH_QUESTION_TYPES_BY_DOMAIN
} from '../data';
import jsPDF from 'jspdf';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useCalendarEvents } from '../hooks/useUserData';
import Fuse from 'fuse.js/dist/fuse.esm.js';
import { useAuth } from '../contexts/AuthContext';
import { awardPoints, handleHighScore } from '../lib/userPoints';
import PointsAnimation from './PointsAnimation';
import { exportQuestionsAsPDF } from '../utils/pdfExport';

const QuestionSelector = ({ questions, onStartQuiz, onResumeQuiz, inProgressQuizzes }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filters, setFilters] = useState({
    section: 'All',
    domain: 'All',
    questionType: 'All',
    difficulty: 'All',
    status: 'All'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortBy, setSortBy] = useState('unsolved-first');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Get question answers and quiz history from Supabase
  const { data: questionAnswers } = useQuestionAnswers();
  const { quizManager, completedQuizzes, inProgressQuizzes: managerInProgressQuizzes } = useQuizManager();

  // Calendar event state
  const { data: calendarEvents, upsertData: saveCalendarEvents } = useCalendarEvents();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [showToast, setShowToast] = useState(false);
  const [toastDate, setToastDate] = useState('');
  const [toastError, setToastError] = useState(false);

  // Ensure calendar events is always an array
  const safeCalendarEvents = Array.isArray(calendarEvents) ? calendarEvents : [];

  // Debug modal state changes
  useEffect(() => {
    console.log('🔘 Modal state changed:', showCalendarModal);
  }, [showCalendarModal]);

  useEffect(() => {
    console.log('🔄 useEffect triggered by dependency change:', {
      questionsLength: questions?.length,
      sortBy,
      filtersStr: JSON.stringify(filters),
      hasQuestionAnswers: !!questionAnswers,
      quizHistoryLength: completedQuizzes?.length,
      quizHistorySample: completedQuizzes?.slice(0, 2)?.map(q => ({ id: q.id, status: q.status, quizNumber: q.quizNumber }))
    });
    applyFilters();
  }, [questions, filters, sortBy, questionAnswers, completedQuizzes, managerInProgressQuizzes, searchQuery]);

  // Temporary debug effect
  useEffect(() => {
    if (questions && questions.length > 0 && questionAnswers && completedQuizzes) {
      console.log('🔍 === DEBUGGING QUESTION STATUS ===');
      console.log('📊 Available data:', {
        questionsCount: questions.length,
        questionAnswersKeys: Object.keys(questionAnswers).length,
        quizHistoryCount: completedQuizzes.length,
        quizHistorySample: completedQuizzes.slice(0, 2).map(q => ({ 
          id: q.id, 
          score: q.score, 
          endTime: q.endTime, 
          hasScore: q.score !== undefined && q.score !== null,
          hasEndTime: q.endTime !== undefined && q.endTime !== null,
          isCompleted: (q.score !== undefined && q.score !== null) && (q.endTime !== undefined && q.endTime !== null),
          status: q.status
        }))
      });
      
      // Test status calculation for first few questions
      const testQuestions = questions.slice(0, 3);
      testQuestions.forEach(question => {
        const status = getQuestionStatus(question.id);
        console.log(`🔍 Question ${question.id}: status = ${status}`);
      });
      
      console.log('🔍 === END DEBUGGING ===');
    }
  }, [questions, questionAnswers, completedQuizzes]);

  const applyFilters = () => {
    console.log('🔄 Applying filters and sorting...', {
      totalQuestions: questions.length,
      sortBy,
      filters,
      searchQuery,
      hasQuestionAnswers: !!questionAnswers,
      questionAnswersKeys: questionAnswers ? Object.keys(questionAnswers).length : 0
    });

    let filtered = [...questions];

    // First, exclude hidden questions from quiz builder
    filtered = filtered.filter(q => !q.hidden);

    // Apply section filter
    if (filters.section !== 'All') {
      filtered = filtered.filter(q => q.section === filters.section);
    }

    // Apply domain filter
    if (filters.domain !== 'All') {
      filtered = filtered.filter(q => q.domain === filters.domain);
    }

    // Apply question type filter
    if (filters.questionType !== 'All') {
      filtered = filtered.filter(q => q.questionType === filters.questionType);
    }

    // Apply difficulty filter
    if (filters.difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    // Apply status filter
    if (filters.status !== 'All') {
      filtered = filtered.filter(q => {
        const status = getQuestionStatus(q.id);
        
        switch (filters.status) {
          case 'Correct':
            return status === 'correct';
          case 'Incorrect':
            return status === 'incorrect';
          case 'Mixed':
            return status === 'mixed';
          case 'Not Attempted':
            return status === 'not-attempted';
          case 'Flagged':
            return isQuestionFlagged(q.id);
          default:
            return true;
        }
      });
    }

    // --- Apply Search Query ---
    if (searchQuery.trim()) {
      const synonymMap = {
        'english': SAT_SECTIONS.READING_WRITING,
        'reading writing': SAT_SECTIONS.READING_WRITING,
        'reading and writing': SAT_SECTIONS.READING_WRITING,
        'reading & writing': SAT_SECTIONS.READING_WRITING,
        'rw': SAT_SECTIONS.READING_WRITING,
        'r/w': SAT_SECTIONS.READING_WRITING,
        'maths': SAT_SECTIONS.MATH,
        'mathematics': SAT_SECTIONS.MATH,
        'mth': SAT_SECTIONS.MATH,
        'mths': SAT_SECTIONS.MATH
      };

      const normalized = searchQuery.trim().toLowerCase();

      // Single-letter correct answer search
      const upper = normalized.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(upper) && normalized.length === 1) {
        filtered = filtered.filter(q => q.correctAnswer === upper);
      } else {
        const mappedQuery = synonymMap[normalized] || searchQuery;
        const fuse = new Fuse(filtered, {
          includeScore: true,
          shouldSort: false,
          threshold: 0.3,
          ignoreLocation: true,
          minMatchCharLength: 2,
          keys: [
            { name: 'section', weight: 0.3 },
            { name: 'domain', weight: 0.3 },
            { name: 'questionType', weight: 0.3 },
            { name: 'difficulty', weight: 0.3 },
            { name: 'correctAnswer', weight: 0.4 },
            { name: 'questionText', weight: 0.2 },
            { name: 'passageText', weight: 0.15 },
            { name: 'answerChoices.A', weight: 0.05 },
            { name: 'answerChoices.B', weight: 0.05 },
            { name: 'answerChoices.C', weight: 0.05 },
            { name: 'answerChoices.D', weight: 0.05 },
            { name: 'explanation', weight: 0.05 }
          ]
        });

        const fuseResults = fuse.search(mappedQuery).filter(r => r.score !== undefined && r.score <= 0.5);
        fuseResults.sort((a, b) => (a.score || 0) - (b.score || 0));
        filtered = fuseResults.map(r => r.item);
      }
    }

    console.log(`📊 After filtering & search: ${filtered.length} questions remaining`);

    // Apply sorting
    const sorted = searchQuery.trim() ? filtered : applySorting(filtered);
    
    console.log(`✅ After sorting: ${sorted.length} questions`);
    if (sortBy === 'unsolved-first' && sorted.length > 0) {
      // Log first few questions to verify sorting
      const statusSample = sorted.slice(0, 5).map(q => ({
        id: q.id,
        status: getQuestionStatus(q.id)
      }));
      console.log('📋 First 5 questions after unsolved-first sort:', statusSample);
    }
    
    setFilteredQuestions(sorted);
  };

  const applySorting = (questionsToSort) => {
    if (!questionsToSort || questionsToSort.length === 0) {
      console.log('🚨 No questions to sort');
      return [];
    }

    const sortedQuestions = [...questionsToSort];
    console.log('🔄 applySorting called with:', {
      sortBy,
      questionsCount: sortedQuestions.length,
      firstQuestionId: sortedQuestions[0]?.id
    });
    
    switch (sortBy) {
      case 'unsolved-first': {
        console.log('🎯 Executing unsolved-first sorting...');
        
        const result = sortedQuestions.sort((a, b) => {
          const statusA = getQuestionStatus(a.id);
          const statusB = getQuestionStatus(b.id);
          
          // Define priority order: not-attempted > incorrect/mixed > correct
          const getPriority = (status) => {
            switch (status) {
              case 'not-attempted': return 1; // Highest priority (truly unsolved)
              case 'incorrect': return 2;     // Medium priority (attempted but wrong)
              case 'mixed': return 3;         // Medium priority (mixed results)
              case 'correct': return 4;       // Lowest priority (solved correctly)
              default: return 5;
            }
          };
          
          const priorityA = getPriority(statusA);
          const priorityB = getPriority(statusB);
          
          // Log some comparisons for debugging
          if (Math.random() < 0.2) { // 20% chance to log
            console.log(`🔍 Comparing:`, {
              A: { id: a.id, status: statusA, priority: priorityA },
              B: { id: b.id, status: statusB, priority: priorityB }
            });
          }
          
          // Primary sort: By priority (lower number = higher priority)
          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }
          
          // Secondary sort: By creation date (newest first)
          const dateA = new Date(a.createdAt || a.id || 0);
          const dateB = new Date(b.createdAt || b.id || 0);
          return dateB - dateA;
        });
        
        console.log('✅ unsolved-first sorting completed. First 5 results:', 
          result.slice(0, 5).map(q => ({
            id: q.id,
            status: getQuestionStatus(q.id)
          }))
        );
        
        return result;
      }
      
      case 'newest-first': {
        console.log('📅 Executing newest-first sorting...');
        return sortedQuestions.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.id || 0);
          const dateB = new Date(b.createdAt || b.id || 0);
          return dateB - dateA;
        });
      }
      
      case 'oldest-first': {
        console.log('📅 Executing oldest-first sorting...');
        return sortedQuestions.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.id || 0);
          const dateB = new Date(b.createdAt || b.id || 0);
          return dateA - dateB;
        });
      }
      
      default: {
        console.log('⚠️ Unknown sort option:', sortBy);
        return sortedQuestions;
      }
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearchActive(query.trim().length > 0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };
      
      // Reset dependent filters when parent filters change
      if (field === 'section') {
        newFilters.domain = 'All';
        newFilters.questionType = 'All';
      } else if (field === 'domain') {
        newFilters.questionType = 'All';
      }
      
      return newFilters;
    });
  };

  const handleQuestionToggle = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    setSelectedQuestions(filteredQuestions.map(q => q.id));
  };

  const handleDeselectAll = () => {
    setSelectedQuestions([]);
  };

  const handleStartQuiz = () => {
    const selectedQuestionData = questions.filter(q => selectedQuestions.includes(q.id));
    onStartQuiz(selectedQuestionData);
  };

  const handleAddToCalendar = () => {
    console.log('🔘 Add to Calendar button clicked!');
    console.log('🔘 Current state:', {
      selectedQuestions: selectedQuestions.length,
      showCalendarModal: showCalendarModal,
      calendarDate: calendarDate
    });
    
    if (selectedQuestions.length === 0) {
      console.log('❌ No questions selected, returning early');
      return;
    }
    
    console.log('✅ Setting showCalendarModal to true');
    setShowCalendarModal(true);
    console.log('✅ Modal state should now be true');
  };

  const handleSaveToCalendar = async () => {
    try {
      console.log('📅 Starting save to calendar process...');
      console.log('📅 Input data:', { 
        selectedQuestions: selectedQuestions.length, 
        calendarDate: calendarDate.toISOString(),
        calendarEvents: safeCalendarEvents.length,
        quizManager: !!quizManager
      });
      
      const selectedQuestionData = questions.filter(q => selectedQuestions.includes(q.id));
      console.log('📅 Selected question data:', {
        count: selectedQuestionData.length,
        questions: selectedQuestionData.map(q => ({ id: q.id, section: q.section, domain: q.domain }))
      });
      
      if (selectedQuestionData.length === 0) {
        console.error('❌ No questions selected');
        return;
      }
      
      if (!quizManager) {
        console.error('❌ Quiz manager not available');
        return;
      }
      
      // Fix: Use proper local date string conversion to avoid timezone issues
      const toLocalDateString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const dayKey = toLocalDateString(calendarDate);
      console.log('📅 Using dayKey:', dayKey, 'for calendarDate:', calendarDate);
      
      const existingQuizForDate = safeCalendarEvents.find(event => 
        event.date === dayKey && 
        event.type === 'quiz' && 
        event.status === 'planned' &&
        event.questions && 
        event.questions.length === selectedQuestionData.length &&
        event.questions.every(q => selectedQuestionData.some(sq => sq.id === q.id))
      );
      
      if (existingQuizForDate) {
        console.log('⚠️ Quiz with same questions already exists for this date');
        // Show a different toast for duplicate
        setToastDate(calendarDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        setToastError(false); // Not an error, just a duplicate
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        setShowCalendarModal(false);
        return;
      }
      
      // Create planned quiz
      console.log('📅 Creating planned quiz...');
      const plannedQuiz = quizManager.createPlannedQuiz(selectedQuestionData, calendarDate.toISOString());
      console.log('📅 Planned quiz created:', plannedQuiz);
      
      // Save quiz to quiz manager
      console.log('📅 Saving quiz to quiz manager...');
      await quizManager.addQuiz(plannedQuiz);
      console.log('✅ Quiz saved to quiz manager');
      
      // Save calendar event
      console.log('📅 Saving calendar event...');
      const newCalendarEvent = { 
        id: Date.now(),
        date: dayKey, 
        type: 'quiz', 
        title: `Quiz #${plannedQuiz.quizNumber}`, 
        quizId: plannedQuiz.id,
        status: 'planned',
        questions: selectedQuestionData,
        metadata: plannedQuiz
      };
      
      const newEvents = [...safeCalendarEvents, newCalendarEvent];
      console.log('📅 New calendar events array:', newEvents);
      console.log('📅 Saving calendar events to database...');
      
      const saveResult = await mergeAndSaveCalendarEvents(newEvents);
      console.log('📅 Calendar events save result:', saveResult);
      
      if (saveResult) {
        console.log('✅ Calendar event saved successfully');
        
        // Show modern toast notification
        setToastDate(calendarDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }));
        setToastError(false);
        setShowToast(true);
        
        // Auto-hide toast after 4 seconds
        setTimeout(() => {
          setShowToast(false);
        }, 4000);
        
        // Close modal
        setShowCalendarModal(false);
        
        // Clear selected questions
        setSelectedQuestions([]);
        
        console.log('✅ Quiz scheduling completed successfully');
      } else {
        console.error('❌ Failed to save calendar events');
        throw new Error('Failed to save calendar events');
      }
      
    } catch (err) {
      console.error('❌ Error in handleSaveToCalendar:', err);
      console.error('❌ Error details:', {
        message: err.message,
        stack: err.stack,
        selectedQuestions: selectedQuestions.length,
        calendarDate: calendarDate?.toISOString(),
        quizManager: !!quizManager,
        calendarEvents: safeCalendarEvents.length
      });
      
      // Show error toast
      setToastDate('Error occurred');
      setToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }
  };

  const getQuestionStatus = (questionId) => {
    if (!questionAnswers) {
      console.log(`🔍 [${questionId}] No questionAnswers available`);
      return 'not-attempted';
    }
    if (!questionAnswers[questionId]) {
      console.log(`🔍 [${questionId}] No answers for this question`);
      return 'not-attempted';
    }
    const answers = questionAnswers[questionId];
    if (!Array.isArray(answers) || answers.length === 0) {
      console.log(`🔍 [${questionId}] Answers is not array or empty:`, answers);
      return 'not-attempted';
    }
    
    console.log(`🔍 [${questionId}] Found ${answers.length} answers:`, answers);
    
    // Only consider answers from completed quizzes
    const completedAnswers = answers.filter(answer => {
      // Check if this answer is from a completed quiz
      const isFromCompletedQuiz = completedQuizzes && completedQuizzes.some(quiz => {
        // Old system: completed quizzes have score and endTime
        const hasScore = quiz.score !== undefined && quiz.score !== null;
        const hasEndTime = quiz.endTime !== undefined && quiz.endTime !== null;
        const isCompleted = hasScore && hasEndTime;
        
        // New system: completed quizzes have status === 'completed'
        const isNewSystemCompleted = quiz.status === QUIZ_STATUS.COMPLETED;
        
        return (isCompleted || isNewSystemCompleted) && quiz.id === answer.quizId;
      });
      return isFromCompletedQuiz;
    });
    
    console.log(`🔍 [${questionId}] Completed answers:`, completedAnswers);
    
    if (completedAnswers.length === 0) {
      console.log(`🔍 [${questionId}] No completed answers found`);
      return 'not-attempted';
    }
    
    const correctCount = completedAnswers.filter(answer => answer && answer.isCorrect === true).length;
    const incorrectCount = completedAnswers.filter(answer => answer && answer.isCorrect === false).length;
    
    console.log(`🔍 [${questionId}] Correct: ${correctCount}, Incorrect: ${incorrectCount}`);
    
    // Determine status based on answer history from completed quizzes only
    if (correctCount > 0 && incorrectCount > 0) {
      console.log(`🔍 [${questionId}] Status: mixed`);
      return 'mixed';
    } else if (correctCount > 0) {
      console.log(`🔍 [${questionId}] Status: correct`);
      return 'correct';
    } else if (incorrectCount > 0) {
      console.log(`🔍 [${questionId}] Status: incorrect`);
      return 'incorrect';
    } else {
      console.log(`🔍 [${questionId}] Status: not-attempted (fallback)`);
      return 'not-attempted';
    }
  };

  const isQuestionFlagged = (questionId) => {
    // Check if question was flagged in any completed quiz
    // In the old system, we need to check both quiz history and in-progress quizzes
    const allQuizzes = [...(completedQuizzes || []), ...(managerInProgressQuizzes || [])];
    return allQuizzes.some(quiz => 
      quiz.flaggedQuestions && Array.isArray(quiz.flaggedQuestions) && quiz.flaggedQuestions.includes(questionId)
    );
  };

  // Get unique values for filter options
  const sections = ['All', ...Object.values(SAT_SECTIONS)];
  
  // Get domains based on selected section
  const getAvailableDomains = () => {
    if (filters.section === 'All') {
      // Show all domains from both sections
      return ['All', ...Object.values(READING_WRITING_DOMAINS), ...Object.values(MATH_DOMAINS)];
    } else {
      return ['All', ...getDomainOptions(filters.section)];
    }
  };
  
  const domains = getAvailableDomains();
  
  // Get question types based on selected section and domain
  const getAvailableQuestionTypes = () => {
    // 1) No specific section or domain selected → return every type (31 total), but ensure uniqueness
    if (filters.section === 'All' && filters.domain === 'All') {
      const allTypes = new Set([
        ...getQuestionTypeOptions(SAT_SECTIONS.READING_WRITING),
        ...getQuestionTypeOptions(SAT_SECTIONS.MATH)
      ]);
      return ['All', ...Array.from(allTypes)];
    }

    // 2) "All" section but a concrete domain chosen → figure out the parent section of that domain and return its types
    if (filters.section === 'All' && filters.domain !== 'All') {
      // Determine section based on domain and show question types for that domain
      const isReadingWritingDomain = Object.values(READING_WRITING_DOMAINS).includes(filters.domain);
      const isMathDomain = Object.values(MATH_DOMAINS).includes(filters.domain);
      
      if (isReadingWritingDomain) {
        return ['All', ...getQuestionTypeOptionsByDomain(SAT_SECTIONS.READING_WRITING, filters.domain)];
      } else if (isMathDomain) {
        return ['All', ...getQuestionTypeOptionsByDomain(SAT_SECTIONS.MATH, filters.domain)];
      } else {
        return ['All'];
      }
    }

    // 3) A section was explicitly selected → respect current domain filter
    if (filters.section !== 'All') {
      // Show question types for the selected section and domain
      return ['All', ...getQuestionTypeOptionsByDomain(filters.section, filters.domain)];
    }

    return ['All'];
  };
  
  const questionTypes = getAvailableQuestionTypes();
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  // Modern Export as PDF function for selected questions
  const exportSelectedQuestionsAsPDF = async () => {
    const selected = questions.filter(q => selectedQuestions.includes(q.id));
    
    // Filter out hidden questions from export
    const exportableQuestions = selected.filter(q => !q.hidden);

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const result = await exportQuestionsAsPDF(exportableQuestions, 'Thinklytics_SAT_Selected_Questions');
      
      if (result.success) {
        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert(`Error generating PDF: ${error.message}`);
      setIsExporting(false);
      setExportSuccess(false);
    }
  };



  // Add these helpers at the top of the component (after useState, etc.)
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const toLocalDateString = (date) => {
    if (typeof date === 'string') date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = getTodayString();

  // Helper to always merge and save calendar events safely
  const mergeAndSaveCalendarEvents = async (newOrUpdatedEvents) => {
    // Just save the provided array directly - it should already be the complete merged array
    return await saveCalendarEvents(newOrUpdatedEvents);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header - Modern Design */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">

        
        {/* Responsive header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Quiz Builder</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">
              Select questions and create your custom quiz with advanced filters
            </p>
          </div>
          {/* If you add controls/buttons here in the future, wrap them in a flex-col md:flex-row group with w-full md:w-auto */}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="w-full px-3 sm:px-6 py-4 sm:py-6 lg:h-full flex flex-col pb-20 sm:pb-6">
          <div className="w-full max-w-7xl mx-auto lg:h-full flex flex-col">
          
          {/* Filters Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2 flex-shrink-0 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Filter & Sort Questions</h3>
              <div className="flex items-center gap-2">
                {isSearchActive ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors duration-300">
                      Sorted by relevance
                    </span>
                  </div>
                ) : (
                  <>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        console.log('🔄 Sort option changed from', sortBy, 'to', e.target.value);
                        setSortBy(e.target.value);
                      }}
                      className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                    >
                      <option value="unsolved-first">Unsolved First</option>
                      <option value="newest-first">Newest First</option>
                      <option value="oldest-first">Oldest First</option>
                    </select>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Section</label>
                <select
                  value={filters.section}
                  onChange={(e) => handleFilterChange('section', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => handleFilterChange('domain', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Question Type</label>
                <select
                  style={{ maxHeight: '14rem', overflowY: 'auto' }}
                  value={filters.questionType}
                  onChange={(e) => handleFilterChange('questionType', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {questionTypes.map(type => {
                    const words = type.split(' ');
                    const displayLabel = words.length > 5 ? `${words.slice(0, 5).join(' ')} ...` : type;
                    return (
                      <option key={type} value={type}>{displayLabel}</option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  <option value="All">All</option>
                  <option value="Not Attempted">Not Attempted</option>
                  <option value="Correct">Correct</option>
                  <option value="Incorrect">Incorrect</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Flagged">Flagged</option>
                </select>
              </div>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-2 flex-shrink-0 transition-colors duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  Questions ({filteredQuestions.length} available)
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2">
                <button
                  onClick={handleStartQuiz}
                  disabled={selectedQuestions.length === 0}
                  className={`px-4 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 ${
                    selectedQuestions.length === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                  }`}
                >
                  Start Quiz ({selectedQuestions.length})
                </button>
                <button
                  onClick={handleAddToCalendar}
                  disabled={selectedQuestions.length === 0}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all duration-200 flex items-center gap-1 ${
                    selectedQuestions.length === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  Add to Calendar ({selectedQuestions.length})
                </button>
                <button
                  onClick={exportSelectedQuestionsAsPDF}
                  disabled={isExporting || exportSuccess || selectedQuestions.length === 0}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center space-x-2 text-xs font-medium ${
                    isExporting || selectedQuestions.length === 0
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : exportSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  {isExporting ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Generating PDF...</span>
                    </>
                  ) : exportSuccess ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Downloaded!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Export as PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2 mb-2 flex-shrink-0 transition-colors duration-300">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search questions by section, domain, type, difficulty, or content..."
                className="w-full pl-10 pr-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base sm:text-sm transition-all duration-300"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M4 10a6 6 0 1112 0 6 6 0 01-12 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchActive(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Questions List - Dynamic Height */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 lg:overflow-hidden transition-colors duration-300">
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">Select Questions for Quiz</h4>
            </div>
            <div className="p-1 lg:h-full lg:overflow-hidden">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-1 transition-colors duration-300">No questions found</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                    Try adjusting your filters or add more questions to your question bank.
                  </p>
                </div>
              ) : (
                <div className="lg:h-full">
                  <AnimatedQuestionList
                    questions={filteredQuestions}
                    selectedQuestions={selectedQuestions}
                    onQuestionToggle={handleQuestionToggle}
                    getQuestionStatus={getQuestionStatus}
                    isQuestionFlagged={isQuestionFlagged}
                    showGradients={true}
                    enableArrowNavigation={true}
                    displayScrollbar={true}
                  />
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCalendarModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 py-4 text-white relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/90 to-purple-600/90"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Schedule Quiz</h3>
                    <p className="text-sm text-blue-100">Pick a date for your study session</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              <style>{`
                .react-calendar {
                  width: 100%;
                  background: white;
                  border: 1px solid #e5e7eb;
                  border-radius: 12px;
                  font-family: 'Inter', system-ui, sans-serif;
                  line-height: 1.125em;
                }
                .dark .react-calendar {
                  background: #374151;
                  border-color: #4b5563;
                  color: #f9fafb;
                }
                .react-calendar__navigation {
                  display: flex;
                  height: 44px;
                  margin-bottom: 1em;
                  background: linear-gradient(135deg, #ffd700 0%, #fbbf24 100%);
                  color: white;
                  border-radius: 8px 8px 0 0;
                }
                .react-calendar__navigation button {
                  min-width: 44px;
                  background: none;
                  color: white;
                  font-size: 14px;
                  font-weight: 600;
                }
                .react-calendar__navigation button:disabled {
                  background-color: rgba(255, 255, 255, 0.1);
                }
                .react-calendar__navigation button:enabled:hover,
                .react-calendar__navigation button:enabled:focus {
                  background-color: rgba(255, 255, 255, 0.2);
                }
                .react-calendar__month-view__weekdays {
                  text-align: center;
                  text-transform: uppercase;
                  font-weight: bold;
                  font-size: 0.75em;
                  background: #f9fafb;
                  color: #6b7280;
                  padding: 8px 0;
                }
                .dark .react-calendar__month-view__weekdays {
                  background: #4b5563;
                  color: #d1d5db;
                }
                .react-calendar__month-view__weekdays__weekday {
                  padding: 0.5em;
                }
                /* Remove red weekend colors - use same color as weekdays */
                .react-calendar__month-view__days__day--weekend {
                  color: #374151;
                }
                .dark .react-calendar__month-view__days__day--weekend {
                  color: #f9fafb;
                }
                .react-calendar__month-view__days__day--neighboringMonth {
                  color: #d1d5db;
                }
                .dark .react-calendar__month-view__days__day--neighboringMonth {
                  color: #6b7280;
                }
                .react-calendar__tile {
                  max-width: 100%;
                  padding: 8px 4px;
                  background: none;
                  text-align: center;
                  line-height: 16px;
                  font-size: 13px;
                  font-weight: 500;
                  border-radius: 6px;
                  margin: 1px;
                  transition: all 0.2s ease;
                  position: relative;
                  min-height: 40px;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                  background-color: #e0e7ff;
                  transform: translateY(-1px);
                  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }
                .dark .react-calendar__tile:enabled:hover,
                .dark .react-calendar__tile:enabled:focus {
                  background-color: #1e40af;
                }
                /* Fix today's date color to match UI theme */
                .react-calendar__tile--now {
                  background: #dbeafe;
                  color: #1e40af;
                  font-weight: bold;
                }
                .dark .react-calendar__tile--now {
                  background: #1e3a8a;
                  color: #93c5fd;
                }
                .react-calendar__tile--now:enabled:hover,
                .react-calendar__tile--now:enabled:focus {
                  background: #bfdbfe;
                }
                .dark .react-calendar__tile--now:enabled:hover,
                .dark .react-calendar__tile--now:enabled:focus {
                  background: #1e40af;
                }
                /* Fix selected day color to match UI theme - change from purple to blue */
                .react-calendar__tile--hasActive {
                  background: #3b82f6;
                  color: white;
                }
                .react-calendar__tile--hasActive:enabled:hover,
                .react-calendar__tile--hasActive:enabled:focus {
                  background: #2563eb;
                }
                .react-calendar__tile--active {
                  background: #3b82f6;
                  color: white;
                }
                .react-calendar__tile--active:enabled:hover,
                .react-calendar__tile--active:enabled:focus {
                  background: #2563eb;
                }
                .selected-blue {
                  background: #3b82f6 !important;
                  color: #fff !important;
                  font-weight: bold;
                  box-shadow: 0 0 0 2px #2563eb33;
                }
                .selected-blue-dark {
                  background: #1e40af !important;
                  color: #fff !important;
                  font-weight: bold;
                  box-shadow: 0 0 0 2px #60a5fa33;
                }
                .today-outline {
                  border: 2px solid #3b82f6 !important;
                  background: #fff !important;
                  color: #1e40af !important;
                  font-weight: bold;
                }
                .today-outline-dark {
                  border: 2px solid #60a5fa !important;
                  background: #1f2937 !important;
                  color: #93c5fd !important;
                  font-weight: bold;
                }
                .disabled {
                  color: #d1d5db !important;
                  background: #f3f4f6 !important;
                  opacity: 0.7;
                }
                .disabled-dark {
                  color: #6b7280 !important;
                  background: #111827 !important;
                  opacity: 0.6;
                }
              `}</style>
              
              <Calendar
                onChange={setCalendarDate}
                value={calendarDate}
                className="rounded-xl shadow-lg"
                minDate={new Date()}
                tileClassName={({ date, view }) => {
                  if (view !== 'month') return '';
                  const dateStr = toLocalDateString(date);
                  const selectedStr = calendarDate ? toLocalDateString(calendarDate) : null;
                  const todayStr = today;
                  // Only highlight selected day in blue, not today unless selected
                  if (selectedStr && dateStr === selectedStr) {
                    return document.documentElement.classList.contains('dark') ? 'selected-blue-dark' : 'selected-blue';
                  }
                  // Subtle highlight for today if not selected
                  if (dateStr === todayStr) {
                    return document.documentElement.classList.contains('dark') ? 'today-outline-dark' : 'today-outline';
                  }
                  // Disabled/past days
                  const now = new Date();
                  if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
                    return document.documentElement.classList.contains('dark') ? 'disabled-dark' : 'disabled';
                  }
                  return '';
                }}
              />
              
              {/* Quiz Info */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">Quiz Details</span>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Questions:</span> {selectedQuestions.length}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Date:</span> {calendarDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveToCalendar}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Schedule Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50">
          <div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 max-w-sm transform transition-all duration-300 scale-100"
            style={{
              animation: 'slideInFromRight 0.3s ease-out'
            }}
          >
            <style>{`
              @keyframes slideInFromRight {
                from {
                  transform: translateX(100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
            `}</style>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                toastError 
                  ? 'bg-gradient-to-br from-red-400 to-red-600' 
                  : 'bg-gradient-to-br from-green-400 to-green-600'
              }`}>
                {toastError ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {toastError ? 'Scheduling Failed' : 'Quiz Scheduled Successfully!'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {toastError ? 'Please try again' : `Scheduled for ${toastDate}`}
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex-shrink-0"
              >
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-300 ${
                  toastError 
                    ? 'bg-gradient-to-r from-red-400 to-red-600' 
                    : 'bg-gradient-to-r from-green-400 to-green-600'
                }`}
                style={{ 
                  width: '100%',
                  animation: 'progressBar 4s linear'
                }}
              ></div>
            </div>
            <style>{`
              @keyframes progressBar {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionSelector; 