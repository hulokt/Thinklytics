// LocalStorage utility functions for SAT Master Log

const STORAGE_KEYS = {
  QUESTIONS: 'sat_master_log_questions',
  QUIZ_HISTORY: 'sat_master_log_quiz_history',
  IN_PROGRESS_QUIZZES: 'sat_master_log_in_progress_quizzes',
  QUESTION_ANSWERS: 'sat_master_log_question_answers'
};

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('localStorage is not available:', e);
    return false;
  }
};

// Questions management
export const saveQuestionsToStorage = (questions) => {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available, cannot save questions');
    return;
  }

  try {
    console.log('saveQuestionsToStorage called with:', questions);
    console.log('Questions type:', typeof questions);
    console.log('Questions length:', questions ? questions.length : 'null/undefined');
    
    // Ensure questions is an array
    if (!Array.isArray(questions)) {
      console.error('Questions is not an array:', questions);
      return;
    }
    
    const questionsString = JSON.stringify(questions);
    console.log('Serialized questions string length:', questionsString.length);
    
    // Check localStorage quota
    const currentSize = new Blob([questionsString]).size;
    console.log('Data size in bytes:', currentSize);
    
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, questionsString);
    
    // Verify the save
    const savedData = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    console.log('Verification - saved data retrieved:', savedData ? savedData.substring(0, 100) + '...' : 'null');
    
    console.log('Questions saved successfully to localStorage');
  } catch (error) {
    console.error('Error saving questions to localStorage:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      questionsType: typeof questions,
      questionsLength: questions ? questions.length : 'null/undefined'
    });
  }
};

export const loadQuestionsFromStorage = () => {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available, cannot load questions');
    return [];
  }

  try {
    console.log('loadQuestionsFromStorage called');
    console.log('Storage key:', STORAGE_KEYS.QUESTIONS);
    
    const questions = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    console.log('Raw data from localStorage:', questions ? questions.substring(0, 100) + '...' : 'null');
    
    if (!questions) {
      console.log('No questions found in localStorage, returning empty array');
      return [];
    }
    
    const parsedQuestions = JSON.parse(questions);
    console.log('Parsed questions:', parsedQuestions);
    console.log('Parsed questions type:', typeof parsedQuestions);
    console.log('Parsed questions length:', parsedQuestions ? parsedQuestions.length : 'null/undefined');
    
    // Ensure we return an array
    if (!Array.isArray(parsedQuestions)) {
      console.warn('Parsed questions is not an array, returning empty array');
      return [];
    }
    
    console.log('Questions loaded successfully from localStorage');
    return parsedQuestions;
  } catch (error) {
    console.error('Error loading questions from localStorage:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    return [];
  }
};

// Quiz history management
export const saveQuizHistoryToStorage = (quizHistory) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(quizHistory));
  } catch (error) {
    console.error('Error saving quiz history to localStorage:', error);
  }
};

export const loadQuizHistoryFromStorage = () => {
  try {
    const quizHistory = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    return quizHistory ? JSON.parse(quizHistory) : [];
  } catch (error) {
    console.error('Error loading quiz history from localStorage:', error);
    return [];
  }
};

// In-progress quizzes management
export const saveInProgressQuizzesToStorage = (inProgressQuizzes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.IN_PROGRESS_QUIZZES, JSON.stringify(inProgressQuizzes));
  } catch (error) {
    console.error('Error saving in-progress quizzes to localStorage:', error);
  }
};

export const loadInProgressQuizzesFromStorage = () => {
  try {
    const inProgressQuizzes = localStorage.getItem(STORAGE_KEYS.IN_PROGRESS_QUIZZES);
    return inProgressQuizzes ? JSON.parse(inProgressQuizzes) : [];
  } catch (error) {
    console.error('Error loading in-progress quizzes from localStorage:', error);
    return [];
  }
};

// Individual question answers tracking
export const saveQuestionAnswersToStorage = (questionAnswers) => {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTION_ANSWERS, JSON.stringify(questionAnswers));
  } catch (error) {
    console.error('Error saving question answers to localStorage:', error);
  }
};

export const loadQuestionAnswersFromStorage = () => {
  try {
    const questionAnswers = localStorage.getItem(STORAGE_KEYS.QUESTION_ANSWERS);
    return questionAnswers ? JSON.parse(questionAnswers) : {};
  } catch (error) {
    console.error('Error loading question answers from localStorage:', error);
    return {};
  }
};

