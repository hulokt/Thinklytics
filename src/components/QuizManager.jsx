import { useAllQuizzes, useQuestionAnswers } from '../hooks/useUserData';
import React from 'react';
import { dbLogStart, dbLogSuccess, dbLogError } from '../lib/dbLogger';

// Quiz status constants
export const QUIZ_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// QuizManager class to handle unified quiz operations
export class QuizManager {
  constructor(allQuizzes, upsertAllQuizzes, refreshAllQuizzes, updateAllQuizzesRef = null) {
    this.allQuizzes = Array.isArray(allQuizzes) ? allQuizzes : [];
    this.upsertAllQuizzes = upsertAllQuizzes;
    this.refreshAllQuizzes = refreshAllQuizzes;
    this.updateAllQuizzesRef = updateAllQuizzesRef;
  }

  // Update the internal allQuizzes reference
  updateAllQuizzes(newAllQuizzes) {
    this.allQuizzes = Array.isArray(newAllQuizzes) ? newAllQuizzes : [];
  }

  // Get the next quiz number based on existing quizzes
  getNextQuizNumber() {
    // Start numbering at 1. Simply take the highest existing quizNumber and add 1.
    if (!Array.isArray(this.allQuizzes) || this.allQuizzes.length === 0) {
      return 1;
    }

    const nums = this.allQuizzes
      .map(q => (typeof q.quizNumber === 'number' ? q.quizNumber : parseInt(q.quizNumber, 10)))
      .filter(n => !isNaN(n) && n >= 1);

    if (nums.length === 0) return 1;

    return Math.max(...nums) + 1;
  }

  // Create a new quiz with proper numbering
  createNewQuiz(questions, startTime = new Date().toISOString()) {
    const nextQuizNumber = this.getNextQuizNumber();
    
    const newQuiz = {
      id: Date.now() + Math.floor(Math.random() * 1000000),
      quizNumber: nextQuizNumber,
      questions: questions.map(q => ({ ...q, userAnswer: null, isCorrect: null, flagged: false })),
      userAnswers: {},
      currentQuestionIndex: 0,
      flaggedQuestions: [],
      categories: {
        section: questions[0]?.section || 'Mixed',
        domain: questions[0]?.domain || 'Mixed',
        questionType: questions[0]?.questionType || 'Mixed'
      },
      startTime: startTime,
      lastUpdated: startTime,
      status: QUIZ_STATUS.IN_PROGRESS,
      timeSpent: 0,
      eliminatedOptions: {},
      eliminationMode: false
    };

    return newQuiz;
  }

  // Create a planned quiz (scheduled for future)
  createPlannedQuiz(questions, plannedDate) {
    const nextQuizNumber = this.getNextQuizNumber();

    const newQuiz = {
      id: Date.now() + Math.floor(Math.random() * 1000000),
      quizNumber: nextQuizNumber,
      questions: questions.map(q => ({ ...q, userAnswer: null, isCorrect: null, flagged: false })),
      userAnswers: {},
      currentQuestionIndex: 0,
      flaggedQuestions: [],
      categories: {
        section: questions[0]?.section || 'Mixed',
        domain: questions[0]?.domain || 'Mixed',
        questionType: questions[0]?.questionType || 'Mixed'
      },
      plannedDate: plannedDate,
      startTime: null, // Will be set when quiz actually starts
      lastUpdated: new Date().toISOString(),
      status: QUIZ_STATUS.PLANNED,
      timeSpent: 0
    };

    return newQuiz;
  }

  // Add a new quiz to the array
  async addQuiz(newQuiz) {
    const updatedQuizzes = [...this.allQuizzes, newQuiz];
    this.allQuizzes = updatedQuizzes;
    const logId = dbLogStart('QuizManager.addQuiz', 'upsert all quizzes', { nextCount: updatedQuizzes.length })
    try {
      await this.upsertAllQuizzes(updatedQuizzes);
      dbLogSuccess('QuizManager.addQuiz', logId, { upsertOk: true })
      await this.refreshAllQuizzes();
      dbLogSuccess('QuizManager.addQuiz', logId, { refreshed: true })
      return newQuiz;
    } catch (e) {
      dbLogError('QuizManager.addQuiz', logId, e)
      throw e
    }
  }

