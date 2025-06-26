import { useAllQuizzes, useQuestionAnswers } from '../hooks/useUserData';
import React from 'react';

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
      timeSpent: 0
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
    // Keep in-memory cache in sync immediately so subsequent look-ups work
    this.allQuizzes = updatedQuizzes;
    await this.upsertAllQuizzes(updatedQuizzes);
    await this.refreshAllQuizzes();
    return newQuiz;
  }

  // Update an existing quiz
  async updateQuiz(quizId, updates) {
    const updatedQuizzes = this.allQuizzes.map(quiz => 
      quiz.id === quizId ? { ...quiz, ...updates, lastUpdated: new Date().toISOString() } : quiz
    );
    this.allQuizzes = updatedQuizzes;
    await this.upsertAllQuizzes(updatedQuizzes);
    await this.refreshAllQuizzes();
  }

  // Save quiz progress (for auto-save during quiz)
  async saveQuiz(quizData) {
    // Use the current quizzes array (don't refresh to avoid race conditions)
    const quizzes = Array.isArray(this.allQuizzes) ? this.allQuizzes : [];

    const existingIndex = quizzes.findIndex(q => q.id === quizData.id);

    let updatedQuizzes;
    if (existingIndex >= 0) {
      updatedQuizzes = [...quizzes];
      updatedQuizzes[existingIndex] = { ...quizData, lastUpdated: new Date().toISOString() };
    } else {
      updatedQuizzes = [...quizzes, { ...quizData, lastUpdated: new Date().toISOString() }];
    }

    this.allQuizzes = updatedQuizzes;
    await this.upsertAllQuizzes(updatedQuizzes);
  }

  // Finish a quiz (complete it and move to completed status)
  async finishQuiz(quizData, syncedQuestions, userAnswers, flaggedQuestions, elapsedTime = 0) {
    const correctCount = syncedQuestions.filter(q => q.isCorrect).length;
    const totalQuestions = syncedQuestions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    const completedQuiz = {
      ...quizData,
      questions: syncedQuestions,
      userAnswers,
      flaggedQuestions: Array.from(flaggedQuestions),
      endTime: new Date().toISOString(),
      timeSpent: elapsedTime || quizData.timeSpent || 0,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      status: QUIZ_STATUS.COMPLETED,
      date: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    // Check if the quiz exists in the array
    const existingIndex = this.allQuizzes.findIndex(quiz => quiz.id === quizData.id);
    
    let updatedQuizzes;
    if (existingIndex >= 0) {
      // Update existing quiz
      updatedQuizzes = [...this.allQuizzes];
      updatedQuizzes[existingIndex] = completedQuiz;
    } else {
      // Add new quiz (this happens when quiz was never auto-saved)
      updatedQuizzes = [...this.allQuizzes, completedQuiz];
    }

    await this.upsertAllQuizzes(updatedQuizzes);
    this.allQuizzes = updatedQuizzes;
    
    return completedQuiz;
  }

  // Update entire quiz array (for migration purposes)
  async updateQuizzes(quizzes) {
    await this.upsertAllQuizzes(quizzes);
    this.allQuizzes = quizzes;
    await this.refreshAllQuizzes();
  }

  // Refresh quizzes (alias for refreshAllQuizzes)
  async refreshQuizzes() {
    await this.refreshAllQuizzes();
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
    
    await this.upsertAllQuizzes(updatedQuizzes);
    await this.refreshAllQuizzes();
    return completedQuiz;
  }

  // Delete a quiz and renumber remaining quizzes
  async deleteQuiz(quizId) {
    console.log('🗑️ QuizManager.deleteQuiz called with quizId:', quizId);
    console.log('🗑️ Current allQuizzes:', this.allQuizzes);
    
    const quizToDelete = this.allQuizzes.find(q => q.id === quizId);
    console.log('🗑️ Quiz to delete found:', quizToDelete);
    
    if (!quizToDelete) {
      console.log('❌ Quiz not found for deletion');
      return false;
    }

    // Remove the quiz
    const remainingQuizzes = this.allQuizzes.filter(q => q.id !== quizId);
    console.log('🗑️ Remaining quizzes after filter:', remainingQuizzes);
    
    // Renumber remaining quizzes if the deleted quiz had a lower number
    const deletedQuizNumber = quizToDelete.quizNumber;
    console.log('🗑️ Deleted quiz number:', deletedQuizNumber);
    
    const renumberedQuizzes = remainingQuizzes.map(quiz => {
      if (quiz.quizNumber > deletedQuizNumber) {
        const renumbered = { ...quiz, quizNumber: quiz.quizNumber - 1 };
        console.log(`🗑️ Renumbered quiz ${quiz.quizNumber} to ${renumbered.quizNumber}`);
        return renumbered;
      }
      return quiz;
    });
    
    console.log('🗑️ Final renumbered quizzes:', renumberedQuizzes);
    console.log('🗑️ Calling upsertAllQuizzes...');
    
    try {
      this.allQuizzes = renumberedQuizzes;
      await this.upsertAllQuizzes(renumberedQuizzes);
      console.log('✅ upsertAllQuizzes completed successfully');
      
      console.log('🗑️ Calling refreshAllQuizzes...');
      await this.refreshAllQuizzes();
      console.log('✅ refreshAllQuizzes completed successfully');
      
      console.log('✅ Quiz deletion completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error in deleteQuiz:', error);
      throw error;
    }
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
    await this.upsertAllQuizzes([]);
    await this.refreshAllQuizzes();
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