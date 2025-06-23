import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuizPage from '../QuizPage';

// Mock the hooks
vi.mock('../../hooks/useUserData', () => ({
  useQuizHistory: vi.fn(),
  useInProgressQuizzes: vi.fn(),
  useQuestionAnswers: vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockQuestions = [
  {
    id: 'q1',
    questionText: 'Test question 1?',
    passageText: 'This is a test passage for question 1.',
    section: 'Reading and Writing',
    domain: 'Information and Ideas',
    questionType: 'Multiple Choice',
    difficulty: 'Easy',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A'
  },
  {
    id: 'q2',
    questionText: 'Test question 2?',
    passageText: 'This is a test passage for question 2.',
    section: 'Math',
    domain: 'Algebra',
    questionType: 'Multiple Choice',
    difficulty: 'Medium',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option B'
  }
];

const mockUserDataHooks = {
  useQuizHistory: {
    data: [],
    upsertData: vi.fn(),
    refreshData: vi.fn()
  },
  useInProgressQuizzes: {
    data: [],
    upsertData: vi.fn(),
    refreshData: vi.fn()
  },
  useQuestionAnswers: {
    data: {},
    upsertData: vi.fn()
  }
};

const mockAuth = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      name: 'Test User'
    }
  }
};

describe('QuizPage Component', () => {
  const defaultProps = {
    questions: mockQuestions,
    onBack: vi.fn(),
    isResuming: false,
    initialQuizData: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    const { useQuizHistory, useInProgressQuizzes, useQuestionAnswers } = require('../../hooks/useUserData');
    const { useAuth } = require('../../contexts/AuthContext');
    
    useQuizHistory.mockReturnValue(mockUserDataHooks.useQuizHistory);
    useInProgressQuizzes.mockReturnValue(mockUserDataHooks.useInProgressQuizzes);
    useQuestionAnswers.mockReturnValue(mockUserDataHooks.useQuestionAnswers);
    useAuth.mockReturnValue(mockAuth);

    // Mock Date.now for consistent quiz IDs
    vi.spyOn(Date, 'now').mockReturnValue(1234567890);
  });

  describe('Basic Rendering', () => {
    it('renders quiz interface correctly', () => {
      render(<QuizPage {...defaultProps} />);
      
      expect(screen.getByText('Quiz 1')).toBeInTheDocument();
      expect(screen.getByText('Test question 1?')).toBeInTheDocument();
    });

    it('shows user welcome message', () => {
      render(<QuizPage {...defaultProps} />);
      
      expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
    });
  });

  describe('Answer Selection', () => {
    it('allows selecting answers', async () => {
      render(<QuizPage {...defaultProps} />);
      
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      
      await waitFor(() => {
        expect(optionA.closest('.question-option')).toHaveClass('selected');
      });
    });
  });

  describe('Quiz Completion', () => {
    it('calls onBack when finishing quiz', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Answer questions and navigate to finish
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      
      // Navigate to review and finish
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        const finishButton = screen.getByText('Finish Quiz');
        fireEvent.click(finishButton);
      });
      
      await waitFor(() => {
        expect(defaultProps.onBack).toHaveBeenCalled();
      });
    });
  });

  describe('Quiz Initialization', () => {
    it('initializes with first question', () => {
      render(<QuizPage {...defaultProps} />);
      
      expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
      expect(screen.getByText('Test question 1?')).toBeInTheDocument();
    });

    it('displays timer correctly', () => {
      render(<QuizPage {...defaultProps} />);
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });
  });

  describe('Question Navigation', () => {
    it('allows navigating to next question', async () => {
      render(<QuizPage {...defaultProps} />);
      
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
        expect(screen.getByText('Test question 2?')).toBeInTheDocument();
      });
    });

    it('allows navigating to previous question', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Go to next question first
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
      });

      // Go back to previous question
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
      });
    });

    it('disables back button on first question', () => {
      render(<QuizPage {...defaultProps} />);
      
      const backButton = screen.getByText('Back');
      expect(backButton).toBeDisabled();
    });

    it('shows review page button on last question', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Navigate to last question
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
        expect(screen.getByText('Next')).toBeInTheDocument();
      });
    });
  });

  describe('Answer Selection', () => {
    it('updates answer when different option is selected', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Select Option A first
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      
      await waitFor(() => {
        expect(optionA.closest('.question-option')).toHaveClass('selected');
      });

      // Then select Option B
      const optionB = screen.getByText('Option B');
      fireEvent.click(optionB.closest('.question-option'));
      
      await waitFor(() => {
        expect(optionB.closest('.question-option')).toHaveClass('selected');
        expect(optionA.closest('.question-option')).not.toHaveClass('selected');
      });
    });

    it('persists answers when navigating between questions', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Select answer for question 1
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      
      // Navigate to question 2
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
      });

      // Navigate back to question 1
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
        expect(optionA.closest('.question-option')).toHaveClass('selected');
      });
    });
  });

  describe('Question Flagging', () => {
    it('allows flagging questions for review', async () => {
      render(<QuizPage {...defaultProps} />);
      
      const flagButton = screen.getByText('Mark for Review');
      fireEvent.click(flagButton);
      
      await waitFor(() => {
        expect(screen.getByText('Mark for Review')).toHaveClass('text-red-500');
      });
    });

    it('allows unflagging questions', async () => {
      render(<QuizPage {...defaultProps} />);
      
      const flagButton = screen.getByText('Mark for Review');
      
      // Flag the question
      fireEvent.click(flagButton);
      await waitFor(() => {
        expect(flagButton).toHaveClass('text-red-500');
      });

      // Unflag the question
      fireEvent.click(flagButton);
      await waitFor(() => {
        expect(flagButton).not.toHaveClass('text-red-500');
      });
    });
  });

  describe('Quiz Completion', () => {
    it('navigates to review page from last question', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Navigate to last question
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
      });

      // Click Next again to go to review page
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Check Your Work')).toBeInTheDocument();
      });
    });

    it('shows quiz results when finishing', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Answer questions
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      
      // Navigate to review page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Check Your Work')).toBeInTheDocument();
      });

      // Finish quiz
      const finishButton = screen.getByText('Finish Quiz');
      fireEvent.click(finishButton);
      
      expect(mockUserDataHooks.useQuizHistory.upsertData).toHaveBeenCalled();
      expect(defaultProps.onBack).toHaveBeenCalled();
    });

    it('calculates score correctly', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Answer first question correctly
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      
      // Navigate to second question
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      // Answer second question incorrectly
      await waitFor(() => {
        expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
      });
      
      const optionA2 = screen.getByText('Option A');
      fireEvent.click(optionA2.closest('.question-option'));
      
      // Navigate to review page
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Check Your Work')).toBeInTheDocument();
      });

      // Finish quiz
      const finishButton = screen.getByText('Finish Quiz');
      fireEvent.click(finishButton);
      
      // Should save quiz with 50% score (1 correct out of 2)
      expect(mockUserDataHooks.useQuizHistory.upsertData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            score: 50,
            correctAnswers: 1,
            totalQuestions: 2
          })
        ])
      );
    });
  });

  describe('Resume Quiz Functionality', () => {
    const resumeQuizData = {
      id: 999,
      questions: mockQuestions.map(q => ({ ...q, userAnswer: null, isCorrect: null })),
      userAnswers: { q1: 'Option A' },
      currentQuestionIndex: 1,
      flaggedQuestions: ['q2'],
      startTime: '2024-01-01T10:00:00Z',
      quizNumber: 5
    };

    it('resumes quiz with existing data', () => {
      render(<QuizPage 
        {...defaultProps} 
        isResuming={true} 
        initialQuizData={resumeQuizData} 
      />);
      
      expect(screen.getByText('Quiz 5')).toBeInTheDocument();
      expect(screen.getByText('Question 2 of 2')).toBeInTheDocument();
    });

    it('preserves flagged questions when resuming', () => {
      render(<QuizPage 
        {...defaultProps} 
        isResuming={true} 
        initialQuizData={resumeQuizData} 
      />);
      
      const flagButton = screen.getByText('Mark for Review');
      expect(flagButton).toHaveClass('text-red-500');
    });

    it('preserves answered questions when resuming', async () => {
      render(<QuizPage 
        {...defaultProps} 
        isResuming={true} 
        initialQuizData={resumeQuizData} 
      />);
      
      // Navigate back to first question
      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
        const optionA = screen.getByText('Option A');
        expect(optionA.closest('.question-option')).toHaveClass('selected');
      });
    });
  });

  describe('Auto-save Functionality', () => {
    it('saves progress automatically', async () => {
      render(<QuizPage {...defaultProps} />);
      
      // Answer a question
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      
      // Navigate to trigger save
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(mockUserDataHooks.useInProgressQuizzes.upsertData).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles empty questions array', () => {
      const mockOnBack = vi.fn();
      render(<QuizPage {...defaultProps} questions={[]} onBack={mockOnBack} />);
      
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('handles missing question properties gracefully', () => {
      const incompleteQuestions = [
        {
          id: 'q1',
          questionText: 'Incomplete question',
          // Missing other properties
        }
      ];
      
      render(<QuizPage {...defaultProps} questions={incompleteQuestions} />);
      
      expect(screen.getByText('Incomplete question')).toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    it('updates timer every second', async () => {
      vi.useFakeTimers();
      
      render(<QuizPage {...defaultProps} />);
      
      expect(screen.getByText('00:00')).toBeInTheDocument();
      
      // Advance timer by 61 seconds
      vi.advanceTimersByTime(61000);
      
      await waitFor(() => {
        expect(screen.getByText('01:01')).toBeInTheDocument();
      });
      
      vi.useRealTimers();
    });

    it('pauses timer on results page', async () => {
      vi.useFakeTimers();
      
      render(<QuizPage {...defaultProps} />);
      
      // Navigate to review page
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.getByText('Check Your Work')).toBeInTheDocument();
      });
      
      const currentTime = screen.getByText(/00:0\d/).textContent;
      
      // Advance timer
      vi.advanceTimersByTime(10000);
      
      // Timer should not have changed
      expect(screen.getByText(currentTime)).toBeInTheDocument();
      
      vi.useRealTimers();
    });
  });

  describe('Quiz Numbering', () => {
    it('assigns sequential quizNumber on completion', async () => {
      // Simulate two completed quizzes in history
      const completedQuiz1 = { id: 1, quizNumber: 1 };
      const completedQuiz2 = { id: 2, quizNumber: 2 };
      mockUserDataHooks.useQuizHistory.data = [completedQuiz1, completedQuiz2];
      render(<QuizPage {...defaultProps} />);
      // Answer and finish quiz
      const optionA = screen.getByText('Option A');
      fireEvent.click(optionA.closest('.question-option'));
      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      await waitFor(() => {
        const finishButton = screen.getByText('Finish Quiz');
        fireEvent.click(finishButton);
      });
      await waitFor(() => {
        // The new quiz should be assigned quizNumber 3
        expect(mockUserDataHooks.useQuizHistory.upsertData).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ quizNumber: 3 })
          ])
        );
      });
    });

    it('does not assign quizNumber to in-progress quizzes', () => {
      mockUserDataHooks.useInProgressQuizzes.data = [{ id: 123, questions: mockQuestions }];
      render(<QuizPage {...defaultProps} isResuming={true} initialQuizData={{ id: 123, questions: mockQuestions }} />);
      // There should be no quizNumber in the in-progress quiz data
      expect(screen.queryByText(/Quiz #[0-9]+/)).not.toBeInTheDocument();
    });
  });
}); 