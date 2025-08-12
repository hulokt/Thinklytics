import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuestionAnswers } from '../hooks/useUserData';
import { useQuizManager, QUIZ_STATUS } from './QuizManager';
import { useAuth } from '../contexts/AuthContext';
import { useUndo } from '../contexts/UndoContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { awardPoints, handleQuizEdit } from '../lib/userPoints';
import PointsAnimation from './PointsAnimation';
import { useLocation } from 'react-router-dom';
import ImageModal from './ImageModal';
import { useSoundSettings } from '../contexts/SoundSettingsContext';


// Import sound files
import quizFinishedSound from '../assets/quizFinishedSound.wav';
import deletedQuestionOrQuizSound from '../assets/deltedQuestionOrQuiz.wav';
import addedOrEditedNewQuestionSound from '../assets/addedOrEditedNewQuestion.wav';

const QuizHistory = ({ onBack, onResumeQuiz }) => {
  const { isDarkMode } = useDarkMode();
  const { soundEnabled } = useSoundSettings();
  // Initial props and state
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [editingAnswers, setEditingAnswers] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [currentView, setCurrentView] = useState('list');
  const [pointsAnimation, setPointsAnimation] = useState({ show: false, points: 0, action: '' });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingQuiz, setIsDeletingQuiz] = useState(false);
  const [isDeletingAllQuizzes, setIsDeletingAllQuizzes] = useState(false);
  const [isResettingNumbers, setIsResettingNumbers] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAudio, setCelebrationAudio] = useState(null);
  const [deleteAudio, setDeleteAudio] = useState(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [saveAudio, setSaveAudio] = useState(null);
  const [imageModal, setImageModal] = useState({ isOpen: false, imageSrc: '', imageAlt: '' });
  const celebrationCheckedRef = useRef(false);
  const celebrationSessionRef = useRef(null);

  // Get location to check for celebration state
  const location = useLocation();

  // Initialize celebration audio
  useEffect(() => {
    const audio = new Audio(quizFinishedSound);
    audio.volume = 0.5;
    
    // Wait for audio to be loaded before setting it
    audio.addEventListener('canplaythrough', () => {
      setCelebrationAudio(audio);
      setAudioLoaded(true);
    });
    
    // Load the audio
    audio.load();
    
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Initialize delete audio
  useEffect(() => {
    const audio = new Audio(deletedQuestionOrQuizSound);
    audio.volume = 0.4;
    setDeleteAudio(audio);
    
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Initialize save audio
  useEffect(() => {
    const audio = new Audio(addedOrEditedNewQuestionSound);
    audio.volume = 0.4;
    setSaveAudio(audio);
    
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  // Check for celebration state from navigation - BULLETPROOF single trigger
  useEffect(() => {
    if (location.state?.showCelebration && audioLoaded && celebrationAudio) {
      const celebrationId = location.state.celebrationId || `celebration-${Date.now()}`;
      
      // Only proceed if this is a NEW celebration session
      if (celebrationSessionRef.current !== celebrationId) {
        celebrationSessionRef.current = celebrationId;
        
        const hasShownThisCelebration = sessionStorage.getItem(`satlog-celebration-${celebrationId}`);
        
        if (!hasShownThisCelebration) {
          // Mark this specific celebration as shown
          sessionStorage.setItem(`satlog-celebration-${celebrationId}`, 'true');
          
          // Start celebration ONCE
          setShowCelebration(true);
          
          // Create a fresh audio instance for this celebration
          if (soundEnabled) {
            const freshAudio = new Audio(quizFinishedSound);
            freshAudio.volume = 0.5;
            freshAudio.play().catch(error => {
              // Audio play failed
            });
          }
        }
      }
      
      // Always clear the navigation state to prevent repeated triggers
      window.history.replaceState({}, document.title);
    }
  }, [location.state, celebrationAudio, audioLoaded]);

  // Use new QuizManager
  const { 
    quizManager, 
    allQuizzes, 
    allQuizzesLoading,
    inProgressQuizzes: inProgressQuizzesRaw,
    completedQuizzes: completedQuizzesRaw
  } = useQuizManager();
  
  // Local state for immediate UI updates
  const [localInProgressQuizzes, setLocalInProgressQuizzes] = useState([]);
  const [localCompletedQuizzes, setLocalCompletedQuizzes] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Memoize particle effect to avoid recreating on every render
  const particleEffect = useMemo(() => 
    [...Array(15)].map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 3;
      const duration = 2 + Math.random() * 2;
      const size = Math.random() * 3 + 1;
      
      return {
        id: i,
        left: `${left}%`,
        top: `${top}%`,
        size: `${size}px`,
        delay: `${delay}s`,
        duration: `${duration}s`
      };
    }), [isDarkMode]
  );
  
  const { 
    data: questionAnswers, 
    upsertData: upsertQuestionAnswers 
  } = useQuestionAnswers();

  // Get user for points
  const { user } = useAuth();

  // Award points and show animation
  const awardPointsAndAnimate = async (actionType, additionalData = {}) => {
    if (!user?.id) return;
    
    try {
      const result = await awardPoints(user.id, actionType, additionalData);
      if (result.success && result.pointsAwarded !== 0) {

        setPointsAnimation({
          show: true,
          points: result.pointsAwarded,
          action: actionType
        });
      }
    } catch (error) {
      // Error awarding points
    }
  };

  // Handle points animation completion
  const handlePointsAnimationComplete = () => {
    setPointsAnimation({ show: false, points: 0, action: '' });
  };

  // Image modal handlers
  const handleImageClick = (imageSrc, imageAlt) => {
    setImageModal({ isOpen: true, imageSrc, imageAlt });
  };

  const handleCloseImageModal = () => {
    setImageModal({ isOpen: false, imageSrc: '', imageAlt: '' });
  };

  // Handle celebration completion
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    // Clean up celebration session
    celebrationSessionRef.current = null;
  };

  // Celebration Animation Component
  const CelebrationAnimation = () => {
    const [confetti, setConfetti] = useState([]);
    const animationStartedRef = useRef(false);
    const confettiIntervalRef = useRef(null);
    const hideTimeoutRef = useRef(null);
    const celebrationIdRef = useRef(null);

    useEffect(() => {
      if (showCelebration) {
        // Only start if not already running
        if (!animationStartedRef.current) {
          animationStartedRef.current = true;
          
          // Create confetti particles with better physics
          const confettiParticles = Array.from({ length: 80 }, (_, i) => ({
            id: i,
            x: Math.random() * window.innerWidth,
            y: -20,
            vx: (Math.random() - 0.5) * 6,
            vy: Math.random() * 2 + 1,
            color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'][Math.floor(Math.random() * 10)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8,
            gravity: 0.08,
            wind: (Math.random() - 0.5) * 0.02
          }));

          setConfetti(confettiParticles);

          // Animate confetti with smoother physics
          const animateConfetti = () => {
            setConfetti(prev => prev.map(particle => ({
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vy: particle.vy + particle.gravity,
              vx: particle.vx + particle.wind,
              rotation: particle.rotation + particle.rotationSpeed
            })).filter(particle => particle.y < window.innerHeight + 100));
          };

          // Much faster animation interval for smoother movement
          confettiIntervalRef.current = setInterval(animateConfetti, 16); // ~60fps

          // Auto-hide celebration after 4 seconds
          hideTimeoutRef.current = setTimeout(() => {
            handleCelebrationComplete();
          }, 4000);
        } else {
          // Celebration animation already running - skipping restart
        }
      } else {
        // Clean up when celebration ends
        if (animationStartedRef.current) {
          animationStartedRef.current = false;
          
          // Clear intervals and timeouts
          if (confettiIntervalRef.current) {
            clearInterval(confettiIntervalRef.current);
            confettiIntervalRef.current = null;
          }
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current);
            hideTimeoutRef.current = null;
          }
          
          setConfetti([]);
        }
      }

      // Cleanup on unmount
      return () => {
        if (confettiIntervalRef.current) {
          clearInterval(confettiIntervalRef.current);
        }
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
      };
    }, [showCelebration]);

    // Debug re-renders
    useEffect(() => {
      if (showCelebration) {
        // CelebrationAnimation re-rendered while celebration active
      }
    });

    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Confetti */}
        {confetti.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              backgroundColor: particle.color,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              transform: `rotate(${particle.rotation}deg)`,
              opacity: 0.9,
              willChange: 'transform, left, top'
            }}
          />
        ))}
      </div>
    );
  };

  // Defensive: always use arrays
  useEffect(() => {
    if (!Array.isArray(inProgressQuizzesRaw) || !Array.isArray(completedQuizzesRaw)) {
      // One of the quiz arrays is not an array
    }
  }, [inProgressQuizzesRaw, completedQuizzesRaw]);

  // Sync local state with QuizManager state
  useEffect(() => {
    setLocalInProgressQuizzes(Array.isArray(inProgressQuizzesRaw) ? inProgressQuizzesRaw : []);
    setLocalCompletedQuizzes(Array.isArray(completedQuizzesRaw) ? completedQuizzesRaw : []);
  }, [inProgressQuizzesRaw, completedQuizzesRaw]);

  // Avoid forcing a refresh on mount to prevent extra RPC calls/flicker when backend is slow

  // Handle initial loading state
  useEffect(() => {
    if (!allQuizzesLoading && (Array.isArray(inProgressQuizzesRaw) || Array.isArray(completedQuizzesRaw))) {
      setIsInitialLoading(false);
    }
  }, [allQuizzesLoading, inProgressQuizzesRaw, completedQuizzesRaw]);

  // Debug: Track all component re-renders
  const renderCountRef = useRef(0);
  renderCountRef.current++;
  
  useEffect(() => {
    // QuizHistory render tracking removed
  });

  // De-duplicate quizzes by ID to prevent duplicates from transient data issues
  const dedupeById = (items) => {
    const seen = new Set();
    const result = [];
    for (const item of Array.isArray(items) ? items : []) {
      const key = String(item?.id);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }
    return result;
  };

  const inProgressQuizzes = dedupeById(localInProgressQuizzes);
  const completedQuizzes = dedupeById(localCompletedQuizzes);

  // One-time background cleanup: if duplicates exist in the unified array, persist a deduped version
  useEffect(() => {
    try {
      if (quizManager && Array.isArray(allQuizzes)) {
        const dedupedAll = dedupeById(allQuizzes);
        if (dedupedAll.length !== allQuizzes.length) {
          // Fire-and-forget; don't block UI
          quizManager.updateQuizzes(dedupedAll).catch(() => {});
        }
      }
    } catch {}
  }, [quizManager, allQuizzes]);

  // Ensure both arrays are properly formatted
  const inProgressQuizzesArray = inProgressQuizzes;
  const quizHistoryArray = completedQuizzes;

  // Combine both completed and in-progress quizzes (for legacy code, not used in rendering)
  const allQuizData = [
    ...quizHistoryArray,
    ...inProgressQuizzesArray.map(quiz => ({ ...quiz, isInProgress: true }))
  ];

  const handleEditQuiz = (quiz) => {
    // Only allow editing completed quizzes, not in-progress ones
    if (quiz.isInProgress) {
      alert('Cannot edit in-progress quizzes. Please complete the quiz first.');
      return;
    }
    
    // Initialize editing answers with current user answers converted to letters
    const initialEditingAnswers = {};
    quiz.questions.forEach(question => {
      if (question.userAnswer) {
        // Convert user answer to letter format if it's text
        let userAnswerLetter = question.userAnswer;
        
        // If the user answer is not already a letter, find the corresponding letter
        if (!['A', 'B', 'C', 'D'].includes(question.userAnswer)) {
          const choices = question.answerChoices || {};
          for (const [letter, text] of Object.entries(choices)) {
            if (text === question.userAnswer) {
              userAnswerLetter = letter;
              break;
            }
          }
          
          // Fallback: check options array
          if (!['A', 'B', 'C', 'D'].includes(userAnswerLetter) && question.options) {
            const answerIndex = question.options.findIndex(option => option === question.userAnswer);
            if (answerIndex !== -1) {
              userAnswerLetter = ['A', 'B', 'C', 'D'][answerIndex];
            }
          }
        }
        
        initialEditingAnswers[question.id] = userAnswerLetter;
      }
    });
    
    setEditingQuiz(quiz);
    setEditingAnswers(initialEditingAnswers);
    setSelectedQuestionIndex(0);
  };

  const handleDeleteQuiz = (quiz) => {
    setShowDeleteConfirm(quiz);
  };

  const { addUndoAction } = useUndo();

  const confirmDeleteQuiz = async () => {
    if (!showDeleteConfirm) return;
    
    const quizToDelete = showDeleteConfirm;
    
    // Immediately hide modal and remove quiz from UI for instant feedback
    setShowDeleteConfirm(null);
    setIsDeletingQuiz(false);
    
    // Store the original state for potential undo
    const originalInProgress = localInProgressQuizzes;
    const originalCompleted = localCompletedQuizzes;
    
    // Immediately remove the quiz from local state for instant visual feedback
    setLocalInProgressQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
    setLocalCompletedQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
    
    // Play delete sound immediately
    if (deleteAudio && soundEnabled) {
      deleteAudio.currentTime = 0;
      deleteAudio.play().catch(error => {
        // Delete audio play failed
      });
    }
    
    // Immediately delete from database for persistence
    try {
      await quizManager.deleteQuiz(quizToDelete.id);
      
      // Only update question answers if there are actually answers to remove
      if (questionAnswers && quizToDelete.questions && Object.keys(questionAnswers).length > 0) {
        const updatedAnswers = { ...questionAnswers };
        let hasChanges = false;
        
        // Only process questions that actually have answers in the database
        quizToDelete.questions.forEach(question => {
          if (updatedAnswers[question.id] && updatedAnswers[question.id].length > 0) {
            const originalLength = updatedAnswers[question.id].length;
            updatedAnswers[question.id] = updatedAnswers[question.id].filter(
              answer => answer.quizId !== quizToDelete.id
            );
            if (updatedAnswers[question.id].length !== originalLength) {
              hasChanges = true;
            }
            // Remove empty arrays
            if (updatedAnswers[question.id].length === 0) {
              delete updatedAnswers[question.id];
            }
          }
        });
        
        // Only call upsertQuestionAnswers if there were actual changes
        if (hasChanges) {
          // Fire and forget - don't wait for this operation
          upsertQuestionAnswers(updatedAnswers).catch(error => {
            // Failed to update question answers
          });
        }
      }
    } catch (error) {
    
      // If database deletion fails, restore the UI
      setLocalInProgressQuizzes(originalInProgress);
      setLocalCompletedQuizzes(originalCompleted);
      alert('Failed to delete quiz. Please try again.');
      return;
    }
    
    // Add to undo stack
    addUndoAction({
      id: `quiz-${quizToDelete.id}-${Date.now()}`,
      type: 'quiz',
      data: {
        quiz: quizToDelete,
        originalInProgress,
        originalCompleted,
        questionAnswers: questionAnswers
      },
      onUndo: async (data) => {
        // Restore the quiz to the UI and database
        setLocalInProgressQuizzes(data.originalInProgress);
        setLocalCompletedQuizzes(data.originalCompleted);
        
        // Re-add the quiz to the database
        try {
          await quizManager.addQuiz(data.quiz);
        } catch (error) {
         
        }
      },
      onConfirm: () => {
        // The deletion is already done, just confirm it
      }
    });
  };

  const cancelDeleteQuiz = () => {
    setShowDeleteConfirm(null);
  };

  const handleResetNumbering = () => {
    setShowResetConfirm(true);
  };

  const handleDeleteAllQuizzes = () => {
    setShowDeleteAllConfirm(true);
  };

  const confirmDeleteAllQuizzes = async () => {
    setIsDeletingAllQuizzes(true);
    try {
      if (!quizManager) return;

      // Play delete sound
      if (deleteAudio && soundEnabled) {
        deleteAudio.currentTime = 0;
        deleteAudio.play().catch(error => {
          // Delete audio play failed
        });
      }

      await quizManager.deleteAllQuizzes();

      // Clear question answers mapping if desired
      if (questionAnswers) {
        await upsertQuestionAnswers({});
      }

      setShowDeleteAllConfirm(false);
    } catch (err) {
      alert('Failed to delete all quizzes. Please try again.');
    } finally {
      setIsDeletingAllQuizzes(false);
    }
  };

  const cancelDeleteAllQuizzes = () => setShowDeleteAllConfirm(false);

  const confirmResetNumbers = async () => {
    setIsResettingNumbers(true);
    try {
      if (!quizManager) return;

      // Reset the numbering system by clearing all quizzes
      await quizManager.deleteAllQuizzes();

      setShowResetConfirm(false);
    } catch (err) {
      alert('Failed to reset quiz numbers. Please try again.');
    } finally {
      setIsResettingNumbers(false);
    }
  };

  const cancelResetNumbers = () => setShowResetConfirm(false);

  // Helper function to get the correct answer letter for a question
  const getCorrectAnswerLetter = (question) => {
    if (!question.answerChoices && !question.options) {
      return null;
    }
    
    const choices = question.answerChoices || {};
    const options = question.options || [];
    
    // Check if correctAnswer is already a letter (A, B, C, D)
    if (['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
      return question.correctAnswer;
    }
    
    // Find which letter corresponds to the correct answer text
    for (const [letter, text] of Object.entries(choices)) {
      if (text === question.correctAnswer) {
        return letter;
      }
    }
    
    // Fallback: check options array
    const correctIndex = options.findIndex(option => option === question.correctAnswer);
    if (correctIndex !== -1) {
      const letter = ['A', 'B', 'C', 'D'][correctIndex];
      return letter;
    }
    
    return null;
  };

  const handleAnswerChange = (questionId, newAnswer) => {
    setEditingAnswers(prev => {
      const updated = {
        ...prev,
        [questionId]: newAnswer
      };
      
      return updated;
    });
  };

  const handleSaveChanges = async () => {
    if (!editingQuiz || !editingQuiz.questions) {
      return;
    }

    setIsSaving(true);

    try {
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
        
        return {
          ...question,
          userAnswer: currentAnswer,
          isCorrect: currentAnswer === correctLetter
        };
      });

      // Calculate new statistics
      const correctCount = updatedQuestions.filter(q => q.isCorrect).length;
      const totalQuestions = updatedQuestions.length;
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      // Create updated quiz
      const updatedQuiz = {
        ...editingQuiz,
        questions: updatedQuestions,
        score: score,
        correctAnswers: correctCount,
        totalQuestions: totalQuestions,
        lastModified: new Date().toISOString()
      };

      // Check if answers were actually changed before making database calls
      const originalAnswers = editingQuiz.questions.reduce((acc, q) => {
        acc[q.id] = q.userAnswer;
        return acc;
      }, {});
      
      const hasChanges = Object.keys(editingAnswers).some(key => 
        editingAnswers[key] !== originalAnswers[key]
      );

      // Use QuizManager to update the quiz (this is the main save operation)
      await quizManager.updateQuiz(editingQuiz.id, updatedQuiz);
      
      // Play save sound immediately after successful save
      if (saveAudio && soundEnabled) {
        saveAudio.currentTime = 0;
        saveAudio.play().catch(error => {
          // Save audio play failed
        });
      }
      
      // Only do additional operations if there were actual changes (non-blocking)
      if (hasChanges) {
        // Increment the local edit counter
        handleQuizEdit();
        
        // Run points animation non-blocking (don't await it)
        awardPointsAndAnimate('EDIT_ANSWER').catch(error => {
          // Points animation failed
        });
        
        // Update question answers for analytics (non-blocking)
        const currentAnswers = questionAnswers || {};
        const updatedAnswers = { ...currentAnswers };
        
        updatedQuestions.forEach(question => {
          if (question.userAnswer) {
            if (!updatedAnswers[question.id]) {
              updatedAnswers[question.id] = [];
            }
            
            // Remove existing answer for this quiz
            updatedAnswers[question.id] = updatedAnswers[question.id].filter(
              answer => answer.quizId !== editingQuiz.id
            );
            
            // Add new answer
            updatedAnswers[question.id].push({
              quizId: editingQuiz.id,
              answer: question.userAnswer,
              isCorrect: question.isCorrect,
              date: editingQuiz.date || new Date().toISOString()
            });
          }
        });
        
        // Run analytics update non-blocking
        upsertQuestionAnswers(updatedAnswers).catch(error => {
        });
      }
      
      // Exit edit mode and show updated quiz immediately
      setEditingQuiz(null);
      setEditingAnswers({});
      
    } catch (error) {
      alert('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuiz(null);
    setEditingAnswers({});
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
  const inProgressQuizzesSorted = inProgressQuizzes
    .sort((a, b) => new Date(b.lastUpdated || b.date) - new Date(a.lastUpdated || a.date));

  // Sort completed quizzes by latest first
  const completedQuizzesSorted = completedQuizzes
    .sort((a, b) => new Date(b.date || b.lastUpdated) - new Date(a.date || a.lastUpdated));

  // Group quizzes by date
  const groupQuizzesByDate = (quizzes) => {
    const groups = {};
    
    quizzes.forEach(quiz => {
      const date = new Date(quiz.date || quiz.lastUpdated);
      const dateKey = date.toDateString(); // This gives us "Mon Dec 25 2023" format
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
      
      let displayDate;
      if (dateKey === today) {
        displayDate = 'Today';
      } else if (dateKey === yesterday) {
        displayDate = 'Yesterday';
      } else {
        displayDate = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      
      if (!groups[displayDate]) {
        groups[displayDate] = [];
      }
      groups[displayDate].push(quiz);
    });
    
    // Sort groups by date (most recent first)
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        if (dateA === 'Today') return -1;
        if (dateB === 'Today') return 1;
        if (dateA === 'Yesterday') return -1;
        if (dateB === 'Yesterday') return 1;
        
        // For other dates, sort by actual date
        const dateAObj = new Date(dateA);
        const dateBObj = new Date(dateB);
        return dateBObj - dateAObj;
      })
      .map(([date, quizzes]) => ({ date, quizzes }));
  };

  // Group in-progress and completed quizzes by date
  const inProgressQuizzesGrouped = groupQuizzesByDate(inProgressQuizzesSorted);
  const completedQuizzesGrouped = groupQuizzesByDate(completedQuizzesSorted);

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
      
      return {
        ...question,
        userAnswer: currentAnswer,
        isCorrect: currentAnswer === correctLetter
      };
    });
    
    const correctCount = updatedQuestions.filter(q => q.isCorrect).length;
    const newScore = Math.round((correctCount / updatedQuestions.length) * 100);
    
    return (
      <div className="h-full overflow-hidden flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
        {/* Header - EXACT copy from view page */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Quiz Details</h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">
                Review your performance and answers for this quiz.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="w-full px-3 sm:px-6 py-4 sm:py-6 h-full">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                <h3 className="text-gray-900 dark:text-white text-lg font-bold transition-colors duration-300">
                  Quiz from {formatDate(editingQuiz.date)}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingQuiz(null);
                      setEditingAnswers({});
                    }}
                    className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-300 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 w-full sm:w-auto ${
                      isSaving 
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      'Save Changes'
                    )}
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
                    <div key={question.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4 transition-colors duration-300">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                        <div className="flex flex-col gap-2">
                          <h4 className="text-gray-900 dark:text-white font-medium transition-colors duration-300">Question {index + 1}</h4>
                          {/* Question Type Badge */}
                          {question.questionType && (
                            <div className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                              {question.questionType}
                            </div>
                          )}
                        </div>
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
                      {/* Passage image and/or text - show image first if present */}
                      {question.passageImage && (
                        <img
                          src={question.passageImage}
                          alt="Passage"
                          className="max-h-60 sm:max-h-80 rounded shadow border mb-2 mx-auto w-full object-contain"
                        />
                      )}
                      {question.passageText && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">
                          {question.passageText}
                        </p>
                      )}
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
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
                      
                      {(question.explanation || question.explanationImage) && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600 rounded-lg p-3 transition-colors duration-300">
                          <div className="text-blue-800 dark:text-blue-300 text-sm transition-colors duration-300">
                            <strong>Explanation:</strong>
                                                         {question.explanationImage && (
                               <div className="mt-2">
                                 <img 
                                   src={question.explanationImage} 
                                   alt="Explanation" 
                                   className="max-h-48 w-auto rounded shadow-sm border border-blue-200 dark:border-blue-600 cursor-pointer hover:opacity-90 transition-opacity duration-200" 
                                   onClick={() => handleImageClick(question.explanationImage, 'Explanation')}
                                 />
                               </div>
                             )}
                            {question.explanation && (
                              <p className="mt-2">
                                {question.explanation}
                              </p>
                            )}
                          </div>
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
    <div className="relative h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Enhanced Background with Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-950/20 via-indigo-950/10 to-purple-950/20' 
            : 'bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-purple-100/60'
        }`}></div>
        
        {/* Main Floating Orbs */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20' 
            : 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20' 
            : 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15'
        }`}></div>
        
        {/* Additional Floating Elements */}
        <div className={`absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/15' 
            : 'bg-gradient-to-r from-purple-500/12 to-pink-500/12'
        }`}></div>
        <div className={`absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl animate-pulse delay-1500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15' 
            : 'bg-gradient-to-r from-cyan-500/12 to-blue-500/12'
        }`}></div>
        
        {/* Geometric Shapes */}
        <div className={`absolute top-20 left-10 w-32 h-32 border-2 rounded-2xl rotate-12 animate-float ${
          isDarkMode 
            ? 'border-blue-400/30 bg-transparent' 
            : 'border-blue-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 rounded-full animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' 
            : 'bg-gradient-to-br from-blue-500/15 to-indigo-500/15'
        }`}></div>
        <div className={`absolute bottom-32 left-20 w-20 h-20 border-2 rounded-lg rotate-45 animate-float-slow ${
          isDarkMode 
            ? 'border-purple-400/30 bg-transparent' 
            : 'border-purple-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        
        {/* Modern Abstract Shapes */}
        <div className={`absolute top-1/3 left-16 w-24 h-32 rounded-tl-3xl rounded-br-3xl animate-float delay-800 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20' 
            : 'bg-gradient-to-r from-blue-400/15 to-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-1/3 right-16 w-32 h-24 rounded-tr-3xl rounded-bl-3xl animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-400/20 to-indigo-400/20' 
            : 'bg-gradient-to-r from-purple-400/15 to-indigo-400/15'
        }`}></div>
        
        {/* Star-like Shapes */}
        <div className={`absolute top-1/3 right-1/6 w-8 h-8 transform rotate-45 animate-float delay-900 ${
          isDarkMode 
            ? 'bg-amber-400/25' 
            : 'bg-amber-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        <div className={`absolute bottom-2/5 left-1/8 w-6 h-6 transform -rotate-15 animate-float-slow delay-1100 ${
          isDarkMode 
            ? 'bg-lime-400/25' 
            : 'bg-lime-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        
        {/* Triangle Accents */}
        <div className={`absolute top-1/4 right-1/4 w-8 h-8 transform rotate-45 animate-float delay-1000 ${
          isDarkMode 
            ? 'bg-cyan-400/20' 
            : 'bg-cyan-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-12 h-12 transform -rotate-30 animate-float-delayed ${
          isDarkMode 
            ? 'bg-rose-400/20' 
            : 'bg-rose-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        
        {/* Shining Light Effects */}
        <div className={`absolute top-1/5 right-1/4 w-2 h-2 rounded-full animate-ping delay-500 ${
          isDarkMode ? 'bg-white/60' : 'bg-blue-300/70'
        }`}></div>
        <div className={`absolute bottom-1/5 left-1/4 w-1 h-1 rounded-full animate-ping delay-1200 ${
          isDarkMode ? 'bg-yellow-300/80' : 'bg-yellow-300/70'
        }`}></div>
        <div className={`absolute top-2/5 left-3/4 w-1.5 h-1.5 rounded-full animate-ping delay-800 ${
          isDarkMode ? 'bg-cyan-300/70' : 'bg-cyan-300/60'
        }`}></div>
        <div className={`absolute bottom-2/5 right-3/4 w-2.5 h-2.5 rounded-full animate-ping delay-1800 ${
          isDarkMode ? 'bg-pink-300/60' : 'bg-pink-300/50'
        }`}></div>
        
        {/* Particle Effect */}
        <div className="absolute inset-0">
          {particleEffect.map((particle) => (
            <div
              key={`particle-${particle.id}`}
              className={`absolute rounded-full animate-ping ${
                isDarkMode ? 'bg-blue-500/40' : 'bg-blue-500/30'
              }`}
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDelay: particle.delay,
                animationDuration: particle.duration
              }}
            ></div>
          ))}
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.05]`}>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px), 
                             radial-gradient(circle at 75% 75%, #6366f1 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
          }}></div>
        </div>
        
        {/* Floating Lines */}
        <div className={`absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform rotate-45 animate-pulse delay-1000`}></div>
        <div className={`absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent transform -rotate-45 animate-pulse delay-2000`}></div>
        <div className={`absolute top-2/3 left-0 w-24 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform rotate-12 animate-pulse delay-500`}></div>
        
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 rounded-tl-3xl ${
          isDarkMode ? 'border-blue-400/20' : 'border-blue-400/15'
        }`}></div>
        <div className={`absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 rounded-tr-3xl ${
          isDarkMode ? 'border-purple-400/20' : 'border-purple-400/15'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 rounded-bl-3xl ${
          isDarkMode ? 'border-cyan-400/20' : 'border-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 rounded-br-3xl ${
          isDarkMode ? 'border-indigo-400/20' : 'border-indigo-400/15'
        }`}></div>
      </div>

      {/* Header - Modern Design */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Quiz History</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">
              Review your quiz results and track your progress over time.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="h-full px-3 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto h-full flex flex-col min-h-0">
          {(allQuizzesLoading || isInitialLoading) ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Loading Quiz History...</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Retrieving your completed and in-progress quizzes
                  </p>
                </div>
              </div>
            </div>
          ) : (allQuizData.length === 0) ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 text-center transition-colors duration-300">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">No quiz history yet</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Complete your first quiz to see your results here.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {/* In Progress Quizzes Section */}
              {inProgressQuizzesGrouped.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-lg font-semibold transition-colors duration-300">In Progress Quizzes</h2>
                    <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs font-medium transition-colors duration-300 w-fit">
                      {inProgressQuizzesSorted.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {inProgressQuizzesGrouped.map((group) => (
                      <div key={`ip-${group.date}`} className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors duration-300">
                            {group.date}
                          </h3>
                          <span className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded text-xs transition-colors duration-300">
                            {group.quizzes.length} quiz{group.quizzes.length !== 1 ? 'zes' : ''}
                          </span>
                        </div>
                        <div className="space-y-2 ml-4">
                          {group.quizzes.map((quiz) => (
                            <div key={`ip-${String(quiz.id)}`} className="bg-white dark:bg-gray-800 rounded border-l-4 border-yellow-400 shadow-sm hover:shadow transition-shadow transition-colors duration-300">
                              <div className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                      <h3 className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                                        Quiz #{getQuizDisplayNumber(quiz)} - {formatDate(quiz.lastUpdated || quiz.date)}
                                      </h3>
                                      <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded text-xs transition-colors duration-300 w-fit">
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
                                  <div className="flex gap-2 sm:ml-4">
                                    <button
                                      onClick={() => onResumeQuiz(quiz)}
                                      className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors flex-1 sm:flex-none"
                                    >
                                      Resume
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuiz(quiz)}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors flex-1 sm:flex-none"
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
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Quizzes Section */}
              {completedQuizzesGrouped.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h2 className="text-gray-900 dark:text-white text-lg font-semibold transition-colors duration-300">Completed Quizzes</h2>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded text-xs font-medium transition-colors duration-300">
                      {completedQuizzesSorted.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {completedQuizzesGrouped.map((group) => (
                      <div key={`comp-${group.date}`} className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <h3 className="text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors duration-300">
                            {group.date}
                          </h3>
                          <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-0.5 rounded text-xs transition-colors duration-300">
                            {group.quizzes.length} quiz{group.quizzes.length !== 1 ? 'zes' : ''}
                          </span>
                        </div>
                        <div className="space-y-2 ml-4">
                          {group.quizzes.map((quiz) => (
                            <div
                              key={`comp-${String(quiz.id)}`}
                              className="bg-white dark:bg-gray-800 rounded border-l-4 border-green-400 shadow-sm transition-colors duration-300"
                            >
                              <div className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                                      <h3 className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                                        Quiz #{getQuizDisplayNumber(quiz)} - {formatDate(quiz.date)}
                                      </h3>
                                      <span className={`px-2 py-1 rounded text-xs font-medium transition-colors duration-300 w-fit ${
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
                                  <div className="flex gap-2 sm:ml-4">
                                    <button
                                      onClick={() => handleEditQuiz(quiz)}
                                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex-1 sm:flex-none"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteQuiz(quiz)}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors flex-1 sm:flex-none"
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
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Points Animation */}
      {pointsAnimation.show && (
        <PointsAnimation
          pointsAwarded={pointsAnimation.points}
          actionType={pointsAnimation.action}
          onComplete={handlePointsAnimationComplete}
        />
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        imageSrc={imageModal.imageSrc}
        imageAlt={imageModal.imageAlt}
        onClose={handleCloseImageModal}
      />

              {/* Celebration Animation */}
        {showCelebration && <CelebrationAnimation />}

      {/* Reset Numbering Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelResetNumbers}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 text-white relative rounded-t-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/90 to-red-600/90 rounded-t-2xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Reset Quiz Numbers</h3>
                    <p className="text-sm text-orange-100">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={cancelResetNumbers}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Reset Numbering System</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Next quiz will start from 1</p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Warning:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Existing quiz numbers will remain unchanged</li>
                        <li>• The next quiz you create will be numbered 1</li>
                        <li>• This resets the numbering sequence for future quizzes</li>
                        <li>• The change affects only new quizzes, not existing ones</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={cancelResetNumbers}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmResetNumbers}
                  disabled={isResettingNumbers}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResettingNumbers ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Resetting...
                    </>
                  ) : (
                    'Reset Numbers'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={cancelDeleteAllQuizzes} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full transform transition-all duration-300">
            <div className="px-6 py-4 bg-red-600 text-white rounded-t-2xl">
              <h3 className="font-semibold">Delete ALL quizzes</h3>
            </div>
            <div className="p-6 text-sm text-gray-700 dark:text-gray-300 space-y-2">
              <p>This will permanently remove every quiz, including in-progress and completed ones.</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl flex gap-3">
              <button 
                onClick={cancelDeleteAllQuizzes} 
                disabled={isDeletingAllQuizzes}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteAllQuizzes} 
                disabled={isDeletingAllQuizzes}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingAllQuizzes ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Quiz Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={cancelDeleteQuiz}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 text-white relative rounded-t-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/90 to-red-600/90 rounded-t-2xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Delete Quiz</h3>
                    <p className="text-sm text-red-100">This action cannot be undone</p>
                  </div>
                </div>
                <button
                  onClick={cancelDeleteQuiz}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {showDeleteConfirm.isInProgress ? "Delete In-Progress Quiz" : "Delete Completed Quiz"}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {showDeleteConfirm.isInProgress ? "Your progress will be lost" : "Question statuses will be reset"}
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <p className="font-medium mb-1">Warning:</p>
                      <p>
                        {showDeleteConfirm.isInProgress 
                          ? "Are you sure you want to delete this in-progress quiz? All your progress will be permanently lost and cannot be recovered."
                          : "Are you sure you want to delete this quiz? This will reset the question statuses for all questions in this quiz and cannot be undone."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteQuiz}
                  disabled={isDeletingQuiz}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteQuiz}
                  disabled={isDeletingQuiz}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isDeletingQuiz ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    'Delete Quiz'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizHistory; 