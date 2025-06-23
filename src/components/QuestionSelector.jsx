import React, { useState, useEffect } from 'react';
import AnimatedQuestionList from './AnimatedQuestionList';
import { useQuestionAnswers, useQuizHistory } from '../hooks/useUserData';
import { 
  SAT_SECTIONS, 
  getDomainOptions, 
  getQuestionTypeOptions,
  READING_WRITING_DOMAINS,
  READING_WRITING_TYPES,
  MATH_DOMAINS,
  MATH_TYPES
} from '../data';

const QuestionSelector = ({ questions, onStartQuiz, onResumeQuiz, inProgressQuizzes }) => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [filters, setFilters] = useState({
    section: 'All',
    domain: 'All',
    questionType: 'All',
    difficulty: 'All',
    status: 'All'
  });
  const [sortBy, setSortBy] = useState('unsolved-first');
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Get question answers and quiz history from Supabase
  const { data: questionAnswers } = useQuestionAnswers();
  const { data: quizHistory } = useQuizHistory();

  useEffect(() => {
    console.log('🔄 useEffect triggered by dependency change:', {
      questionsLength: questions?.length,
      sortBy,
      filtersStr: JSON.stringify(filters),
      hasQuestionAnswers: !!questionAnswers
    });
    applyFilters();
  }, [questions, filters, sortBy, questionAnswers, quizHistory, inProgressQuizzes]);

  const applyFilters = () => {
    console.log('🔄 Applying filters and sorting...', {
      totalQuestions: questions.length,
      sortBy,
      filters,
      hasQuestionAnswers: !!questionAnswers,
      questionAnswersKeys: questionAnswers ? Object.keys(questionAnswers).length : 0
    });

    let filtered = [...questions];

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

    console.log(`📊 After filtering: ${filtered.length} questions remaining`);

    // Apply sorting
    const sorted = applySorting(filtered);
    
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

  const getQuestionStatus = (questionId) => {
    if (!questionAnswers) {
      return 'not-attempted';
    }
    
    if (!questionAnswers[questionId]) {
      return 'not-attempted';
    }

    const answers = questionAnswers[questionId];
    
    if (!Array.isArray(answers) || answers.length === 0) {
      return 'not-attempted';
    }

    const correctCount = answers.filter(answer => answer && answer.isCorrect === true).length;
    const incorrectCount = answers.filter(answer => answer && answer.isCorrect === false).length;

    // Determine status based on answer history
    if (correctCount > 0 && incorrectCount > 0) {
      return 'mixed';
    } else if (correctCount > 0) {
      return 'correct';
    } else if (incorrectCount > 0) {
      return 'incorrect';
    } else {
      return 'not-attempted';
    }
  };

  const isQuestionFlagged = (questionId) => {
    // Check if question was flagged in any completed quiz
    const completedQuizzes = [...(quizHistory || []), ...(inProgressQuizzes || [])];
    return completedQuizzes.some(quiz => 
      quiz.flaggedQuestions && quiz.flaggedQuestions.includes(questionId)
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
    if (filters.section === 'All' && filters.domain === 'All') {
      // Show all question types from both sections
      return ['All', ...Object.values(READING_WRITING_TYPES), ...Object.values(MATH_TYPES)];
    } else if (filters.section === 'All' && filters.domain !== 'All') {
      // Determine section based on domain and show question types for that section
      const isReadingWritingDomain = Object.values(READING_WRITING_DOMAINS).includes(filters.domain);
      const isMathDomain = Object.values(MATH_DOMAINS).includes(filters.domain);
      
      if (isReadingWritingDomain) {
        return ['All', ...Object.values(READING_WRITING_TYPES)];
      } else if (isMathDomain) {
        return ['All', ...Object.values(MATH_TYPES)];
      } else {
        return ['All'];
      }
    } else if (filters.section !== 'All') {
      // Show question types for the selected section
      return ['All', ...getQuestionTypeOptions(filters.section)];
    } else {
      return ['All'];
    }
  };
  
  const questionTypes = getAvailableQuestionTypes();
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  return (
    <div className="h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header - Modern Design */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Quiz Builder</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
              Select questions and create your custom quiz with advanced filters
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="w-full px-6 py-6 h-full flex flex-col">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
          
          {/* Filters Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 flex-shrink-0 transition-colors duration-300">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Filter & Sort Questions</h3>
              <div className="flex items-center gap-2">
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
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Section</label>
                <select
                  value={filters.section}
                  onChange={(e) => handleFilterChange('section', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Domain</label>
                <select
                  value={filters.domain}
                  onChange={(e) => handleFilterChange('domain', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {domains.map(domain => (
                    <option key={domain} value={domain}>{domain}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Question Type</label>
                <select
                  value={filters.questionType}
                  onChange={(e) => handleFilterChange('questionType', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {questionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4 flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                  Questions ({filteredQuestions.length} available)
                </h3>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSelectAll}
                    className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors duration-300"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List - More Compact */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 overflow-hidden transition-colors duration-300" style={{ maxHeight: '600px' }}>
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 transition-colors duration-300">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">Select Questions for Quiz</h4>
            </div>
            <div className="p-1 h-full overflow-hidden">
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
                <div className="h-full">
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

          {/* Start Quiz Button - Below Questions List */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleStartQuiz}
              disabled={selectedQuestions.length === 0}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                selectedQuestions.length === 0
                  ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
              }`}
            >
              Start Quiz ({selectedQuestions.length})
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionSelector; 