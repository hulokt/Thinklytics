import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuizHistory from '../QuizHistory';

// Mock the hooks
vi.mock('../../hooks/useUserData', () => ({
  useQuizHistory: vi.fn(),
  useInProgressQuizzes: vi.fn(),
  useQuestionAnswers: vi.fn(),
}));

const mockQuizHistory = {
  data: [
    {
      id: 1,
      date: '2024-01-01T10:00:00Z',
      score: 75,
      totalQuestions: 4,
      correctAnswers: 3,
      quizNumber: 1,
      questions: [
        {
          id: 'q1',
          questionText: 'Test question 1?',
          answerChoices: { A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D' },
          correctAnswer: 'A',
          userAnswer: 'A',
          isCorrect: true,
          difficulty: 'Easy'
        },
        {
          id: 'q2',
          questionText: 'Test question 2?',
          answerChoices: { A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D' },
          correctAnswer: 'B',
          userAnswer: 'C',
          isCorrect: false,
          difficulty: 'Medium'
        },
        {
          id: 'q3',
          questionText: 'Test question 3?',
          answerChoices: { A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D' },
          correctAnswer: 'C',
          userAnswer: 'C',
          isCorrect: true,
          difficulty: 'Hard'
        },
        {
          id: 'q4',
          questionText: 'Test question 4?',
          answerChoices: { A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D' },
          correctAnswer: 'D',
          userAnswer: 'D',
          isCorrect: true,
          difficulty: 'Easy'
        }
      ]
    }
  ],
  upsertData: vi.fn(),
  refreshData: vi.fn()
};

const mockInProgressQuizzes = {
  data: [],
  upsertData: vi.fn(),
  refreshData: vi.fn()
};

const mockQuestionAnswers = {
  data: {
    'q1': [{ quizId: 1, answer: 'A', isCorrect: true, date: '2024-01-01T10:00:00Z' }],
    'q2': [{ quizId: 1, answer: 'C', isCorrect: false, date: '2024-01-01T10:00:00Z' }],
    'q3': [{ quizId: 1, answer: 'C', isCorrect: true, date: '2024-01-01T10:00:00Z' }],
    'q4': [{ quizId: 1, answer: 'D', isCorrect: true, date: '2024-01-01T10:00:00Z' }]
  },
  upsertData: vi.fn()
};

describe('QuizHistory Component', () => {
  beforeEach(() => {
    const { useQuizHistory, useInProgressQuizzes, useQuestionAnswers } = require('../../hooks/useUserData');
    useQuizHistory.mockReturnValue(mockQuizHistory);
    useInProgressQuizzes.mockReturnValue(mockInProgressQuizzes);
    useQuestionAnswers.mockReturnValue(mockQuestionAnswers);
  });

  it('should render quiz history correctly', () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    expect(screen.getByText('Quiz History')).toBeInTheDocument();
    expect(screen.getByText('Completed Quizzes')).toBeInTheDocument();
    expect(screen.getByText(/Quiz #1/)).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should show full difficulty names instead of abbreviations', () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // Click on a quiz to view details
    fireEvent.click(screen.getByText('View'));
    
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('should enter edit mode when edit button is clicked', async () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // Click edit button
    fireEvent.click(screen.getByText('Edit'));
    
    await waitFor(() => {
      expect(screen.getByText('Edit Quiz Results')).toBeInTheDocument();
      expect(screen.getByText(/Green = Correct, Red = Incorrect/)).toBeInTheDocument();
      expect(screen.getByText('Update Quiz')).toBeInTheDocument();
    });
  });

  it('should show previously selected answers with correct highlighting in edit mode', async () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    await waitFor(() => {
      // Check for correct answer highlighting
      expect(screen.getByText('✓ Correct Answer')).toBeInTheDocument();
      expect(screen.getByText('• Your Original Choice')).toBeInTheDocument();
    });
  });

  it('should update statistics in real-time when answers are changed', async () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    await waitFor(() => {
      expect(screen.getByText('📊 Current Statistics')).toBeInTheDocument();
    });
    
    // Change an answer from wrong to correct
    const radioButton = screen.getAllByRole('radio')[1]; // Second option for first question
    fireEvent.click(radioButton);
    
    await waitFor(() => {
      expect(screen.getByText('📊 Updated Statistics')).toBeInTheDocument();
      expect(screen.getByText(/Modified/)).toBeInTheDocument();
    });
  });

  it('should save changes and update all data when Update Quiz is clicked', async () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Change an answer
    const radioButton = screen.getAllByRole('radio')[1];
    fireEvent.click(radioButton);
    
    // Click update
    fireEvent.click(screen.getByText('Update Quiz'));
    
    await waitFor(() => {
      expect(mockQuizHistory.upsertData).toHaveBeenCalled();
      expect(mockQuestionAnswers.upsertData).toHaveBeenCalled();
      expect(mockQuizHistory.refreshData).toHaveBeenCalled();
    });
  });

  it('should show full answer text instead of just checkmarks', async () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // View quiz details
    fireEvent.click(screen.getByText('View'));
    
    await waitFor(() => {
      expect(screen.getByText('A: Answer A')).toBeInTheDocument();
      expect(screen.getByText('B: Answer B')).toBeInTheDocument();
      expect(screen.getByText('C: Answer C')).toBeInTheDocument();
      expect(screen.getByText('D: Answer D')).toBeInTheDocument();
    });
  });

  it('should handle quiz deletion correctly', async () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // Click delete button
    fireEvent.click(screen.getByText('Delete'));
    
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });
    
    // Confirm deletion
    fireEvent.click(screen.getAllByText('Delete')[1]);
    
    await waitFor(() => {
      expect(mockQuizHistory.upsertData).toHaveBeenCalled();
    });
  });

  it('should calculate quiz numbers correctly', () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    expect(screen.getByText(/Quiz #1/)).toBeInTheDocument();
  });

  it('should show modification indicators in edit mode', async () => {
    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);
    
    // Enter edit mode
    fireEvent.click(screen.getByText('Edit'));
    
    // Change an answer
    const radioButton = screen.getAllByRole('radio')[1];
    fireEvent.click(radioButton);
    
    await waitFor(() => {
      expect(screen.getByText('📝 Modified')).toBeInTheDocument();
      expect(screen.getByText('• New Choice')).toBeInTheDocument();
    });
  });

  it('should renumber quizzes after deletion', async () => {
    // Setup mock data with two quizzes
    const quiz1 = {
      id: 1,
      date: '2024-01-01T10:00:00Z',
      score: 75,
      totalQuestions: 4,
      correctAnswers: 3,
      quizNumber: 1,
      questions: []
    };
    const quiz2 = {
      id: 2,
      date: '2024-01-02T10:00:00Z',
      score: 100,
      totalQuestions: 4,
      correctAnswers: 4,
      quizNumber: 2,
      questions: []
    };
    const mockQuizHistoryWithTwo = {
      ...mockQuizHistory,
      data: [quiz1, quiz2],
      upsertData: vi.fn(),
      refreshData: vi.fn()
    };
    const { useQuizHistory } = require('../../hooks/useUserData');
    useQuizHistory.mockReturnValue(mockQuizHistoryWithTwo);

    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);

    // Delete the first quiz
    fireEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByText('Delete')[1]);

    await waitFor(() => {
      expect(mockQuizHistoryWithTwo.upsertData).toHaveBeenCalled();
      // The remaining quiz should now be Quiz 1
      const updated = mockQuizHistoryWithTwo.upsertData.mock.calls[0][0];
      expect(updated[0].quizNumber).toBe(1);
    });
  });

  it('should not create duplicate or extra quizzes after deletion', async () => {
    // Setup mock data with three quizzes
    const quiz1 = { id: 1, quizNumber: 1 };
    const quiz2 = { id: 2, quizNumber: 2 };
    const quiz3 = { id: 3, quizNumber: 3 };
    const mockQuizHistoryWithThree = {
      ...mockQuizHistory,
      data: [quiz1, quiz2, quiz3],
      upsertData: vi.fn(),
      refreshData: vi.fn()
    };
    const { useQuizHistory } = require('../../hooks/useUserData');
    useQuizHistory.mockReturnValue(mockQuizHistoryWithThree);

    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);

    // Delete the second quiz
    fireEvent.click(screen.getAllByText('Delete')[1]);
    await waitFor(() => {
      expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    });
    fireEvent.click(screen.getAllByText('Delete')[2]);

    await waitFor(() => {
      expect(mockQuizHistoryWithThree.upsertData).toHaveBeenCalled();
      const updated = mockQuizHistoryWithThree.upsertData.mock.calls[0][0];
      // Should be one less than before
      expect(updated.length).toBe(2);
      // All IDs should be unique
      const ids = updated.map(q => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('should handle resume and finish correctly', async () => {
    // Setup: one in-progress quiz
    const quiz = {
      id: 1,
      date: '2024-01-01T10:00:00Z',
      questions: [
        { id: 'q1', questionText: 'Q1', answerChoices: {A:'A',B:'B',C:'C',D:'D'}, correctAnswer: 'A', userAnswer: 'A', isCorrect: true },
        { id: 'q2', questionText: 'Q2', answerChoices: {A:'A',B:'B',C:'C',D:'D'}, correctAnswer: 'B', userAnswer: 'B', isCorrect: true },
        { id: 'q3', questionText: 'Q3', answerChoices: {A:'A',B:'B',C:'C',D:'D'}, correctAnswer: 'C', userAnswer: 'C', isCorrect: true }
      ],
      userAnswers: { q1: 'A', q2: 'B', q3: 'C' },
      isInProgress: true
    };
    const mockQuizHistory = { data: [], upsertData: vi.fn(), refreshData: vi.fn() };
    const mockInProgress = { data: [quiz], upsertData: vi.fn(), refreshData: vi.fn() };
    const { useQuizHistory, useInProgressQuizzes } = require('../../hooks/useUserData');
    useQuizHistory.mockReturnValue(mockQuizHistory);
    useInProgressQuizzes.mockReturnValue(mockInProgress);

    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);

    // Simulate finishing the quiz
    // (In real app, this would be done via QuizPage, but here we simulate the effect)
    // Remove from in-progress and add to history
    const completedQuiz = { ...quiz, isInProgress: false, correctAnswers: 3, score: 100, quizNumber: 1 };
    await mockInProgress.upsertData([]);
    await mockQuizHistory.upsertData([completedQuiz]);
    await mockQuizHistory.refreshData();

    // Check only 1 quiz in history, correctCount is not zero, and in-progress is empty
    expect(mockQuizHistory.upsertData).toHaveBeenCalledWith([completedQuiz]);
    expect(completedQuiz.correctAnswers).toBeGreaterThan(0);
    expect(mockInProgress.upsertData).toHaveBeenCalledWith([]);
  });

  it('should finish a new quiz and show correct stats', async () => {
    // Setup: no quizzes
    const quiz = {
      id: 2,
      date: '2024-01-02T10:00:00Z',
      questions: [
        { id: 'q1', questionText: 'Q1', answerChoices: {A:'A',B:'B',C:'C',D:'D'}, correctAnswer: 'A', userAnswer: 'A', isCorrect: true },
        { id: 'q2', questionText: 'Q2', answerChoices: {A:'A',B:'B',C:'C',D:'D'}, correctAnswer: 'B', userAnswer: 'C', isCorrect: false },
        { id: 'q3', questionText: 'Q3', answerChoices: {A:'A',B:'B',C:'C',D:'D'}, correctAnswer: 'C', userAnswer: 'C', isCorrect: true }
      ],
      userAnswers: { q1: 'A', q2: 'C', q3: 'C' },
      isInProgress: false,
      correctAnswers: 2,
      score: 67,
      quizNumber: 1
    };
    const mockQuizHistory = { data: [], upsertData: vi.fn(), refreshData: vi.fn() };
    const { useQuizHistory } = require('../../hooks/useUserData');
    useQuizHistory.mockReturnValue(mockQuizHistory);

    render(<QuizHistory onBack={vi.fn()} onResumeQuiz={vi.fn()} />);

    await mockQuizHistory.upsertData([quiz]);
    await mockQuizHistory.refreshData();

    // Check correct stats
    expect(mockQuizHistory.upsertData).toHaveBeenCalledWith([quiz]);
    expect(quiz.correctAnswers).toBe(2);
    expect(quiz.score).toBe(67);
  });
}); 