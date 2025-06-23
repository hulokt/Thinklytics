import React, { useState, useEffect } from 'react';
import { useQuizHistory, useInProgressQuizzes, useQuestionAnswers } from '../hooks/useUserData';

const QuizHistory = ({ onBack, onResumeQuiz }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingAnswers, setEditingAnswers] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [currentView, setCurrentView] = useState('list');

  // Use Supabase hooks
  const { 
    data: quizHistory, 
    upsertData: upsertQuizHistory, 
    refreshData: refreshQuizHistory 
  } = useQuizHistory();
  
  const { 
    data: inProgressQuizzes, 
    upsertData: upsertInProgressQuizzes, 
    refreshData: refreshInProgressQuizzes 
  } = useInProgressQuizzes();
  
  const { 
    data: questionAnswers, 
    upsertData: upsertQuestionAnswers 
  } = useQuestionAnswers();

  // Ensure both arrays are properly formatted
  const inProgressQuizzesArray = Array.isArray(inProgressQuizzes) ? inProgressQuizzes : [];
  const quizHistoryArray = Array.isArray(quizHistory) ? quizHistory : [];

  // Combine both completed and in-progress quizzes
  const allQuizData = [
    ...quizHistoryArray,
    ...inProgressQuizzesArray.map(quiz => ({ ...quiz, isInProgress: true }))
  ];

  // Force re-render when quiz data changes
  useEffect(() => {
    // This will trigger a re-render when quiz history updates
  }, [quizHistory, inProgressQuizzes]);

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setEditingQuiz(null);
    setEditingAnswers({});
  };

  const handleEditQuiz = (quiz) => {
    // Only allow editing completed quizzes, not in-progress ones
    if (quiz.isInProgress) {
      alert('Cannot edit in-progress quizzes. Please complete the quiz first.');
      return;
    }
    
    console.log('🔧 Starting edit mode for quiz:', quiz);
    console.log('🔧 Quiz questions:', quiz.questions);
    
    // Initialize editing answers with current user answers converted to letters
    const initialEditingAnswers = {};
    quiz.questions.forEach(question => {
      console.log(`🔧 Processing question ${question.id}:`);
      console.log(`   userAnswer: "${question.userAnswer}"`);
      console.log(`   correctAnswer: "${question.correctAnswer}"`);
      
      if (question.userAnswer) {
        // Convert user answer to letter format if it's text
        let userAnswerLetter = question.userAnswer;
        
        // If the user answer is not already a letter, find the corresponding letter
        if (!['A', 'B', 'C', 'D'].includes(question.userAnswer)) {
          const choices = question.answerChoices || {};
          for (const [letter, text] of Object.entries(choices)) {
            if (text === question.userAnswer) {
              userAnswerLetter = letter;
              console.log(`   ✅ Converted text "${question.userAnswer}" to letter "${letter}"`);
              break;
            }
          }
          
          // Fallback: check options array
          if (!['A', 'B', 'C', 'D'].includes(userAnswerLetter) && question.options) {
            const answerIndex = question.options.findIndex(option => option === question.userAnswer);
            if (answerIndex !== -1) {
              userAnswerLetter = ['A', 'B', 'C', 'D'][answerIndex];
              console.log(`   ✅ Converted option "${question.userAnswer}" to letter "${userAnswerLetter}"`);
            }
          }
        }
        
        initialEditingAnswers[question.id] = userAnswerLetter;
        console.log(`   📝 Set editing answer: "${userAnswerLetter}"`);
      } else {
        console.log(`   ❌ No user answer found for question ${question.id}`);
      }
    });
    
    console.log('🔧 Initial editing answers:', initialEditingAnswers);
    
    setEditingQuiz(quiz);
    setEditingAnswers(initialEditingAnswers);
    setSelectedQuiz(null);
    setSelectedQuestionIndex(0);
  };

  const handleDeleteQuiz = (quiz) => {
    setShowDeleteConfirm(quiz);
  };

  const renumberCompletedQuizzes = (quizHistoryArray) => {
    // Sort by date ascending (oldest first)
    const sorted = [...quizHistoryArray].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.map((quiz, idx) => ({ ...quiz, quizNumber: idx + 1 }));
  };

  const confirmDeleteQuiz = async () => {
    if (!showDeleteConfirm) return;
    try {
      if (showDeleteConfirm.isInProgress) {
        // Remove from in-progress quizzes
        const updatedInProgress = inProgressQuizzesArray.filter(q => q.id !== showDeleteConfirm.id);
        await upsertInProgressQuizzes(updatedInProgress);
        await refreshInProgressQuizzes();
      } else {
        // Remove from completed quiz history
        const updatedHistory = quizHistoryArray.filter(q => q.id !== showDeleteConfirm.id);
        // Renumber remaining completed quizzes
        const renumberedHistory = renumberCompletedQuizzes(updatedHistory);
        await upsertQuizHistory(renumberedHistory);
        await refreshQuizHistory();
        // Update question answers to remove this quiz's results
        if (questionAnswers && showDeleteConfirm.questions) {
          const updatedAnswers = { ...questionAnswers };
          showDeleteConfirm.questions.forEach(question => {
            if (updatedAnswers[question.id]) {
              updatedAnswers[question.id] = updatedAnswers[question.id].filter(
                answer => answer.quizId !== showDeleteConfirm.id
              );
              if (updatedAnswers[question.id].length === 0) {
                delete updatedAnswers[question.id];
              }
            }
          });
          await upsertQuestionAnswers(updatedAnswers);
        }
      }
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error during quiz deletion:', error);
      setShowDeleteConfirm(null);
    }
  };

  const cancelDeleteQuiz = () => {
    setShowDeleteConfirm(null);
  };

  // Helper function to get the correct answer letter for a question
  const getCorrectAnswerLetter = (question) => {
    console.log('🔍 getCorrectAnswerLetter called for question:', question.id);
    console.log('   Question correctAnswer:', question.correctAnswer);
    console.log('   Question answerChoices:', question.answerChoices);
    console.log('   Question options:', question.options);
    
    if (!question.answerChoices && !question.options) {
      console.log('   ❌ No answer choices or options found');
      return null;
    }
    
    const choices = question.answerChoices || {};
    const options = question.options || [];
    
    // Check if correctAnswer is already a letter (A, B, C, D)
    if (['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
      console.log('   ✅ correctAnswer is already a letter:', question.correctAnswer);
      return question.correctAnswer;
    }
    
    // Find which letter corresponds to the correct answer text
    for (const [letter, text] of Object.entries(choices)) {
      if (text === question.correctAnswer) {
        console.log('   ✅ Found matching text for letter:', letter, 'text:', text);
        return letter;
      }
    }
    
    // Fallback: check options array
    const correctIndex = options.findIndex(option => option === question.correctAnswer);
    if (correctIndex !== -1) {
      const letter = ['A', 'B', 'C', 'D'][correctIndex];
      console.log('   ✅ Found matching option at index:', correctIndex, 'letter:', letter);
      return letter;
    }
    
    console.log('   ❌ No matching answer found, returning null');
    return null;
  };

  const handleAnswerChange = (questionId, newAnswer) => {
    console.log(`🔄 ANSWER CHANGE: Question ${questionId} -> ${newAnswer}`);
    console.log('📝 Previous editing answers:', editingAnswers);
    
    setEditingAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: newAnswer
      };
      console.log('📝 NEW editing answers:', updated);
      
      // Find the question to see if answer is correct
      const question = editingQuiz.questions.find(q => q.id === questionId);
      if (question) {
        const correctLetter = getCorrectAnswerLetter(question);
        const isCorrect = newAnswer === correctLetter;
        console.log(`✅ Question ${questionId}: "${newAnswer}" is ${isCorrect ? 'CORRECT' : 'WRONG'}`);
        console.log(`   Correct answer text: "${question.correctAnswer}"`);
        console.log(`   Correct answer letter: "${correctLetter}"`);
      }
      
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    console.log('💾 ========== SAVE CHANGES STARTED ==========');
    console.log('📝 Editing Quiz:', editingQuiz);
    console.log('📝 Editing Answers:', editingAnswers);
    
    if (!editingQuiz || !editingQuiz.questions) {
      console.log('❌ No editing quiz or questions found');
      return;
    }

    try {
      console.log('🔄 Building updated questions...');
      
      // Build updated questions with current answers
      const updatedQuestions = editingQuiz.questions.map((question, index) => {
        // Get current answer, converting from text to letter format if needed
        let currentAnswer = editingAnswers.hasOwnProperty(question.id) 
          ? editingAnswers[question.id] 
          : question.userAnswer;
        
        // Ensure the current answer is in letter format
        if (currentAnswer && !['A', 'B', 'C', 'D'].includes(currentAnswer)) {
          const choices = question.answerChoices || {};
          for (const [letter, text] of Object.entries(choices)) {
            if (text === currentAnswer) {
              currentAnswer = letter;
              break;
            }
          }
          
          // Fallback: check options array
          if (!['A', 'B', 'C', 'D'].includes(currentAnswer) && question.options) {
            const answerIndex = question.options.findIndex(option => option === currentAnswer);
            if (answerIndex !== -1) {
              currentAnswer = ['A', 'B', 'C', 'D'][answerIndex];
            }
          }
        }
        
        const correctLetter = getCorrectAnswerLetter(question);
        const isCorrect = currentAnswer === correctLetter;
        
        console.log(`📋 Q${index + 1} (ID: ${question.id}):`);
        console.log(`   Original answer: "${question.userAnswer}"`);
        console.log(`   Edited answer: "${editingAnswers[question.id] || 'NOT CHANGED'}"`);
        console.log(`   Final answer: "${currentAnswer}"`);
        console.log(`   Correct answer text: "${question.correctAnswer}"`);
        console.log(`   Correct answer letter: "${correctLetter}"`);
        console.log(`   Is correct: ${isCorrect}`);
        
        return {
          ...question,
          userAnswer: currentAnswer,
          isCorrect: isCorrect
        };
      });

      // Calculate new statistics
      const correctCount = updatedQuestions.filter(q => q.isCorrect).length;
      const totalQuestions = updatedQuestions.length;
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      console.log('📊 STATISTICS:');
      console.log(`   Correct: ${correctCount}/${totalQuestions}`);
      console.log(`   Score: ${score}%`);

      // Create updated quiz
      const updatedQuiz = {
        ...editingQuiz,
        questions: updatedQuestions,
        score: score,
        correctAnswers: correctCount,
        totalQuestions: totalQuestions,
        lastModified: new Date().toISOString()
      };

      console.log('📦 Updated Quiz Object:', updatedQuiz);

      // Update quiz history
      const currentHistoryArray = Array.isArray(quizHistory) ? quizHistory : [];
      console.log('📚 Current Quiz History Length:', currentHistoryArray.length);
      
      const updatedHistory = currentHistoryArray.map(quiz => {
        if (quiz.id === editingQuiz.id) {
          console.log(`🔄 Replacing quiz ${quiz.id} with updated version`);
          return updatedQuiz;
        }
        return quiz;
      });
      
      console.log('💾 Saving to quiz history...');
      await upsertQuizHistory(updatedHistory);
      console.log('✅ Quiz history saved');
      
      // Update question answers for analytics
      const currentAnswers = questionAnswers || {};
      const updatedAnswers = { ...currentAnswers };
      
      console.log('📈 Updating question answers for analytics...');
      updatedQuestions.forEach(question => {
        if (question.userAnswer) {
          if (!updatedAnswers[question.id]) {
            updatedAnswers[question.id] = [];
          }
          
          // Remove existing answer for this quiz
          const beforeLength = updatedAnswers[question.id].length;
          updatedAnswers[question.id] = updatedAnswers[question.id].filter(
            answer => answer.quizId !== editingQuiz.id
          );
          const afterLength = updatedAnswers[question.id].length;
          console.log(`   Q${question.id}: removed ${beforeLength - afterLength} old answers`);
          
          // Add new answer
          updatedAnswers[question.id].push({
            quizId: editingQuiz.id,
            answer: question.userAnswer,
            isCorrect: question.isCorrect,
            date: editingQuiz.date || new Date().toISOString()
          });
          console.log(`   Q${question.id}: added new answer "${question.userAnswer}" (${question.isCorrect ? 'correct' : 'wrong'})`);
        }
      });
      
      await upsertQuestionAnswers(updatedAnswers);
      console.log('✅ Question answers updated');
      
      // Force refresh quiz history to ensure UI updates
      console.log('🔄 Refreshing quiz history...');
      await refreshQuizHistory();
      console.log('✅ Quiz history refreshed');
      
      // Exit edit mode and show updated quiz
      console.log('🚪 Exiting edit mode...');
      setEditingQuiz(null);
      setEditingAnswers({});
      setSelectedQuiz(updatedQuiz);
      console.log('✅ Edit mode exited, showing updated quiz');
      
      // Force a state refresh if data isn't updating
      setTimeout(() => {
        console.log('🔄 Additional refresh after 100ms...');
        refreshQuizHistory();
      }, 100);
      
      console.log('✅ ========== SAVE CHANGES COMPLETED ==========');
      
    } catch (error) {
      console.error('❌ ========== SAVE CHANGES FAILED ==========');
      console.error('Error details:', error);
      alert('Error saving changes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingQuiz(null);
    setEditingAnswers({});
    setSelectedQuiz(null);
    setSelectedQuestionIndex(0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get quiz display number - fix the "a" issue
  const getQuizDisplayNumber = (quiz) => {
    if (quiz.quizNumber && typeof quiz.quizNumber === 'number') {
      return quiz.quizNumber;
    }
    
    // Fallback: use index + 1 if quiz number is missing or invalid
    const allQuizzesSorted = [...allQuizData].sort((a, b) => new Date(a.date || a.lastUpdated) - new Date(b.date || b.lastUpdated));
    const index = allQuizzesSorted.findIndex(q => q.id === quiz.id);
    return index >= 0 ? index + 1 : 1;
  };

  // Separate in-progress and completed quizzes, sort by latest first
  const inProgressQuizzesSorted = allQuizData
    .filter(quiz => quiz.isInProgress)
    .sort((a, b) => new Date(b.lastUpdated || b.date) - new Date(a.lastUpdated || a.date));

  const completedQuizzes = allQuizData
    .filter(quiz => !quiz.isInProgress)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Delete confirmation modal
  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full transition-colors duration-300">
          <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-4 transition-colors duration-300">Confirm Delete</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">
            {showDeleteConfirm.isInProgress 
              ? "Are you sure you want to delete this in-progress quiz? This action cannot be undone."
              : "Are you sure you want to delete this quiz? This will reset the question statuses for all questions in this quiz and cannot be undone."
            }
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={cancelDeleteQuiz}
              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteQuiz}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

    if (editingQuiz && editingQuiz.questions) {
    // Calculate real-time statistics using current answers
    const updatedQuestions = editingQuiz.questions.map(question => {
      // Use editing answer if available, otherwise convert original user answer to letter format
      let currentAnswer = editingAnswers[question.id];
      
      if (currentAnswer === undefined) {
        // Convert original user answer to letter format
        currentAnswer = question.userAnswer;
        if (currentAnswer && !['A', 'B', 'C', 'D'].includes(currentAnswer)) {
          const choices = question.answerChoices || {};
          for (const [letter, text] of Object.entries(choices)) {
            if (text === currentAnswer) {
              currentAnswer = letter;
              break;
            }
          }
          
          // Fallback: check options array
          if (!['A', 'B', 'C', 'D'].includes(currentAnswer) && question.options) {
            const answerIndex = question.options.findIndex(option => option === currentAnswer);
            if (answerIndex !== -1) {
              currentAnswer = ['A', 'B', 'C', 'D'][answerIndex];
            }
          }
        }
      }
      
      const correctLetter = getCorrectAnswerLetter(question);
      console.log(`📊 Question ${question.id}: current="${currentAnswer}" correct="${correctLetter}" isCorrect=${currentAnswer === correctLetter}`);
      
      return {
        ...question,
        userAnswer: currentAnswer,
        isCorrect: currentAnswer === correctLetter
      };
    });
    
    const correctCount = updatedQuestions.filter(q => q.isCorrect).length;
    const newScore = Math.round((correctCount / updatedQuestions.length) * 100);
    
    console.log(`📊 REAL-TIME STATS: ${correctCount}/${updatedQuestions.length} = ${newScore}%`);
    
    return (
      <div className="h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
        {/* Header - EXACT copy from view page */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Quiz Details</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
                Review your performance and answers for this quiz.
              </p>
            </div>
                      </div>
          </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="w-full px-6 py-6 h-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 transition-colors duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-900 dark:text-white text-lg font-bold transition-colors duration-300">
                  Quiz from {formatDate(editingQuiz.date)}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingQuiz(null);
                      setEditingAnswers({});
                      setSelectedQuiz(editingQuiz); // Go back to view mode
                    }}
                    className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Statistics - EXACT copy from view page but with real-time updates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{newScore}%</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{correctCount}</div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {updatedQuestions.length - correctCount}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Incorrect</div>
                </div>
              </div>

              {editingQuiz.timeSpent !== undefined && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4 mb-6 text-center transition-colors duration-300">
                  <p className="text-blue-800 dark:text-blue-300 text-sm transition-colors duration-300">
                    This quiz took you <strong>{formatTime(editingQuiz.timeSpent)}</strong>
                  </p>
                </div>
              )}

              {/* Questions - EXACT copy from view page but with clickable options */}
              <div className="space-y-4">
                {editingQuiz.questions.map((question, index) => {
                  // Get current answer, converting from text to letter format if needed
                  let currentAnswer = editingAnswers[question.id];
                  
                  if (currentAnswer === undefined) {
                    // Convert original user answer to letter format
                    currentAnswer = question.userAnswer;
                    if (currentAnswer && !['A', 'B', 'C', 'D'].includes(currentAnswer)) {
                      const choices = question.answerChoices || {};
                      for (const [letter, text] of Object.entries(choices)) {
                        if (text === currentAnswer) {
                          currentAnswer = letter;
                          break;
                        }
                      }
                      
                      // Fallback: check options array
                      if (!['A', 'B', 'C', 'D'].includes(currentAnswer) && question.options) {
                        const answerIndex = question.options.findIndex(option => option === currentAnswer);
                        if (answerIndex !== -1) {
                          currentAnswer = ['A', 'B', 'C', 'D'][answerIndex];
                        }
                      }
                    }
                  }
                  
                  return (
                    <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-gray-900 dark:text-white font-medium transition-colors duration-300">Question {index + 1}</h4>
                        <div className="flex gap-2">
                          {currentAnswer === getCorrectAnswerLetter(question) ? (
                            <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                          ) : (
                            <span className="text-red-600 text-sm font-medium">✗ Incorrect</span>
                          )}
                          {editingQuiz.flaggedQuestions?.includes(question.id) && (
                            <span className="text-yellow-600 text-sm font-medium">🚩 Flagged</span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-900 dark:text-white mb-3 transition-colors duration-300">{question.questionText}</p>
                      
                      <div className="space-y-2 mb-3">
                        {['A', 'B', 'C', 'D'].map((choice, optionIndex) => {
                          const answerText = question.answerChoices ? question.answerChoices[choice] : (question.options && question.options[optionIndex]);
                          const correctLetter = getCorrectAnswerLetter(question);
                          const isCorrectAnswer = choice === correctLetter;
                          const isUserAnswer = choice === currentAnswer;
                          
                          // Dynamic highlighting: green if correct answer is selected, red if wrong answer is selected
                          let bgColor, borderColor, textColor;
                          if (isUserAnswer && isCorrectAnswer) {
                            // User selected the correct answer - GREEN
                            bgColor = 'bg-green-100 dark:bg-green-900/30';
                            borderColor = 'border-green-300 dark:border-green-600';
                            textColor = 'text-green-800 dark:text-green-300';
                          } else if (isUserAnswer && !isCorrectAnswer) {
                            // User selected wrong answer - RED
                            bgColor = 'bg-red-100 dark:bg-red-900/30';
                            borderColor = 'border-red-300 dark:border-red-600';
                            textColor = 'text-red-800 dark:text-red-300';
                          } else {
                            // Not selected - GRAY
                            bgColor = 'bg-gray-50 dark:bg-gray-700';
                            borderColor = 'border-gray-200 dark:border-gray-600';
                            textColor = 'text-gray-900 dark:text-white';
                          }
                          
                          return (
                            <label
                              key={choice}
                              className={`block p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-600 ${bgColor} ${borderColor} ${textColor}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={choice}
                                    checked={currentAnswer === choice}
                                    onChange={() => handleAnswerChange(question.id, choice)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span><strong>{choice}:</strong> {answerText}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isUserAnswer && (
                                    <span className="text-blue-600 font-medium text-sm">Your Answer</span>
                                  )}
                                  {isCorrectAnswer && !isUserAnswer && (
                                    <span className="text-green-600 font-medium text-sm">Correct Answer</span>
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      
                      {question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-3 transition-colors duration-300">
                          <p className="text-blue-800 dark:text-blue-300 text-sm transition-colors duration-300">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header - Modern Design */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Quiz History</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
              Review your quiz results and track your progress over time.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
              }`}
            >
              Quiz List
            </button>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm font-medium"
            >
              Back to Selector
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="w-full px-6 py-6 h-full">
          <div className="max-w-7xl mx-auto h-full">
          {(allQuizData.length === 0) ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center transition-colors duration-300">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">No quiz history yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Complete your first quiz to see your results here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* In Progress Quizzes Section */}
              {inProgressQuizzesSorted.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-lg font-semibold transition-colors duration-300">In Progress Quizzes</h2>
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs font-medium transition-colors duration-300">
                      {inProgressQuizzesSorted.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {inProgressQuizzesSorted.map((quiz) => (
                      <div key={quiz.id} className="bg-white dark:bg-gray-800 rounded border-l-4 border-yellow-400 shadow-sm hover:shadow transition-shadow transition-colors duration-300">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                                  Quiz #{quiz.quizNumber || 'N/A'} - {formatDate(quiz.lastUpdated || quiz.date)}
                                </h3>
                                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs transition-colors duration-300">
                                  In Progress
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">
                                {quiz.questions.length} questions • Progress: {Object.keys(quiz.userAnswers || {}).length}/{quiz.questions.length} answered
                              </p>
                              <p className="text-gray-500 dark:text-gray-500 text-xs transition-colors duration-300">
                                Last updated: {new Date(quiz.lastUpdated || quiz.date).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => onResumeQuiz(quiz)}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Resume
                              </button>
                              <button
                                onClick={() => handleDeleteQuiz(quiz)}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Quizzes Section */}
              {completedQuizzes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-lg font-semibold transition-colors duration-300">Completed Quizzes</h2>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-medium transition-colors duration-300">
                      {completedQuizzes.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {completedQuizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="bg-white dark:bg-gray-800 rounded border-l-4 border-green-400 shadow-sm hover:shadow cursor-pointer transition-all duration-200 hover:scale-[1.01] transition-colors duration-300"
                        onClick={() => handleQuizSelect(quiz)}
                      >
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                                  Quiz #{getQuizDisplayNumber(quiz)} - {formatDate(quiz.date)}
                                </h3>
                                <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-300 ${
                                  quiz.score >= 80 
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                    : quiz.score >= 60 
                                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                                }`}>
                                  {quiz.score}%
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 transition-colors duration-300">
                                {quiz.questions.length} questions • 
                                {quiz.questions.filter(q => {
                                  const correctAnswer = getCorrectAnswerLetter(q);
                                  return q.userAnswer === correctAnswer;
                                }).length} correct • 
                                {quiz.timeSpent ? formatTime(quiz.timeSpent) : 'No time recorded'}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditQuiz(quiz);
                                }}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuiz(quiz);
                                }}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Quiz Details View */}
      {selectedQuiz && (
        <div className="h-[90vh] overflow-hidden flex flex-col">
          {/* Header - Consistent with Question Logger */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Quiz Details</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
                  Review your performance and answers for this quiz.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full px-6 py-6 h-full">

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 transition-colors duration-300">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-gray-900 dark:text-white text-lg font-bold transition-colors duration-300">
                    Quiz from {formatDate(selectedQuiz.date)}
                    {selectedQuiz.isInProgress && (
                      <span className="ml-2 text-yellow-600 text-sm font-medium">(In Progress)</span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedQuiz(null)}
                      className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300"
                    >
                      Back to History
                    </button>
                    {!selectedQuiz.isInProgress && (
                      <button
                        onClick={() => handleEditQuiz(selectedQuiz)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
                      >
                        Edit Answers
                      </button>
                    )}
                    {selectedQuiz.isInProgress && (
                      <button
                        onClick={() => onResumeQuiz(selectedQuiz)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300"
                      >
                        Resume Quiz
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{selectedQuiz.score}%</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{selectedQuiz.correctAnswers}</div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {selectedQuiz.totalQuestions - selectedQuiz.correctAnswers}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Incorrect</div>
                  </div>
                </div>

                {!selectedQuiz.isInProgress && selectedQuiz.timeSpent !== undefined && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-4 mb-6 text-center transition-colors duration-300">
                    <p className="text-blue-800 dark:text-blue-300 text-sm transition-colors duration-300">
                      This quiz took you <strong>{formatTime(selectedQuiz.timeSpent)}</strong>
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {selectedQuiz.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 transition-colors duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-gray-900 dark:text-white font-medium transition-colors duration-300">Question {index + 1}</h4>
                        <div className="flex gap-2">
                          {question.isCorrect ? (
                            <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                          ) : (
                            <span className="text-red-600 text-sm font-medium">✗ Incorrect</span>
                          )}
                          {selectedQuiz.flaggedQuestions?.includes(question.id) && (
                            <span className="text-yellow-600 text-sm font-medium">🚩 Flagged</span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-900 dark:text-white mb-3 transition-colors duration-300">{question.questionText}</p>
                      
                      <div className="space-y-2 mb-3">
                        {['A', 'B', 'C', 'D'].map((choice, optionIndex) => {
                          const answerText = question.answerChoices ? question.answerChoices[choice] : (question.options && question.options[optionIndex]);
                          const isCorrect = choice === question.correctAnswer || answerText === question.correctAnswer;
                          const isUserAnswer = choice === question.userAnswer || answerText === question.userAnswer;
                          
                          return (
                            <div
                              key={choice}
                              className={`p-3 rounded-lg border transition-colors duration-300 ${
                                isCorrect
                                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-600 text-green-800 dark:text-green-300'
                                  : isUserAnswer && !isCorrect
                                  ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-600 text-red-800 dark:text-red-300'
                                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white'
                              }`}
                            >
                              <span><strong>{choice}:</strong> {answerText}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {question.explanation && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-3 transition-colors duration-300">
                          <p className="text-blue-800 dark:text-blue-300 text-sm transition-colors duration-300">
                            <strong>Explanation:</strong> {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistory; 