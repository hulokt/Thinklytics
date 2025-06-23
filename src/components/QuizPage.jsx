import React, { useState, useEffect, useCallback } from 'react';
import { useQuizHistory, useInProgressQuizzes, useQuestionAnswers } from '../hooks/useUserData';
import { useAuth } from '../contexts/AuthContext';

const QuizPage = ({ questions, onBack, isResuming = false, initialQuizData = null }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [showQuestionNavigation, setShowQuestionNavigation] = useState(false);
  const [isStopwatchHidden, setIsStopwatchHidden] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showReviewPage, setShowReviewPage] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  // Get user for display name
  const { user } = useAuth();

  // Supabase hooks
  const { data: quizHistory, upsertData: upsertQuizHistory } = useQuizHistory();
  const { 
    data: inProgressQuizzes, 
    upsertData: upsertInProgressQuizzes, 
    refreshData: refreshInProgressQuizzes 
  } = useInProgressQuizzes();
  const { data: questionAnswers, upsertData: upsertQuestionAnswers } = useQuestionAnswers();

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return 'User';
    
    // Try to get name from user metadata first
    if (user.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    // Fall back to email prefix
    if (user.email) {
      const emailPrefix = user.email.split('@')[0];
      // Capitalize first letter and replace dots/underscores with spaces
      return emailPrefix
        .replace(/[._]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return 'User';
  };

  // Initialize start time based on whether resuming or starting new
  useEffect(() => {
    if (isResuming && initialQuizData) {
      // Use saved elapsed time if available, otherwise calculate from start time
      if (initialQuizData.timeSpent !== undefined) {
        setElapsedTime(initialQuizData.timeSpent);
        // Set start time to simulate continuous counting from where we left off
        const now = Date.now();
        setStartTime(now - (initialQuizData.timeSpent * 1000));
      } else if (initialQuizData.startTime) {
        // Fallback to original calculation
        const originalStartTime = new Date(initialQuizData.startTime).getTime();
        const now = Date.now();
        const calculatedElapsed = Math.floor((now - originalStartTime) / 1000);
        setElapsedTime(calculatedElapsed);
        setStartTime(originalStartTime);
      } else {
        // No timing data available, start fresh
        const now = Date.now();
        setStartTime(now);
        setElapsedTime(0);
      }
    } else {
      // New quiz - start fresh
      const now = Date.now();
      setStartTime(now);
      setElapsedTime(0);
    }
  }, [isResuming, initialQuizData]);

  // Timer effect - pause when showing results or component unmounts
  useEffect(() => {
    if (showResults) {
      return; // Don't run timer when showing results
    }
    
    const timer = setInterval(() => {
      const now = Date.now();
      const calculatedElapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(calculatedElapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, showResults]);

  // Save progress and pause timer when component unmounts (user exits quiz)
  useEffect(() => {
    return () => {
      // This cleanup function runs when component unmounts
      if (quizData && quizData.questions && !showResults) {
        const updatedQuizData = {
          ...quizData,
          userAnswers,
          currentQuestionIndex,
          flaggedQuestions: Array.from(flaggedQuestions),
          lastUpdated: new Date().toISOString(),
          timeSpent: elapsedTime // Save current elapsed time
        };
        
        // Save immediately when unmounting
        const saveOnExit = async () => {
          try {
            const inProgressArray = Array.isArray(inProgressQuizzes) ? inProgressQuizzes : [];
            const existingIndex = inProgressArray.findIndex(q => q.id === updatedQuizData.id);
            
            let updatedInProgress;
            if (existingIndex >= 0) {
              updatedInProgress = [...inProgressArray];
              updatedInProgress[existingIndex] = updatedQuizData;
            } else {
              updatedInProgress = [...inProgressArray, updatedQuizData];
            }
            
            await upsertInProgressQuizzes(updatedInProgress);
          } catch (error) {
            console.error('Error saving progress on exit:', error);
          }
        };
        
        saveOnExit();
      }
    };
  }, [quizData, userAnswers, currentQuestionIndex, flaggedQuestions, elapsedTime, showResults, inProgressQuizzes, upsertInProgressQuizzes]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to normalize question format
  const normalizeQuestion = (question) => {
    // Handle legacy questions that only have questionText (no separate passage)
    if (!question.passageText && question.questionText) {
      // For legacy questions, treat questionText as passage if it's long
      if (question.questionText.length > 200) {
        return {
          ...question,
          passageText: question.questionText,
          questionText: 'Which choice completes the text with the most logical and precise word or phrase?',
          options: question.options || Object.values(question.answerChoices || {}),
          correctAnswer: question.answerChoices ? question.answerChoices[question.correctAnswer] : question.correctAnswer
        };
      }
    }
    
    // Convert answerChoices format to options format if needed
    if (question.answerChoices && !question.options) {
      return {
        ...question,
        options: Object.values(question.answerChoices),
        correctAnswer: question.answerChoices[question.correctAnswer] || question.correctAnswer
      };
    }
    return question;
  };

  // Initialize quiz data
  useEffect(() => {
    if (!questions || questions.length === 0) {
      console.error('No questions provided to QuizPage');
      onBack();
      return;
    }

    if (isResuming && initialQuizData) {
      // Resume existing quiz
      setQuizData(initialQuizData);
      setUserAnswers(initialQuizData.userAnswers || {});
      setCurrentQuestionIndex(initialQuizData.currentQuestionIndex || 0);
      setFlaggedQuestions(new Set(initialQuizData.flaggedQuestions || []));
    } else {
      // Start new quiz - normalize all questions
      const normalizedQuestions = questions.map(normalizeQuestion);
      const newQuizData = {
        id: Date.now(),
        questions: normalizedQuestions.map(q => ({ ...q, userAnswer: null, isCorrect: null, flagged: false })),
        userAnswers: {},
        currentQuestionIndex: 0,
        flaggedQuestions: [],
        categories: {
          section: normalizedQuestions[0]?.section || 'Mixed',
          domain: normalizedQuestions[0]?.domain || 'Mixed',
          questionType: normalizedQuestions[0]?.questionType || 'Mixed'
        },
        startTime: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
        // Do NOT assign quizNumber here; only assign on completion
      };
      setQuizData(newQuizData);
    }
  }, [questions, isResuming, initialQuizData, onBack]);

  // Auto-save progress with debouncing
  const saveProgress = useCallback(async () => {
    if (quizData && quizData.questions) {
      const updatedQuizData = {
        ...quizData,
        userAnswers,
        currentQuestionIndex,
        flaggedQuestions: Array.from(flaggedQuestions),
        lastUpdated: new Date().toISOString()
      };
      
      try {
        const inProgressArray = Array.isArray(inProgressQuizzes) ? inProgressQuizzes : [];
        const existingIndex = inProgressArray.findIndex(q => q.id === updatedQuizData.id);
        
        let updatedInProgress;
        if (existingIndex >= 0) {
          updatedInProgress = [...inProgressArray];
          updatedInProgress[existingIndex] = updatedQuizData;
        } else {
          updatedInProgress = [...inProgressArray, updatedQuizData];
        }
        
        await upsertInProgressQuizzes(updatedInProgress);
        await refreshInProgressQuizzes();
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  }, [quizData, userAnswers, currentQuestionIndex, flaggedQuestions, inProgressQuizzes, upsertInProgressQuizzes, refreshInProgressQuizzes]);

  // Debounced auto-save - only save every 5 seconds or when user navigates
  useEffect(() => {
    if (quizData && quizData.questions) {
      const timer = setTimeout(() => {
        saveProgress();
      }, 5000); // Save every 5 seconds instead of immediately
      
      return () => clearTimeout(timer);
    }
  }, [userAnswers, flaggedQuestions]); // Only trigger on answer/flag changes

  // Save immediately when navigating between questions
  useEffect(() => {
    if (quizData && quizData.questions && currentQuestionIndex >= 0) {
      saveProgress();
    }
  }, [currentQuestionIndex]);

  const currentQuestion = quizData?.questions?.[currentQuestionIndex];

  const handleAnswerSelect = (answer) => {
    if (!currentQuestion) return;

    const isCorrect = answer === currentQuestion.correctAnswer;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === currentQuestionIndex 
          ? { ...q, userAnswer: answer, isCorrect }
          : q
      )
    }));
  };

  const handleFlagQuestion = () => {
    if (!currentQuestion) return;
    
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setShowQuestionNavigation(false);
  };

  const handleFinishQuiz = async () => {
    if (!quizData || !quizData.questions || isFinishing) return;
    setIsFinishing(true);
    try {
      // 1. Sync all answers from userAnswers to quizData.questions and recalculate isCorrect
      const syncedQuestions = quizData.questions.map(q => {
        const userAnswer = userAnswers[q.id] ?? q.userAnswer;
        // Try to convert userAnswer to letter if possible
        let userAnswerLetter = userAnswer;
        if (q.answerChoices && userAnswer && !['A', 'B', 'C', 'D'].includes(userAnswer)) {
          for (const [letter, text] of Object.entries(q.answerChoices)) {
            if (text === userAnswer) {
              userAnswerLetter = letter;
              break;
            }
          }
        }
        const correctLetter = q.answerChoices && q.correctAnswer && !['A', 'B', 'C', 'D'].includes(q.correctAnswer)
          ? Object.entries(q.answerChoices).find(([letter, text]) => text === q.correctAnswer)?.[0] || q.correctAnswer
          : q.correctAnswer;
        const isCorrect = userAnswerLetter === correctLetter;
        return {
          ...q,
          userAnswer: userAnswerLetter,
          isCorrect
        };
      });

      // 2. Update the in-progress quiz in the DB with the latest answers and stats
      const inProgressArray = Array.isArray(inProgressQuizzes) ? inProgressQuizzes : [];
      const updatedQuizData = {
        ...quizData,
        questions: syncedQuestions,
        userAnswers,
        flaggedQuestions: Array.from(flaggedQuestions),
        lastUpdated: new Date().toISOString(),
        timeSpent: elapsedTime
      };
      const inProgressIndex = inProgressArray.findIndex(q => q.id === quizData.id);
      let updatedInProgress = [...inProgressArray];
      if (inProgressIndex >= 0) {
        updatedInProgress[inProgressIndex] = updatedQuizData;
      }
      await upsertInProgressQuizzes(updatedInProgress);
      await refreshInProgressQuizzes();

      // 3. Remove the quiz from in-progress by id
      const refreshedInProgress = Array.isArray(inProgressQuizzes) ? inProgressQuizzes : [];
      const finalInProgress = refreshedInProgress.filter(q => q.id !== quizData.id);
      await upsertInProgressQuizzes(finalInProgress);
      await refreshInProgressQuizzes();

      // 4. Get current quiz history and deduplicate by id
      let currentHistoryArray = Array.isArray(quizHistory) ? quizHistory : [];
      // Remove any existing quiz with the same id
      currentHistoryArray = currentHistoryArray.filter(q => q.id !== quizData.id);
      // Add the new completed quiz
      const correctCount = syncedQuestions.filter(q => q.isCorrect).length;
      const completedQuiz = {
        ...quizData,
        questions: syncedQuestions,
        endTime: new Date().toISOString(),
        timeSpent: elapsedTime,
        score: Math.round((correctCount / syncedQuestions.length) * 100),
        totalQuestions: syncedQuestions.length,
        correctAnswers: correctCount,
        flaggedQuestions: Array.from(flaggedQuestions),
        isInProgress: false,
        date: new Date().toISOString(),
        userAnswers: userAnswers
      };
      // Add to history
      currentHistoryArray.push(completedQuiz);
      // 5. Renumber all completed quizzes sequentially
      const renumberedHistory = currentHistoryArray
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((quiz, idx) => ({ ...quiz, quizNumber: idx + 1 }));
      await upsertQuizHistory(renumberedHistory);


      // 6. Update question answers
      const currentAnswers = questionAnswers || {};
      const updatedAnswers = { ...currentAnswers };
      syncedQuestions.forEach(question => {
        if (question.userAnswer) {
          if (!updatedAnswers[question.id]) {
            updatedAnswers[question.id] = [];
          }
          updatedAnswers[question.id] = updatedAnswers[question.id].filter(
            answer => answer.quizId !== completedQuiz.id
          );
          updatedAnswers[question.id].push({
            quizId: completedQuiz.id,
            answer: question.userAnswer,
            isCorrect: question.isCorrect,
            date: completedQuiz.date
          });
        }
      });
      await upsertQuestionAnswers(updatedAnswers);
      // 7. Final check: ensure in-progress quiz is removed from UI and DB
      await refreshInProgressQuizzes();
      // 8. Now update UI
      onBack();
    } catch (error) {
      console.error('❌ Error finishing quiz:', error);
      onBack();
    } finally {
      setIsFinishing(false);
    }
  };

  const getProgressSegmentColor = (index) => {
    if (index < currentQuestionIndex) {
      return 'blue'; // Completed
    } else if (index === currentQuestionIndex) {
      return 'yellow'; // Current
    } else {
      return 'gray'; // Not reached
    }
  };

  if (!quizData || !quizData.questions || !currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading quiz...</div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex items-center justify-center p-4 h-screen">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Almost Done!</h2>
            <p className="text-gray-600">Here's how you performed</p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">{quizData.score}%</div>
              <div className="text-gray-600 font-medium">Overall Score</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {quizData.correctAnswers}
              </div>
              <div className="text-gray-600 font-medium">Correct Answers</div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {quizData.totalQuestions - quizData.correctAnswers}
              </div>
              <div className="text-gray-600 font-medium">Incorrect Answers</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Questions:</span>
                <span className="font-medium ml-2">{quizData.totalQuestions}</span>
              </div>
              <div>
                <span className="text-gray-600">Time Spent:</span>
                <span className="font-medium ml-2">{formatTime(elapsedTime)}</span>
              </div>
              <div>
                <span className="text-gray-600">Flagged for Review:</span>
                <span className="font-medium ml-2">{flaggedQuestions.size}</span>
              </div>
              <div>
                <span className="text-gray-600">Completion:</span>
                <span className="font-medium ml-2">
                  {Math.round((quizData.totalQuestions - quizData.correctAnswers) / quizData.totalQuestions * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setShowResults(false);
                setShowReviewPage(true);
              }}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Back to Review
            </button>
            <button
              onClick={handleFinishQuiz}
              disabled={isFinishing}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                isFinishing 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFinishing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Finishing...</span>
                </div>
              ) : (
                'Finish Quiz'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Review Page
  if (showReviewPage) {
    return (
      <div className="bg-gray-100 dark:bg-gray-900 flex flex-col h-screen overflow-hidden transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center flex-shrink-0 relative transition-colors duration-300">
          <div className="flex items-center">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Section 1: Reading and Writing Module 1</h1>
              <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center transition-colors duration-300">
                Directions <span className="material-icons text-sm">arrow_drop_down</span>
              </button>
            </div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
            <div className={`text-2xl font-bold text-gray-900 dark:text-white transition-opacity duration-300 ${isStopwatchHidden ? 'opacity-0' : 'opacity-100'}`}>
              {formatTime(elapsedTime)}
            </div>
            <button 
              onClick={() => setIsStopwatchHidden(!isStopwatchHidden)}
              className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
            >
              {isStopwatchHidden ? 'Show' : 'Hide'}
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center transition-colors duration-300">
              <span className="material-icons mr-1">edit</span> Annotate
            </button>
            <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center transition-colors duration-300">
              <span className="material-icons mr-1">more_vert</span> More
            </button>
          </div>
        </header>

        {/* Review Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
          {/* Check Your Work Section */}
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Check Your Work</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 transition-colors duration-300">
              On test day, you won't be able to move on to the next module until time expires.
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 transition-colors duration-300">
              For these practice questions, you can click <strong>Next</strong> when you're ready to move on.
            </p>
            
            {/* Separation Line */}
            <div className="w-full border-t border-gray-300 dark:border-gray-600 mb-8 transition-colors duration-300"></div>
          </div>

          {/* Question Grid Section */}
          <div className="flex-1 flex justify-center px-8 pb-8">
            <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-6 w-full max-w-4xl transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Section 1: Reading and Writing Module 1</h3>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <span className="w-3 h-3 border-2 border-dashed border-gray-400 dark:border-gray-500 mr-2 transition-colors duration-300"></span>
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <span className="material-icons text-base mr-1 text-red-500">bookmark</span>
                    <span>For Review</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex w-full mb-6">
                {quizData.questions.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-2 flex-1 ${
                      index < currentQuestionIndex 
                        ? 'bg-blue-500' 
                        : index === currentQuestionIndex 
                        ? 'bg-yellow-400' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
                </div>
                
              {/* Question Grid */}
              <div className="grid grid-cols-10 gap-2 mb-6 justify-items-center">
                {quizData.questions.map((question, index) => {
                  const isAnswered = userAnswers[question.id];
                  const isCurrent = index === currentQuestionIndex;
                  const isFlagged = flaggedQuestions.has(question.id);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setCurrentQuestionIndex(index);
                        setShowReviewPage(false);
                      }}
                      className={`relative p-2 text-center rounded cursor-pointer border-2 transition-all w-12 h-12 flex items-center justify-center ${
                        isAnswered 
                          ? 'bg-blue-500 border-blue-500 text-white' 
                          : 'border-dashed border-gray-400 dark:border-gray-500 text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                      } ${isCurrent ? 'ring-2 ring-black dark:ring-white' : ''}`}
                    >
                      <span className="font-medium text-sm">
                        {index + 1}
                      </span>
                      {isCurrent && (
                        <span className="material-icons absolute -top-6 left-1/2 transform -translate-x-1/2 text-black dark:text-white text-lg transition-colors duration-300">
                          location_on
                        </span>
                      )}
                      {isFlagged && (
                        <span className="material-icons absolute top-1 right-1 text-red-500 text-xs">
                          flag
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center flex-shrink-0 transition-colors duration-300">
          <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">Welcome, {getUserDisplayName()}</div>
          <div className="flex items-center space-x-2">
          <button
              onClick={() => setShowReviewPage(false)}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          >
              Back
          </button>
          <button
              onClick={handleFinishQuiz}
              disabled={isFinishing}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isFinishing 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
          >
              {isFinishing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Finishing...</span>
                </div>
              ) : (
                'Finish Quiz'
              )}
          </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex w-full flex-shrink-0">
          {quizData.questions.map((_, index) => (
            <div 
              key={index}
              className={`progress-bar-segment ${getProgressSegmentColor(index)}`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 transition-colors duration-300 flex flex-col h-screen overflow-hidden">
      <style>{`
        .progress-bar-segment {
          height: 6px;
          flex-grow: 1;
        }
        .progress-bar-segment.blue {
          background-color: #3b82f6;
        }
        .progress-bar-segment.yellow {
          background-color: #facc15;
        }
        .progress-bar-segment.gray {
          background-color: #e5e7eb;
        }
        .question-option {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          color: #374151;
        }
        .dark .question-option {
          border-color: #4b5563;
          color: #d1d5db;
        }
        .question-option:hover {
          background-color: #f3f4f6;
          border-color: #9ca3af;
        }
        .dark .question-option:hover {
          background-color: #374151;
          border-color: #6b7280;
        }
        .question-option.selected {
          background-color: #dbeafe;
          border-color: #3b82f6;
        }
        .dark .question-option.selected {
          background-color: #1e3a8a;
          border-color: #3b82f6;
        }
        .question-option.selected:hover {
          background-color: #bfdbfe;
          border-color: #2563eb;
        }
        .dark .question-option.selected:hover {
          background-color: #1e40af;
          border-color: #2563eb;
        }
        .option-letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.75rem;
          height: 1.75rem;
          border-radius: 50%;
          border: 1px solid #9ca3af;
          margin-right: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease-in-out;
          color: #374151;
        }
        .dark .option-letter {
          border-color: #6b7280;
          color: #d1d5db;
        }
        .question-option.selected .option-letter {
          background-color: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }
        /* Question box base styles - no hover effects */
        .question-box {
          border: 2px solid #e5e7eb;
          cursor: pointer;
          padding: 8px;
          margin: 4px;
          border-radius: 8px;
          min-height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
          color: #374151;
          font-weight: 500;
          font-size: 14px;
          position: relative;
        }
        .dark .question-box {
          border-color: #4b5563;
          background-color: #374151;
          color: #d1d5db;
        }
        
        /* DISABLE ALL HOVER/FOCUS/ACTIVE EFFECTS */
        .question-box:hover,
        .question-box:focus,
        .question-box:active,
        .question-box:focus-visible,
        .question-box:focus-within {
          border-color: #e5e7eb !important;
          background-color: #f9fafb !important;
          color: #374151 !important;
          transform: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .dark .question-box:hover,
        .dark .question-box:focus,
        .dark .question-box:active,
        .dark .question-box:focus-visible,
        .dark .question-box:focus-within {
          border-color: #4b5563 !important;
          background-color: #374151 !important;
          color: #d1d5db !important;
        }
        
        /* Current question indicator - only the arrow, same background */
        .question-box.current {
          /* Keep same colors as unanswered */
          border-color: #e5e7eb;
          background-color: #f9fafb;
          color: #374151;
        }
        .dark .question-box.current {
          border-color: #4b5563;
          background-color: #374151;
          color: #d1d5db;
        }
        .question-box.current::before {
          content: "\\e0c8";
          font-family: 'Material Icons';
          position: absolute;
          top: -24px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 24px;
          color: #374151; /* Dark icon for light mode */
        }
        .dark .question-box.current::before {
          color: #d1d5db; /* Light icon for dark mode */
        }
        .question-box.current:hover,
        .question-box.current:focus,
        .question-box.current:active,
        .question-box.current:focus-visible {
          border-color: #e5e7eb !important;
          background-color: #f9fafb !important;
          color: #374151 !important;
        }
        .dark .question-box.current:hover,
        .dark .question-box.current:focus,
        .dark .question-box.current:active,
        .dark .question-box.current:focus-visible {
          border-color: #4b5563 !important;
          background-color: #374151 !important;
          color: #d1d5db !important;
        }
        
        /* Answered questions - blue background */
        .question-box.answered {
          background-color: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }
        .dark .question-box.answered {
          background-color: #2563eb;
          border-color: #2563eb;
          color: white;
        }
        .question-box.answered span {
          color: white;
        }
        .question-box.answered:hover,
        .question-box.answered:focus,
        .question-box.answered:active,
        .question-box.answered:focus-visible {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
        }
        .dark .question-box.answered:hover,
        .dark .question-box.answered:focus,
        .dark .question-box.answered:active,
        .dark .question-box.answered:focus-visible {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
          color: white !important;
        }
        
        /* Flagged questions - only add the flag, no background changes */
        .question-box.flagged::after {
          content: "🚩";
          position: absolute;
          top: 2px;
          right: 2px;
          font-size: 12px;
          color: #ef4444;
        }
        
        /* Make sure flagged unanswered questions keep their base colors */
        .question-box.flagged:not(.answered):not(.current) {
          border-color: #e5e7eb;
          background-color: #f9fafb;
          color: #374151;
        }
        .dark .question-box.flagged:not(.answered):not(.current) {
          border-color: #4b5563;
          background-color: #374151;
          color: #d1d5db;
        }
        
        /* Flagged + Answered combination - Higher specificity */
        .question-box.answered.flagged {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
        }
        .dark .question-box.answered.flagged {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
          color: white !important;
        }
        .question-box.answered.flagged:hover,
        .question-box.answered.flagged:focus,
        .question-box.answered.flagged:active,
        .question-box.answered.flagged:focus-visible {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
          color: white !important;
        }
        .dark .question-box.answered.flagged:hover,
        .dark .question-box.answered.flagged:focus,
        .dark .question-box.answered.flagged:active,
        .dark .question-box.answered.flagged:focus-visible {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
          color: white !important;
        }
        
        /* Flagged + Current combination - same as current, just adds flag */
        .question-box.current.flagged {
          border-color: #e5e7eb;
          background-color: #f9fafb;
          color: #374151;
        }
        .dark .question-box.current.flagged {
          border-color: #4b5563;
          background-color: #374151;
          color: #d1d5db;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center flex-shrink-0 relative transition-colors duration-300">
        <div className="flex items-center">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Quiz {quizData?.quizNumber ?? 'N/A'}</h1>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center transition-colors duration-300">
              Directions <span className="material-icons text-sm">arrow_drop_down</span>
            </button>

          </div>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <div className={`text-2xl font-bold text-gray-900 dark:text-white transition-opacity duration-300 ${isStopwatchHidden ? 'opacity-0' : 'opacity-100'}`}>
            {formatTime(elapsedTime)}
          </div>
          <button
            onClick={() => setIsStopwatchHidden(!isStopwatchHidden)}
            className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            {isStopwatchHidden ? 'Show' : 'Hide'}
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center transition-colors duration-300">
            <span className="material-icons mr-1">edit</span> Annotate
          </button>
          <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center transition-colors duration-300">
            <span className="material-icons mr-1">more_vert</span> More
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side - Passage */}
        <div className="w-1/2 p-4 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300 flex flex-col">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300"> </p>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
              <span className="material-icons">fullscreen</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300 leading-relaxed">
              {currentQuestion.passageText || currentQuestion.questionText}
            </p>
          </div>
        </div>

        {/* Right Side - Question and Options */}
        <div className="w-1/2 p-4 overflow-y-auto bg-white dark:bg-gray-800 transition-colors duration-300 flex flex-col">
          <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <div className="flex items-center">
              <span className="bg-black dark:bg-gray-700 text-white text-sm font-semibold px-2 py-1 rounded-sm mr-2 transition-colors duration-300">
                {currentQuestionIndex + 1}
              </span>
              <button 
                onClick={handleFlagQuestion}
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white flex items-center transition-colors duration-300"
              >
                <span className={`material-icons text-lg mr-1 ${
                  flaggedQuestions.has(currentQuestion.id) ? 'text-red-500' : ''
                }`}>
                  {flaggedQuestions.has(currentQuestion.id) ? 'bookmark' : 'bookmark_border'}
                </span>
                <span className={flaggedQuestions.has(currentQuestion.id) ? 'text-red-500' : ''}>
                  Mark for Review
                </span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                <span className="material-icons">zoom_out_map</span>
              </button>
              <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                <span className="material-icons">abc</span>
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <p className="text-gray-700 dark:text-gray-300 mb-4 transition-colors duration-300">
              {currentQuestion.passageText ? currentQuestion.questionText : 'Which choice completes the text with the most logical and precise word or phrase?'}
            </p>
        <div className="space-y-3">
              {(currentQuestion.options || Object.values(currentQuestion.answerChoices || {})).map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
                const isSelected = userAnswers[currentQuestion.id] === option;
                
                return (
                  <div 
              key={index}
              onClick={() => handleAnswerSelect(option)}
                    className={`question-option ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="option-letter">{optionLetter}</span>
                    <span>{option}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center flex-shrink-0 transition-colors duration-300 relative">
        <div className="text-sm text-gray-700 dark:text-gray-300 transition-colors duration-300">Welcome, {getUserDisplayName()}</div>
        <div className="flex items-center space-x-2 relative">
          <button 
            onClick={() => setShowQuestionNavigation(!showQuestionNavigation)}
            className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
            <span className="material-icons text-sm align-middle">arrow_drop_down</span>
          </button>
          
          {/* Question Navigation Modal - Positioned above the question button */}
          {showQuestionNavigation && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-[420px] border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto transition-colors duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-lg font-semibold text-gray-800 dark:text-white transition-colors duration-300">Quiz {quizData?.quizNumber ?? 'N/A'}</h1>
                  <button 
                    onClick={() => setShowQuestionNavigation(false)}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-300 dark:border-gray-600 transition-colors duration-300 text-xs">
                  <div className="flex items-center text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <span className="material-icons text-base mr-2 text-blue-600">location_on</span>
                    <span>Current</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <span className="material-icons text-base mr-2 text-gray-400">check_box_outline_blank</span>
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300 transition-colors duration-300">
                    <span className="material-icons text-base mr-2 text-red-500">bookmark</span>
                    <span>For Review</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-8 gap-1 mb-6 p-2">
                  {quizData.questions.map((question, index) => {
                    const isAnswered = userAnswers[question.id];
                    const isCurrent = index === currentQuestionIndex;
                    const isFlagged = flaggedQuestions.has(question.id);
                    
                    return (
                      <div
                        key={index}
                        onClick={() => navigateToQuestion(index)}
                        className={`question-box cursor-pointer ${
                          isCurrent ? 'current' : ''
                        } ${isAnswered ? 'answered' : ''} ${isFlagged ? 'flagged' : ''}`}
                        style={{ transition: 'none' }}
                      >
                        <span className={`font-medium text-sm ${
                          isAnswered ? 'text-white dark:text-gray-800' : 
                          isCurrent ? 'text-white' : 
                          'text-gray-600 dark:text-gray-300'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setShowQuestionNavigation(false);
                    setShowReviewPage(true);
                  }}
                  className="w-full py-2 px-3 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-full hover:bg-blue-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm"
                >
                  Go to Review Page
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
        <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
            className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
        >
            Back
        </button>
            <button
            onClick={() => {
              if (currentQuestionIndex === quizData.questions.length - 1) {
                setShowReviewPage(true);
              } else {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-300"
          >
            Next
            </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex w-full flex-shrink-0">
        {quizData.questions.map((_, index) => (
          <div 
            key={index}
            className={`progress-bar-segment ${getProgressSegmentColor(index)}`}
          />
        ))}
      </div>
    </div>
  );
};

export default QuizPage; 