  // Update an existing quiz
  async updateQuiz(quizId, updates) {
    const updatedQuizzes = this.allQuizzes.map(quiz => 
      quiz.id === quizId ? { ...quiz, ...updates, lastUpdated: new Date().toISOString() } : quiz
    );
    
    // Update local state immediately for instant UI feedback
    this.allQuizzes = updatedQuizzes;
    const logId = dbLogStart('QuizManager.updateQuiz', 'upsert all quizzes', { id: quizId })
    this.upsertAllQuizzes(updatedQuizzes)
      .then(() => dbLogSuccess('QuizManager.updateQuiz', logId, { upsertOk: true }))
      .catch(error => dbLogError('QuizManager.updateQuiz', logId, error))
  }

  // Save quiz progress (for auto-save during quiz)
  async saveQuiz(quizData) {
    // Use the current quizzes array (don't refresh to avoid race conditions)
    const quizzes = Array.isArray(this.allQuizzes) ? this.allQuizzes : [];

    // Normalize ID comparison to avoid string/number mismatches causing duplicates
    const existingIndex = quizzes.findIndex(q => String(q.id) === String(quizData.id));

    let updatedQuizzes;
    if (existingIndex >= 0) {
      updatedQuizzes = [...quizzes];
      updatedQuizzes[existingIndex] = { ...quizData, lastUpdated: new Date().toISOString() };
    } else {
      updatedQuizzes = [...quizzes, { ...quizData, lastUpdated: new Date().toISOString() }];
    }

    this.allQuizzes = updatedQuizzes;
    const logId = dbLogStart('QuizManager.saveQuiz', 'upsert all quizzes', { id: quizData.id })
    try {
      await this.upsertAllQuizzes(updatedQuizzes);
      dbLogSuccess('QuizManager.saveQuiz', logId, { upsertOk: true })
      return quizData;
    } catch (error) {
      dbLogError('QuizManager.saveQuiz', logId, error)
      throw error;
    }
  }

