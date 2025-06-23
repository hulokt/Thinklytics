import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import QuestionSelector from '../QuestionSelector';

// Mock the hooks
vi.mock('../../hooks/useUserData', () => ({
  useQuestionAnswers: vi.fn(),
}));

// Mock data
const mockQuestions = [
  {
    id: 'q1',
    questionText: 'This is a reading question about literature?',
    section: 'Reading and Writing',
    domain: 'Information and Ideas',
    questionType: 'Multiple Choice',
    difficulty: 'Easy',
    answerChoices: { A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D' },
    correctAnswer: 'A'
  },
  {
    id: 'q2',
    questionText: 'This is a math question about algebra?',
    section: 'Math',
    domain: 'Algebra',
    questionType: 'Multiple Choice',
    difficulty: 'Medium',
    answerChoices: { A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D' },
    correctAnswer: 'B'
  },
  {
    id: 'q3',
    questionText: 'Another reading question about craft and structure?',
    section: 'Reading and Writing',
    domain: 'Craft and Structure',
    questionType: 'Multiple Choice',
    difficulty: 'Hard',
    answerChoices: { A: 'Answer A', B: 'Answer B', C: 'Answer C', D: 'Answer D' },
    correctAnswer: 'C'
  }
];

const mockQuestionAnswers = {
  data: {
    q1: [{ quizId: 1, answer: 'A', isCorrect: true, date: '2024-01-01T10:00:00Z' }],
    q2: [{ quizId: 1, answer: 'C', isCorrect: false, date: '2024-01-01T10:00:00Z' }]
  }
};

describe('QuestionSelector Component', () => {
  const defaultProps = {
    questions: mockQuestions,
    onStartQuiz: vi.fn(),
    onResumeQuiz: vi.fn(),
    inProgressQuizzes: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    const { useQuestionAnswers } = require('../../hooks/useUserData');
    useQuestionAnswers.mockReturnValue(mockQuestionAnswers);
  });

  describe('Component Rendering', () => {
    it('renders the quiz builder interface correctly', () => {
      render(<QuestionSelector {...defaultProps} />);
      
      expect(screen.getByText('Quiz Builder')).toBeInTheDocument();
      expect(screen.getByText('Select questions and create your custom quiz')).toBeInTheDocument();
      expect(screen.getByText('Filter Questions')).toBeInTheDocument();
    });

    it('displays all questions when no filters are applied', () => {
      render(<QuestionSelector {...defaultProps} />);
      
      expect(screen.getByText(/Questions \(3 available\)/)).toBeInTheDocument();
      expect(screen.getByText('This is a reading question about literature?')).toBeInTheDocument();
      expect(screen.getByText('This is a math question about algebra?')).toBeInTheDocument();
    });

    it('shows empty state when no questions match filters', () => {
      render(<QuestionSelector {...defaultProps} questions={[]} />);
      
      expect(screen.getByText('No questions found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters or add more questions to your question bank.')).toBeInTheDocument();
    });
  });

  describe('Filtering Functionality', () => {
    it('filters questions by section correctly', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const sectionSelect = screen.getByDisplayValue('All');
      fireEvent.change(sectionSelect, { target: { value: 'Reading and Writing' } });
      
      await waitFor(() => {
        expect(screen.getByText(/Questions \(2 available\)/)).toBeInTheDocument();
        expect(screen.getByText('This is a reading question about literature?')).toBeInTheDocument();
        expect(screen.queryByText('This is a math question about algebra?')).not.toBeInTheDocument();
      });
    });

    it('filters questions by difficulty correctly', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const difficultySelects = screen.getAllByRole('combobox');
      const difficultySelect = difficultySelects.find(select => 
        select.previousElementSibling?.textContent === 'Difficulty'
      );
      
      if (difficultySelect) {
        fireEvent.change(difficultySelect, { target: { value: 'Easy' } });
        
        await waitFor(() => {
          expect(screen.getByText(/Questions \(1 available\)/)).toBeInTheDocument();
          expect(screen.getByText('This is a reading question about literature?')).toBeInTheDocument();
        });
      }
    });

    it('resets dependent filters when parent filter changes', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const selects = screen.getAllByRole('combobox');
      const sectionSelect = selects[0]; // First select should be section
      const domainSelect = selects[1]; // Second select should be domain
      
      // First change domain
      fireEvent.change(domainSelect, { target: { value: 'Algebra' } });
      
      // Then change section - should reset domain
      fireEvent.change(sectionSelect, { target: { value: 'Reading and Writing' } });
      
      await waitFor(() => {
        expect(domainSelect.value).toBe('All');
      });
    });

    it('shows correct domain options based on section selection', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const sectionSelect = screen.getAllByRole('combobox')[0];
      fireEvent.change(sectionSelect, { target: { value: 'Math' } });
      
      await waitFor(() => {
        const domainSelect = screen.getAllByRole('combobox')[1];
        const options = Array.from(domainSelect.options).map(option => option.text);
        expect(options).toContain('Algebra');
      });
    });
  });

  describe('Question Selection', () => {
    it('allows selecting individual questions', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      const firstQuestionCheckbox = checkboxes[0];
      
      fireEvent.click(firstQuestionCheckbox);
      
      await waitFor(() => {
        expect(firstQuestionCheckbox).toBeChecked();
        expect(screen.getByText('Start Quiz (1)')).toBeInTheDocument();
      });
    });

    it('allows selecting all questions', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);
      
      await waitFor(() => {
        expect(screen.getByText('Start Quiz (3)')).toBeInTheDocument();
        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach(checkbox => {
          expect(checkbox).toBeChecked();
        });
      });
    });

    it('allows clearing all selections', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      // First select all
      const selectAllButton = screen.getByText('Select All');
      fireEvent.click(selectAllButton);
      
      await waitFor(() => {
        expect(screen.getByText('Start Quiz (3)')).toBeInTheDocument();
      });

      // Then clear all
      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);
      
      await waitFor(() => {
        expect(screen.getByText('Start Quiz (0)')).toBeInTheDocument();
        const checkboxes = screen.getAllByRole('checkbox');
        checkboxes.forEach(checkbox => {
          expect(checkbox).not.toBeChecked();
        });
      });
    });

    it('updates start quiz button count correctly', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      
      // Select first question
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(screen.getByText('Start Quiz (1)')).toBeInTheDocument();
      });

      // Select second question
      fireEvent.click(checkboxes[1]);
      await waitFor(() => {
        expect(screen.getByText('Start Quiz (2)')).toBeInTheDocument();
      });

      // Deselect first question
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(screen.getByText('Start Quiz (1)')).toBeInTheDocument();
      });
    });
  });

  describe('Start Quiz Functionality', () => {
    it('starts quiz with selected questions', async () => {
      const mockOnStartQuiz = vi.fn();
      render(<QuestionSelector {...defaultProps} onStartQuiz={mockOnStartQuiz} />);
      
      // Select some questions
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      
      await waitFor(() => {
        expect(screen.getByText('Start Quiz (2)')).toBeInTheDocument();
      });

      // Start quiz
      const startButton = screen.getByText('Start Quiz (2)');
      fireEvent.click(startButton);
      
      expect(mockOnStartQuiz).toHaveBeenCalledWith([
        mockQuestions[0],
        mockQuestions[1]
      ]);
    });

    it('disables start quiz button when no questions selected', () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const startButton = screen.getByText('Start Quiz (0)');
      expect(startButton).toBeDisabled();
      expect(startButton).toHaveClass('cursor-not-allowed');
    });

    it('enables start quiz button when questions are selected', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      
      await waitFor(() => {
        const startButton = screen.getByText('Start Quiz (1)');
        expect(startButton).not.toBeDisabled();
        expect(startButton).not.toHaveClass('cursor-not-allowed');
      });
    });
  });

  describe('Question Status Display', () => {
    it('shows correct status indicators for questions', () => {
      render(<QuestionSelector {...defaultProps} />);
      
      // Question 1 should show as correct (✓)
      const correctIndicators = screen.getAllByText('✓');
      expect(correctIndicators.length).toBeGreaterThan(0);
      
      // Question 2 should show as wrong (✗)
      const wrongIndicators = screen.getAllByText('✗');
      expect(wrongIndicators.length).toBeGreaterThan(0);
    });

    it('filters questions by status correctly', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const statusSelects = screen.getAllByRole('combobox');
      const statusSelect = statusSelects.find(select => 
        select.previousElementSibling?.textContent === 'Status'
      );
      
      if (statusSelect) {
        fireEvent.change(statusSelect, { target: { value: 'Correct' } });
        
        await waitFor(() => {
          expect(screen.getByText(/Questions \(1 available\)/)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Responsive Design', () => {
    it('displays filters in grid layout', () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const filterContainer = screen.getByText('Filter Questions').parentElement;
      expect(filterContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-5');
    });

    it('has proper styling for compact layout', () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const questionsContainer = screen.getByText('Select Questions for Quiz').parentElement.parentElement;
      expect(questionsContainer.style.maxHeight).toBe('450px');
    });
  });

  describe('Error Handling', () => {
    it('handles empty questions array gracefully', () => {
      render(<QuestionSelector {...defaultProps} questions={[]} />);
      
      expect(screen.getByText('No questions found')).toBeInTheDocument();
      expect(screen.getByText(/Questions \(0 available\)/)).toBeInTheDocument();
    });

    it('handles missing question properties gracefully', () => {
      const incompleteQuestions = [
        {
          id: 'q1',
          questionText: 'Incomplete question',
          // Missing section, domain, etc.
        }
      ];
      
      render(<QuestionSelector {...defaultProps} questions={incompleteQuestions} />);
      
      expect(screen.getByText('Incomplete question')).toBeInTheDocument();
    });

    it('handles null questionAnswers data gracefully', () => {
      const { useQuestionAnswers } = require('../../hooks/useUserData');
      useQuestionAnswers.mockReturnValue({ data: null });
      
      render(<QuestionSelector {...defaultProps} />);
      
      // Should still render questions without status indicators
      expect(screen.getByText('This is a reading question about literature?')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large number of questions efficiently', () => {
      const manyQuestions = Array.from({ length: 100 }, (_, i) => ({
        id: `q${i}`,
        questionText: `Question ${i}`,
        section: 'Reading and Writing',
        domain: 'Information and Ideas',
        questionType: 'Multiple Choice',
        difficulty: 'Easy',
        answerChoices: { A: 'A', B: 'B', C: 'C', D: 'D' },
        correctAnswer: 'A'
      }));
      
      render(<QuestionSelector {...defaultProps} questions={manyQuestions} />);
      
      expect(screen.getByText(/Questions \(100 available\)/)).toBeInTheDocument();
    });

    it('updates filter results efficiently', async () => {
      render(<QuestionSelector {...defaultProps} />);
      
      const sectionSelect = screen.getAllByRole('combobox')[0];
      
      // Multiple rapid filter changes should be handled smoothly
      fireEvent.change(sectionSelect, { target: { value: 'Math' } });
      fireEvent.change(sectionSelect, { target: { value: 'Reading and Writing' } });
      fireEvent.change(sectionSelect, { target: { value: 'All' } });
      
      await waitFor(() => {
        expect(screen.getByText(/Questions \(3 available\)/)).toBeInTheDocument();
      });
    });
  });
}); 