// Add a single quiz result
export const addQuizResult = (quizResult) => {
  try {
    const existingHistory = loadQuizHistoryFromStorage();
    const updatedHistory = [...existingHistory, {
      ...quizResult,
      id: Date.now(),
      date: new Date().toISOString()
    }];
    saveQuizHistoryToStorage(updatedHistory);
    
    // Remove from in-progress quizzes when completed
    // Use the original quiz ID to find and remove the in-progress version
    removeInProgressQuiz(quizResult.id);
    
    // Also try to remove by the original ID if it's different
    if (quizResult.originalId) {
      removeInProgressQuiz(quizResult.originalId);
    }
    
    // Update individual question answers
    updateQuestionAnswers(quizResult);
  } catch (error) {
    console.error('Error adding quiz result:', error);
  }
};

// Delete a quiz result and reset question statuses
export const deleteQuizResult = (quizId, isInProgress = false) => {
  try {
    if (isInProgress) {
      // Remove from in-progress quizzes
      const existingInProgress = loadInProgressQuizzesFromStorage();
      const updatedInProgress = existingInProgress.filter(quiz => quiz.id !== quizId);
      saveInProgressQuizzesToStorage(updatedInProgress);
      
      // Also remove question answers for this quiz
      const existingAnswers = loadQuestionAnswersFromStorage();
      const updatedAnswers = { ...existingAnswers };
      
      Object.keys(updatedAnswers).forEach(key => {
        if (updatedAnswers[key].quizId === quizId) {
          delete updatedAnswers[key];
        }
      });
      
      saveQuestionAnswersToStorage(updatedAnswers);
    } else {
      // Get the quiz to be deleted
      const existingHistory = loadQuizHistoryFromStorage();
      const quizToDelete = existingHistory.find(quiz => quiz.id === quizId);
      
      if (!quizToDelete) return;
      
      // Remove from quiz history
      const updatedHistory = existingHistory.filter(quiz => quiz.id !== quizId);
      saveQuizHistoryToStorage(updatedHistory);
      
      // Get all question IDs from the deleted quiz
      const deletedQuizQuestionIds = quizToDelete.questions ? quizToDelete.questions.map(q => q.id) : [];
      
      // Remove ALL answer entries for questions in this quiz
      const existingAnswers = loadQuestionAnswersFromStorage();
      const updatedAnswers = { ...existingAnswers };
      
      // Remove all answer entries for this specific quiz
      Object.keys(updatedAnswers).forEach(key => {
        if (updatedAnswers[key].quizId === quizId) {
          delete updatedAnswers[key];
        }
      });
      
      // Also remove any answer entries for the questions in this quiz (to ensure complete reset)
      deletedQuizQuestionIds.forEach(questionId => {
        Object.keys(updatedAnswers).forEach(key => {
          if (updatedAnswers[key].questionId === questionId) {
            delete updatedAnswers[key];
          }
        });
      });
      
      saveQuestionAnswersToStorage(updatedAnswers);
    }
  } catch (error) {
    console.error('Error deleting quiz result:', error);
  }
};

// Save in-progress quiz
export const saveInProgressQuiz = (quizData) => {
  try {
    const existingInProgress = loadInProgressQuizzesFromStorage();
    const updatedInProgress = existingInProgress.filter(q => q.id !== quizData.id);
    updatedInProgress.push({
      ...quizData,
      lastUpdated: new Date().toISOString()
    });
    saveInProgressQuizzesToStorage(updatedInProgress);
  } catch (error) {
    console.error('Error saving in-progress quiz:', error);
  }
};

// Remove in-progress quiz
export const removeInProgressQuiz = (quizId) => {
  try {
    const existingInProgress = loadInProgressQuizzesFromStorage();
    const updatedInProgress = existingInProgress.filter(q => q.id !== quizId);
    saveInProgressQuizzesToStorage(updatedInProgress);
  } catch (error) {
    console.error('Error removing in-progress quiz:', error);
  }
};

// Update individual question answers
export const updateQuestionAnswers = (quizResult) => {
  try {
    const existingAnswers = loadQuestionAnswersFromStorage();
    const updatedAnswers = { ...existingAnswers };
    
    quizResult.questions.forEach((question, index) => {
      const answerKey = `${question.id}_${quizResult.id}`;
      const answerData = {
        questionId: question.id,
        quizId: quizResult.id,
        userAnswer: question.userAnswer,
        isCorrect: question.isCorrect,
        flagged: question.flagged,
        date: quizResult.date
      };
      
      console.log(`Saving answer for question ${question.id}:`, answerData);
      
      updatedAnswers[answerKey] = answerData;
    });
    
    saveQuestionAnswersToStorage(updatedAnswers);
  } catch (error) {
    console.error('Error updating question answers:', error);
  }
};