  // Finish a quiz (complete it and move to completed status)
  async finishQuiz(quizData, syncedQuestions, userAnswers, flaggedQuestions, elapsedTime = 0) {
    if (!quizData || !syncedQuestions || syncedQuestions.length === 0) {
      throw new Error('Invalid quiz data or questions provided to finishQuiz');
    }

    const correctCount = syncedQuestions.filter(q => q.isCorrect).length;
    const totalQuestions = syncedQuestions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // Sanitize questions: strip only truly heavy blobs; preserve useful images (e.g., SVGs, URLs)
    const sanitizeQuestionForStorage = (question) => {
      const cleaned = { ...question };

      // Helper to decide whether to retain an image string
      const shouldKeepImage = (value) => {
        if (typeof value !== 'string') return false;
        // Keep external URLs
        if (/^https?:\/\//i.test(value)) return true;
        // Keep SVG data URIs (typically small and text-based)
        if (/^data:image\/svg\+xml/i.test(value)) return true;
        // Keep reasonably small data URIs (< 200 KB)
        if (/^data:image\//i.test(value) && value.length < 200_000) return true;
        return false;
      };

      // Remove known heavy fields by key name, but allow passage/explanation images when small/URL/SVG
      const heavyKeys = [
        'image', 'imageData', 'passageImageData',
        'solutionImage', 'solutionImageData', 'figureImage', 'figureImageData',
        'images', 'screenshots'
      ];
      for (const key of heavyKeys) {
        if (key in cleaned) delete cleaned[key];
      }

      // Special handling: preserve `passageImage` and `explanationImage` when appropriate
      if ('passageImage' in cleaned && !shouldKeepImage(cleaned.passageImage)) {
        delete cleaned.passageImage;
      }
      if ('explanationImage' in cleaned && !shouldKeepImage(cleaned.explanationImage)) {
        delete cleaned.explanationImage;
      }

      // Drop any very large string fields (likely base64 blobs), but skip the whitelisted image fields
      for (const [key, value] of Object.entries(cleaned)) {
        if (
          typeof value === 'string' &&
          value.length > 200_000 && // raise threshold to avoid stripping medium images
          key !== 'passageImage' &&
          key !== 'explanationImage'
        ) {
          delete cleaned[key];
        }
      }
      return cleaned;
    };

    const sanitizedQuestions = syncedQuestions.map(sanitizeQuestionForStorage);

    const completedQuiz = {
      ...quizData,
      questions: sanitizedQuestions,
      userAnswers,
      flaggedQuestions: Array.from(flaggedQuestions || []),
      endTime: new Date().toISOString(),
      timeSpent: elapsedTime || quizData.timeSpent || 0,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      status: QUIZ_STATUS.COMPLETED,
      date: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Check if the quiz exists in the array (normalize ID comparison)
    const existingIndex = this.allQuizzes.findIndex(quiz => String(quiz.id) === String(quizData.id));
    
    let updatedQuizzes;
    if (existingIndex >= 0) {
      // Update existing quiz
      updatedQuizzes = [...this.allQuizzes];
      updatedQuizzes[existingIndex] = completedQuiz;
    } else {
      // Add new quiz (this happens when quiz was never auto-saved)
      updatedQuizzes = [...this.allQuizzes, completedQuiz];
    }

    const logId = dbLogStart('QuizManager.finishQuiz', 'upsert all quizzes', { id: quizData.id, score })
    await this.upsertAllQuizzes(updatedQuizzes);
    dbLogSuccess('QuizManager.finishQuiz', logId, { upsertOk: true })
    this.allQuizzes = updatedQuizzes;
    if (typeof this.refreshAllQuizzes === 'function') {
      await this.refreshAllQuizzes();
      dbLogSuccess('QuizManager.finishQuiz', logId, { refreshed: true })
    }
    return completedQuiz;
  }

  // Update entire quiz array (for migration purposes)
  async updateQuizzes(quizzes) {
    const logId = dbLogStart('QuizManager.updateQuizzes', 'upsert all quizzes', { nextCount: (quizzes||[]).length })
    await this.upsertAllQuizzes(quizzes);
    dbLogSuccess('QuizManager.updateQuizzes', logId, { upsertOk: true })
    this.allQuizzes = quizzes;
    await this.refreshAllQuizzes();
    dbLogSuccess('QuizManager.updateQuizzes', logId, { refreshed: true })
  }

  // Refresh quizzes (alias for refreshAllQuizzes)
  async refreshQuizzes() {
    const logId = dbLogStart('QuizManager.refreshQuizzes', 'refreshAllQuizzes')
    await this.refreshAllQuizzes();
    dbLogSuccess('QuizManager.refreshQuizzes', logId)
  }

  // Complete a quiz (move from in-progress to completed)
  async completeQuiz(quizId, finalData) {
    const quiz = this.allQuizzes.find(q => q.id === quizId);
    if (!quiz) return null;

    const completedQuiz = {
      ...quiz,
      ...finalData,
      status: QUIZ_STATUS.COMPLETED,
      endTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    const updatedQuizzes = this.allQuizzes.map(q => 
      q.id === quizId ? completedQuiz : q
    );
    
    const logId = dbLogStart('QuizManager.completeQuiz', 'upsert all quizzes', { id: quizId })
    await this.upsertAllQuizzes(updatedQuizzes);
    dbLogSuccess('QuizManager.completeQuiz', logId, { upsertOk: true })
    await this.refreshAllQuizzes();
    dbLogSuccess('QuizManager.completeQuiz', logId, { refreshed: true })
    return completedQuiz;
  }

  // Delete a quiz and renumber remaining quizzes
  async deleteQuiz(quizId) {
    const quizToDelete = this.allQuizzes.find(q => q.id === quizId);
    
    if (!quizToDelete) {
      return false;
    }

    // Remove the quiz
    const remainingQuizzes = this.allQuizzes.filter(q => q.id !== quizId);
    
    // Renumber remaining quizzes if the deleted quiz had a lower number
    const deletedQuizNumber = quizToDelete.quizNumber;
    
    const renumberedQuizzes = remainingQuizzes.map(quiz => {
      if (quiz.quizNumber > deletedQuizNumber) {
        const renumbered = { ...quiz, quizNumber: quiz.quizNumber - 1 };
        return renumbered;
      }
      return quiz;
    });
    
    // Update local state immediately for instant UI feedback
    this.allQuizzes = renumberedQuizzes;
    
    // Perform database operation in the background
    this.upsertAllQuizzes(renumberedQuizzes).catch(error => {
      console.error('Failed to save quiz deletion to database:', error);
      // Could add retry logic here if needed
    });
    
    return true;
  }

  // Get quizzes by status
  getQuizzesByStatus(status) {
    return this.allQuizzes.filter(quiz => quiz.status === status);
  }

  // Get in-progress quizzes
  getInProgressQuizzes() {
    return this.getQuizzesByStatus(QUIZ_STATUS.IN_PROGRESS);
  }

  // Get completed quizzes
  getCompletedQuizzes() {
    return this.getQuizzesByStatus(QUIZ_STATUS.COMPLETED);
  }

  // Get all quizzes
  getAllQuizzes() {
    return this.allQuizzes || [];
  }

  // Find quiz by ID
  findQuizById(quizId) {
    // Convert quizId to number for comparison, as IDs are typically stored as numbers
    const numericQuizId = typeof quizId === 'string' ? parseInt(quizId, 10) : quizId;
    return this.allQuizzes.find(quiz => {
      const quizNumericId = typeof quiz.id === 'string' ? parseInt(quiz.id, 10) : quiz.id;
      return quizNumericId === numericQuizId;
    });
  }

  // Get quiz by number
  findQuizByNumber(quizNumber) {
    return this.allQuizzes.find(quiz => quiz.quizNumber === quizNumber);
  }

  // Delete ALL quizzes and clear numbering
  async deleteAllQuizzes() {
    this.allQuizzes = [];
    const logId = dbLogStart('QuizManager.deleteAllQuizzes', 'upsert all quizzes', { nextCount: 0 })
    await this.upsertAllQuizzes([]);
    dbLogSuccess('QuizManager.deleteAllQuizzes', logId, { upsertOk: true })
    await this.refreshAllQuizzes();
    dbLogSuccess('QuizManager.deleteAllQuizzes', logId, { refreshed: true })
  }
}

// React hook to use QuizManager
export const useQuizManager = () => {
  const { 
    data: allQuizzes, 
    upsertData: upsertAllQuizzes, 
    refreshData: refreshAllQuizzes,
    loading: allQuizzesLoading 
  } = useAllQuizzes();

  // Create a ref to hold the QuizManager instance
  const quizManagerRef = React.useRef(null);

  // Create or update the QuizManager instance
  if (!quizManagerRef.current) {
    quizManagerRef.current = new QuizManager(allQuizzes, upsertAllQuizzes, refreshAllQuizzes);
  } else {
    // Update the QuizManager's internal reference when allQuizzes changes
    quizManagerRef.current.updateAllQuizzes(allQuizzes);
  }

  // Use useMemo to prevent infinite re-renders
  const inProgressQuizzes = React.useMemo(() => {
    return quizManagerRef.current.getInProgressQuizzes();
  }, [allQuizzes]);

  const completedQuizzes = React.useMemo(() => {
    return quizManagerRef.current.getCompletedQuizzes();
  }, [allQuizzes]);

  return {
    quizManager: quizManagerRef.current,
    allQuizzes,
    allQuizzesLoading,
    inProgressQuizzes,
    completedQuizzes
  };
}; 