// Get question answer history
export const getQuestionAnswerHistory = (questionId) => {
  try {
    const allAnswers = loadQuestionAnswersFromStorage();
    const filteredAnswers = Object.values(allAnswers).filter(answer => answer.questionId === questionId);
    console.log(`Getting answer history for question ${questionId}:`, filteredAnswers);
    return filteredAnswers;
  } catch (error) {
    console.error('Error getting question answer history:', error);
    return [];
  }
};

// Update quiz result (for editing answers)
export const updateQuizResult = (quizId, updatedQuiz) => {
  try {
    const existingHistory = loadQuizHistoryFromStorage();
    const updatedHistory = existingHistory.map(quiz => 
      quiz.id === quizId ? { ...quiz, ...updatedQuiz } : quiz
    );
    saveQuizHistoryToStorage(updatedHistory);
    
    // Clear old answer entries for this quiz before updating
    const existingAnswers = loadQuestionAnswersFromStorage();
    const updatedAnswers = { ...existingAnswers };
    
    // Remove all answer entries for this quiz
    Object.keys(updatedAnswers).forEach(key => {
      if (updatedAnswers[key].quizId === quizId) {
        delete updatedAnswers[key];
      }
    });
    
    // Update with new answer entries
    if (updatedQuiz.questions) {
      updatedQuiz.questions.forEach((question) => {
        const answerKey = `${question.id}_${quizId}`;
        updatedAnswers[answerKey] = {
          questionId: question.id,
          quizId: quizId,
          userAnswer: question.userAnswer,
          isCorrect: question.isCorrect,
          flagged: question.flagged,
          date: updatedQuiz.date
        };
      });
    }
    
    saveQuestionAnswersToStorage(updatedAnswers);
  } catch (error) {
    console.error('Error updating quiz result:', error);
  }
};

// Get all quiz data (both completed and in-progress)
export const getAllQuizData = () => {
  try {
    const completedQuizzes = loadQuizHistoryFromStorage();
    const inProgressQuizzes = loadInProgressQuizzesFromStorage();
    
    // Convert in-progress quizzes to the same format as completed quizzes
    const formattedInProgress = inProgressQuizzes.map(quiz => ({
      ...quiz,
      isInProgress: true,
      score: quiz.questions ? Math.round((quiz.questions.filter(q => q.isCorrect).length / quiz.questions.length) * 100) : 0,
      totalQuestions: quiz.questions ? quiz.questions.length : 0,
      correctAnswers: quiz.questions ? quiz.questions.filter(q => q.isCorrect).length : 0
    }));
    
    return [...completedQuizzes, ...formattedInProgress];
  } catch (error) {
    console.error('Error getting all quiz data:', error);
    return [];
  }
};

// Clear all data (for testing/reset purposes)
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.IN_PROGRESS_QUIZZES);
    localStorage.removeItem(STORAGE_KEYS.QUESTION_ANSWERS);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Test function to verify localStorage functionality
export const testLocalStorage = () => {
  try {
    console.log('=== Testing localStorage functionality ===');
    
    // Test saving and loading questions
    const testQuestions = [
      { id: 1, questionText: 'Test Question 1', correctAnswer: 'A', options: ['A', 'B', 'C', 'D'] },
      { id: 2, questionText: 'Test Question 2', correctAnswer: 'B', options: ['A', 'B', 'C', 'D'] }
    ];
    
    saveQuestionsToStorage(testQuestions);
    const loadedQuestions = loadQuestionsFromStorage();
    console.log('Questions test:', { saved: testQuestions.length, loaded: loadedQuestions.length });
    
    // Test saving and loading quiz answers with flagged questions
    const testQuizResult = {
      id: 123,
      questions: [
        { id: 1, userAnswer: 'A', isCorrect: true, flagged: true },
        { id: 2, userAnswer: 'C', isCorrect: false, flagged: false }
      ],
      date: new Date().toISOString()
    };
    
    updateQuestionAnswers(testQuizResult);
    const answerHistory1 = getQuestionAnswerHistory(1);
    const answerHistory2 = getQuestionAnswerHistory(2);
    
    console.log('Flagged questions test:', {
      question1: answerHistory1,
      question2: answerHistory2,
      question1Flagged: answerHistory1.some(a => a.flagged),
      question2Flagged: answerHistory2.some(a => a.flagged)
    });
    
    console.log('=== localStorage test completed ===');
  } catch (error) {
    console.error('localStorage test failed:', error);
  }
}; 