import React, { useState, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { SidebarLayout } from './components/SidebarLayout';
import Homepage from './components/Homepage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AccountPage from './components/AccountPage';
import Profile from './components/Profile';
import QuestionSelector from './components/QuestionSelector';
import QuizHistory from './components/QuizHistory';
// Lazy load heavy components
import { 
  QuestionLogger, 
  QuizPage, 
  AnalyticsPage, 
  CalendarPage 
} from './utils/LazyComponents';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { UndoProvider, useUndo } from './contexts/UndoContext';
import { SoundSettingsProvider } from './contexts/SoundSettingsContext';
import UndoToast from './components/ui/UndoToast';
import { useCalendarEvents, useQuestionAnswers } from './hooks/useUserData';
import { useUserQuestions } from './hooks/useUserQuestions';
import { useGlobalCatalogQuestions } from './hooks/useCatalogGlobal';
import { useQuizManager, QUIZ_STATUS } from './components/QuizManager';
import { supabase } from './lib/supabaseClient';
// Footer pages
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './components/TermsPage';
import HelpCenterPage from './pages/HelpCenterPage';
import BlogPage from './pages/BlogPage';
import CookiePolicyPage from './pages/CookiePolicyPage';
import PressPage from './pages/PressPage';
import DashboardPage from './pages/DashboardPage';
import StudyPlansPage from './pages/StudyPlansPage';
import PracticeTestsPage from './pages/PracticeTestsPage';
import MobileAppPage from './pages/MobileAppPage';
import GDPRPage from './pages/GDPRPage';
import CommunityPage from './pages/CommunityPage';
import TutorialsPage from './pages/TutorialsPage';
import APIDocsPage from './pages/APIDocsPage';
import StatusPage from './pages/StatusPage';
import FeaturesPage from './pages/FeaturesPage';
import PricingPage from './pages/PricingPage';
import AdminPage from './components/AdminPage';
import BackupPage from './components/BackupPage';

// Simple Coming Soon placeholder
const ComingSoonPage = ({ title }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
    <h1 className="text-4xl font-bold mb-4 text-blue-700 dark:text-blue-300">Coming Soon</h1>
    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">{title ? title : 'This page is under construction.'}</p>
    <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Back to Home</a>
  </div>
);

// Simple 404 Page
const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
    <h1 className="text-5xl font-extrabold mb-2 text-gray-900 dark:text-white">404</h1>
    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">Page not found</p>
    <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">Go Home</a>
  </div>
);

// Scroll to top component
function ScrollToTop() {
  const { pathname } = useLocation();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    // Only scroll to top if we're actually navigating to a different page
    // and not just switching tabs or returning to the same page
    if (prevPathRef.current !== pathname) {
      // Use a small delay to ensure the page has fully loaded
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
      
      prevPathRef.current = pathname;
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null;
}

// Main App Component wrapped with Auth Provider and Dark Mode Provider
function App() {
  const isProd = import.meta.env.PROD;
  const basename = "/";
  

  
  return (
    <Router basename={basename}>
      <AuthProvider>
        <DarkModeProvider>
          <SoundSettingsProvider>
            <UndoProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <AppContent />
              </Suspense>
            </UndoProvider>
          </SoundSettingsProvider>
        </DarkModeProvider>
      </AuthProvider>
    </Router>
  );
}

// Auth Callback Handler Component
function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the URL parameters
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        if (error) {
          setError(errorDescription || error);
          setStatus('Authentication failed');
          return;
        }

        if (code) {
          setStatus('Finalizing authentication...');

          // 1) Check if Supabase already stored a session (magic-link auto-loads tokens)
          const {
            data: { session: existingSession },
          } = await supabase.auth.getSession();

          if (existingSession?.user) {
            // Session already present – skip exchange step
            setStatus('Email confirmed! Redirecting...');
            setTimeout(() => navigate('/questions', { replace: true }), 1500);
            return;
          }

          // 2) Try exchanging the code for a session (OAuth/PKCE)
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          // Some email confirmations return an error "invalid request: both auth code and code verifier should be non-empty"
          // even though a session is silently created. So if we get that specific error, attempt to fetch session again.
          if (exchangeError) {
    

            const {
              data: { session: retrySession },
            } = await supabase.auth.getSession();

            if (retrySession?.user) {
              setStatus('Email confirmed! Redirecting...');
              setTimeout(() => navigate('/questions', { replace: true }), 1500);
              return;
            }

            setError(exchangeError.message);
            setStatus('Authentication failed');
            return;
          }

          if (data?.user) {
            setStatus('Email confirmed! Redirecting...');
            setTimeout(() => navigate('/questions', { replace: true }), 1500);
          }
        } else {
          setError('No authentication code found');
          setStatus('Authentication failed');
        }
      } catch (err) {
  
        setError(err.message);
        setStatus('Authentication failed');
      }
    };

    handleAuthCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 max-w-md w-full mx-4">
        <div className="text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authentication Failed</h2>
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Processing Authentication</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{status}</p>
            </>
          )}
          
          <button
            onClick={() => navigate('/home')}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

// Public Route Component (allows both authenticated and unauthenticated users)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Allow both authenticated and unauthenticated users to access public routes
  return children;
}

// App Content Component that uses Auth Context
function AppContent() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [isResumingQuiz, setIsResumingQuiz] = useState(false);
  const [resumingQuizData, setResumingQuizData] = useState(null);

  
  // Prevent page reload when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Don't do anything when the page becomes visible again
      // This prevents any automatic reloads or state resets
    };

    const handleFocus = () => {
      // Don't do anything when the window gains focus
      // This prevents any automatic reloads or state resets
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Use optimized user questions hook (uses existing sat_master_log_questions)
  const { 
    data: questions, 
    addQuestion, 
    bulkAddQuestions,
    updateQuestion, 
    deleteQuestion, 
    bulkDeleteQuestions,
    deleteAllQuestions,
    loading: questionsLoading
  } = useUserQuestions();
  
  // Use new QuizManager
  const { 
    quizManager, 
    allQuizzesLoading,
    inProgressQuizzes 
  } = useQuizManager();

  // Calendar data (for planned quizzes)
  const { data: calendarEvents, upsertData: upsertCalendarEvents } = useCalendarEvents();

  // Global catalog questions available to all users
  const { data: catalog, loading: catalogLoading } = useGlobalCatalogQuestions();

  // Get question answers for analytics
  const { data: questionAnswers } = useQuestionAnswers();

  // Use the optimized questions data directly
  const questionsArray = Array.isArray(questions) ? questions : [];
  

  


  // No seeding here; Admin will populate catalog globally



  // Handle authentication state changes
  useEffect(() => {
    const savedResumeId = localStorage.getItem('satlog:resumeQuizId');

    // Only attempt auto-resume if we are on the public home page (fresh load) or root
    const atHome = location.pathname === '/home' || location.pathname === '/';

    if (user && savedResumeId && atHome) {
      const idNum = parseInt(savedResumeId, 10);
      const existing = quizManager?.findQuizById(idNum);
      if (existing) {
        setCurrentQuiz(existing.questions);
        setIsResumingQuiz(true);
        setResumingQuizData(existing);
        navigate('/quiz');
        return;
      } else {
        localStorage.removeItem('satlog:resumeQuizId');
      }
    }
  }, [user, quizManager, location.pathname, navigate]);

  // Log data loading status
  useEffect(() => {
    // Data loading tracking for debugging if needed
  }, [user, questionsArray, inProgressQuizzes, questionsLoading, allQuizzesLoading]);

  // Navigation helper with scroll to top
  const navigateWithScroll = (path) => {
    navigate(path);
    // Use a small delay to ensure navigation is complete before scrolling
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 50);
  };

  const handleLogin = async (formData = null) => {
    try {
  
      
      const email = formData?.email || 'demo@thinklytics.com';
      const password = formData?.password || 'demo123';
      
      const { user: loggedInUser, error } = await signIn(email, password);
      
      if (error) {

        throw new Error(error.message || 'Invalid email or password. Please check your credentials and try again.');
      }
      

      navigateWithScroll('/questions');
      return { success: true };
    } catch (error) {

      throw new Error(error.message || 'Invalid email or password. Please check your credentials and try again.');
    }
  };

  const handleSignup = async (formData) => {
    try {
      const email = formData?.email || 'user@thinklytics.com';
      const password = formData?.password || 'user123';
      
      // Combine firstName and lastName into full name
      const firstName = formData?.firstName || '';
      const lastName = formData?.lastName || '';
      const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || 'New User';
      
      const { user: newUser, error } = await signUp(email, password, {
        data: {
          name: fullName,
          display_name: fullName,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          account_type: 'Standard'
        }
      });

      // Persist intended display name for post-confirmation metadata sync
      try {
        localStorage.setItem('satlog:pendingDisplayName', fullName);
      } catch {}
      
      if (error) {

        throw new Error(error.message || 'Signup failed. Please try again.');
      }
      
      
      
      // Check if user was created but needs email confirmation
      if (newUser && !newUser.email_confirmed_at) {

        return { success: true, requiresConfirmation: true };
      }
      
      // For development, auto-confirm and sign in if email is already confirmed
      if (newUser && newUser.email_confirmed_at) {
        await handleLogin({ email, password });
      }
      
      return { success: true };
    } catch (error) {

      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
  
      
      // Clear local state first
      setCurrentQuiz(null);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      
      const { error } = await signOut();
      
      if (error) {

      }
      
      // Navigate to home after logout is complete
      navigateWithScroll('/home');
      

    } catch (error) {

      // Clear local state regardless of error
      setCurrentQuiz(null);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      navigateWithScroll('/home');
    }
  };

  const handleAddQuestion = async (newQuestion) => {
    // Handle both single question and array of questions
    const incoming = Array.isArray(newQuestion) ? newQuestion : [newQuestion];
    
    if (incoming.length === 1) {
      // Single question - use the regular addQuestion function
      try {
        // Auto-detect if question should be hidden
        const isHiddenQuestion = (q) => {
          if (!q.section || !q.domain || !q.questionType) return false;
          const passageTextEmpty = !q.passageText || q.passageText.trim() === '';
          const passageImageEmpty = !q.passageImage;
          const questionTextEmpty = !q.questionText || q.questionText.trim() === '';
          const explanationEmpty = !q.explanation || q.explanation.trim() === '';
          const answerChoicesEmpty = !q.answerChoices || 
            Object.values(q.answerChoices).every(choice => !choice || choice.trim() === '');
          return passageTextEmpty && passageImageEmpty && questionTextEmpty && 
                 explanationEmpty && answerChoicesEmpty;
        };

        const questionToAdd = {
          ...incoming[0],
          hidden: isHiddenQuestion(incoming[0])
        };

        const success = await addQuestion(questionToAdd);
        if (!success) {
          alert('Failed to add question. Please check your connection and try again.');
        }
      } catch (error) {
        console.error('Error adding question:', error);
        alert('Failed to add question. Please check your connection and try again.');
      }
    } else {
      // Multiple questions - use bulk add
      try {
        // Auto-detect if questions should be hidden
        const isHiddenQuestion = (q) => {
          if (!q.section || !q.domain || !q.questionType) return false;
          const passageTextEmpty = !q.passageText || q.passageText.trim() === '';
          const passageImageEmpty = !q.passageImage;
          const questionTextEmpty = !q.questionText || q.questionText.trim() === '';
          const explanationEmpty = !q.explanation || q.explanation.trim() === '';
          const answerChoicesEmpty = !q.answerChoices || 
            Object.values(q.answerChoices).every(choice => !choice || choice.trim() === '');
          return passageTextEmpty && passageImageEmpty && questionTextEmpty && 
                 explanationEmpty && answerChoicesEmpty;
        };

        const questionsToAdd = incoming.map(question => ({
          ...question,
          hidden: isHiddenQuestion(question)
        }));

        const success = await bulkAddQuestions(questionsToAdd);
        if (!success) {
          alert('Failed to add questions. Please check your connection and try again.');
        }
      } catch (error) {
        console.error('Error adding questions:', error);
        alert('Failed to add questions. Please check your connection and try again.');
      }
    }
  };

  const handleUpdateQuestion = async (questionId, updatedQuestion) => {
    try {
      // Auto-detect if question should be hidden
      const isHiddenQuestion = (q) => {
        if (!q.section || !q.domain || !q.questionType) return false;
        const passageTextEmpty = !q.passageText || q.passageText.trim() === '';
        const passageImageEmpty = !q.passageImage;
        const questionTextEmpty = !q.questionText || q.questionText.trim() === '';
        const explanationEmpty = !q.explanation || q.explanation.trim() === '';
        const answerChoicesEmpty = !q.answerChoices || 
          Object.values(q.answerChoices).every(choice => !choice || choice.trim() === '');
        return passageTextEmpty && passageImageEmpty && questionTextEmpty && 
               explanationEmpty && answerChoicesEmpty;
      };

      const updates = {
        ...updatedQuestion,
        hidden: isHiddenQuestion({ ...questionsArray.find(q => q.id === questionId), ...updatedQuestion })
      };

      const success = await updateQuestion(questionId, updates);
      if (!success) {
        alert('Failed to update question. Please check your connection and try again.');
      }
    } catch (error) {
      console.error('Failed to update question:', error);
      alert('Failed to update question. Please check your connection and try again.');
    }
  };

  const { addUndoAction } = useUndo();

  const handleDeleteQuestion = async (questionId) => {
    const questionToDelete = questionsArray.find(q => q.id === questionId);
    if (!questionToDelete) return;
    
    try {
      const success = await deleteQuestion(questionId);
      if (!success) {
        alert('Failed to delete question. Please check your connection and try again.');
        return;
      }
      
      // Add to undo stack
      addUndoAction({
        id: `question-${questionId}-${Date.now()}`,
        type: 'question',
        data: { question: questionToDelete },
        onUndo: async (data) => {
          // Restore the deleted question
          await addQuestion(data.question);
        },
        onConfirm: () => {
          // The deletion is already persisted, nothing to do
        }
      });
    } catch (error) {
      console.error('Failed to delete question:', error);
      alert('Failed to delete question. Please check your connection and try again.');
    }
  };

  const handleBulkDeleteQuestions = async (questionIds) => {
    if (!Array.isArray(questionIds) || questionIds.length === 0) return;
    
    const questionsToDelete = questionsArray.filter(q => questionIds.includes(q.id));
    
    try {
      const success = await bulkDeleteQuestions(questionIds);
      if (!success) {
        alert('Failed to delete questions. Please check your connection and try again.');
        return;
      }
      
      // Add to undo stack
      addUndoAction({
        id: `questions-${questionIds.join('-')}-${Date.now()}`,
        type: 'questions',
        data: { questions: questionsToDelete },
        onUndo: async (data) => {
          // Restore the deleted questions
          for (const question of data.questions) {
            await addQuestion(question);
          }
        },
        onConfirm: () => {
          // The deletion is already persisted, nothing to do
        }
      });
    } catch (error) {
      console.error('Failed to bulk delete questions:', error);
      alert('Failed to delete questions. Please check your connection and try again.');
    }
  };

  const handleDeleteAllQuestions = async () => {
    if (!questionsArray || questionsArray.length === 0) return;
    
    try {
      const success = await deleteAllQuestions();
      if (!success) {
        alert('Failed to delete all questions. Please check your connection and try again.');
        return;
      }
      
      // Add to undo stack
      addUndoAction({
        id: `delete-all-questions-${Date.now()}`,
        type: 'questions',
        data: { questions: questionsArray },
        onUndo: async (data) => {
          // Restore all the deleted questions
          await bulkAddQuestions(data.questions);
        },
        onConfirm: () => {
          // The deletion is already persisted, nothing to do
        }
      });
    } catch (error) {
      console.error('Failed to delete all questions:', error);
      alert('Failed to delete all questions. Please check your connection and try again.');
    }
  };

  const handleStartQuiz = (selectedQuestions) => {
    setCurrentQuiz(selectedQuestions);
    setIsResumingQuiz(false);
    setResumingQuizData(null);
    navigateWithScroll('/quiz');
  };

  const handleStartQuizFromCalendar = async (event) => {
    try {
      if (!event) return;

  

      if (event.status === 'planned') {
        const plannedDate = event.plannedDate || event.metadata?.plannedDate;
        if (plannedDate) {
          const todayStr = new Date().toISOString().split('T')[0];
          const plannedStr = new Date(plannedDate).toISOString().split('T')[0];
          if (todayStr !== plannedStr) {
            alert(`This quiz is scheduled for ${new Date(plannedDate).toLocaleDateString()}. You can only start it on that date.`);
            return;
          }
        }

        const eventQuizNumber = event.quizNumber ?? event.metadata?.quizNumber;
        let plannedRecord = null;
        if (event.quizId) {
          plannedRecord = quizManager?.findQuizById(event.quizId);
        }
        if (!plannedRecord && eventQuizNumber) {
          plannedRecord = quizManager?.findQuizByNumber(eventQuizNumber);
        }

        if (!plannedRecord) {
          await quizManager.refreshQuizzes();
          if (event.quizId) plannedRecord = quizManager.findQuizById(event.quizId);
          if (!plannedRecord && eventQuizNumber) plannedRecord = quizManager.findQuizByNumber(eventQuizNumber);
        }

        const builderTemplate = quizManager.createNewQuiz(event.questions || []);
        const lockedQuizNumber = plannedRecord?.quizNumber || event.metadata?.quizNumber || event.quizNumber || builderTemplate.quizNumber;

        const inProgressQuiz = {
          ...(plannedRecord || builderTemplate),
          ...builderTemplate,
          id: plannedRecord ? plannedRecord.id : builderTemplate.id,
          quizNumber: lockedQuizNumber,
          status: QUIZ_STATUS.IN_PROGRESS,
          startTime: new Date().toISOString(),
          plannedDate: plannedDate || null,
          lastUpdated: new Date().toISOString()
        };

        if (plannedRecord) {
          await quizManager.updateQuiz(plannedRecord.id, inProgressQuiz);
        } else {
          await quizManager.addQuiz(inProgressQuiz);
        }

        const updatedEvents = (calendarEvents || []).map(ev =>
          ev.id === event.id ? { ...ev, status: 'in-progress', quizId: inProgressQuiz.id } : ev
        );
        await upsertCalendarEvents(updatedEvents);

        setCurrentQuiz(inProgressQuiz.questions);
        setIsResumingQuiz(true);
        setResumingQuizData(inProgressQuiz);
        navigateWithScroll('/quiz');
        return;
      }

      if (event.status === 'in-progress') {
        const eventQuizNumber2 = event.quizNumber ?? event.metadata?.quizNumber;
        let existingQuiz = null;

        if (event.quizId) existingQuiz = quizManager.findQuizById(event.quizId);
        if (!existingQuiz && eventQuizNumber2) existingQuiz = quizManager.findQuizByNumber(eventQuizNumber2);

        if (!existingQuiz && event.metadata && event.metadata.questions) {
          existingQuiz = event.metadata;
        }

        if (!existingQuiz) {
          await quizManager.refreshQuizzes();
          if (event.quizId) existingQuiz = quizManager.findQuizById(event.quizId);
          if (!existingQuiz && eventQuizNumber2) existingQuiz = quizManager.findQuizByNumber(eventQuizNumber2);
        }

        if (existingQuiz) {
          setCurrentQuiz(existingQuiz.questions);
          setIsResumingQuiz(true);
          setResumingQuizData(existingQuiz);
          navigateWithScroll('/quiz');
          return;
        }
      }

      
      const adHocQuestions = event.questions || [];
      setCurrentQuiz(adHocQuestions);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      navigateWithScroll('/quiz');
    } catch (err) {
      
    }
  };

  const handleResumeQuiz = (quizData) => {
    setCurrentQuiz(quizData.questions);
    setIsResumingQuiz(true);
    setResumingQuizData(quizData);
    navigateWithScroll('/quiz');
  };

  // Clear quiz state after completion
  const clearQuizState = () => {
    setCurrentQuiz(null);
    setIsResumingQuiz(false);
    setResumingQuizData(null);
    localStorage.removeItem('satlog:resumeQuizId');
  };

  // Navigation helpers
  const handlePageChange = (page) => {
    navigateWithScroll(page);
    clearQuizState();
  };

  const handleLogoClick = () => {

    
    // Clear quiz state
    
    setCurrentQuiz(null);
    setIsResumingQuiz(false);
    setResumingQuizData(null);
    localStorage.removeItem('satlog:resumeQuizId');
    
    
    navigateWithScroll('/home');
    

  };

  // When entering quiz page store resume id, clear on leave/finish
  useEffect(() => {
    if (location.pathname === '/quiz' && resumingQuizData) {
      localStorage.setItem('satlog:resumeQuizId', String(resumingQuizData.id));
    } else if (location.pathname !== '/quiz') {
      localStorage.removeItem('satlog:resumeQuizId');
    }
  }, [location.pathname, resumingQuizData]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
         <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/home" element={
          <PublicRoute>
            <Homepage 
              onGetStarted={() => navigateWithScroll('/signup')} 
              onLogin={() => navigateWithScroll('/login')} 
            />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage 
              onLogin={handleLogin} 
              onSwitchToSignup={() => navigateWithScroll('/signup')}
              onBack={() => navigateWithScroll('/home')} 
            />
          </PublicRoute>
        } />
        
        <Route path="/signup" element={
          <PublicRoute>
            <SignupPage 
              onSignup={handleSignup} 
              onSwitchToLogin={() => navigateWithScroll('/login')}
              onBack={() => navigateWithScroll('/home')} 
            />
          </PublicRoute>
        } />

        {/* Auth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Protected Routes */}
        <Route path="/questions" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="questions" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              {((questionsLoading && (!questionsArray || questionsArray.length === 0)) ||
                (allQuizzesLoading && !inProgressQuizzes)) ? (
                <div className="flex items-center justify-center h-full min-h-0">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading questions...</p>
                  </div>
                </div>
              ) : (
                <QuestionLogger
                  questions={questionsArray || []}
                  loading={questionsLoading}
                  onAddQuestion={handleAddQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                  onDeleteQuestion={handleDeleteQuestion}
                  onBulkDeleteQuestions={handleBulkDeleteQuestions}
                  onDeleteAllQuestions={handleDeleteAllQuestions}
                  enableCopyId={true}
                />
              )}
            </SidebarLayout>
          </ProtectedRoute>
        } />

        <Route path="/selector" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="selector" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              {(((questionsLoading && (!questionsArray || questionsArray.length === 0)) ||
                 (allQuizzesLoading && !inProgressQuizzes) ||
                 (catalogLoading && (!catalog || catalog.length === 0)))) ? (
                <div className="flex items-center justify-center h-full min-h-0">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading questions...</p>
                  </div>
                </div>
              ) : (
                (() => {
                  const wrongLog = Array.isArray(questionsArray) ? questionsArray : [];
                  const catalogList = Array.isArray(catalog) ? catalog : [];
                  // Simply combine both arrays without deduplication
                  const combined = [...wrongLog, ...catalogList];
                  return (
                    <QuestionSelector
                      questions={combined}
                      onStartQuiz={handleStartQuiz}
                      onResumeQuiz={handleResumeQuiz}
                      inProgressQuizzes={inProgressQuizzes || []}
                    />
                  );
                })()
              )}
            </SidebarLayout>
          </ProtectedRoute>
        } />

        <Route path="/quiz" element={
          <ProtectedRoute>
            <div className="h-screen w-full overflow-hidden">
              <QuizPage
                questions={currentQuiz}
                onBack={() => {
                  clearQuizState();
                  navigateWithScroll('/selector');
                }}
                isResuming={isResumingQuiz}
                initialQuizData={resumingQuizData}
              />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/history" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="history" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              {((questionsLoading && (!questionsArray || questionsArray.length === 0)) ||
                (allQuizzesLoading && !inProgressQuizzes)) ? (
                <div className="flex items-center justify-center h-full min-h-0">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading...</p>
                  </div>
                </div>
              ) : (
                <QuizHistory
                  onBack={() => navigateWithScroll('/selector')}
                  onResumeQuiz={handleResumeQuiz}
                />
              )}
            </SidebarLayout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="analytics" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              {(((questionsLoading && (!questionsArray || questionsArray.length === 0)) ||
                 (catalogLoading && (!catalog || catalog.length === 0)))) ? (
                <div className="flex items-center justify-center h-full min-h-0">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Loading...</p>
                  </div>
                </div>
              ) : (
                (() => {
                  const wrongLog = Array.isArray(questionsArray) ? questionsArray : [];
                  const catalogList = Array.isArray(catalog) ? catalog : [];
                  
                  // For analytics, include:
                  // 1. User's wrong log questions
                  // 2. ALL catalog questions that have been attempted in any way (incorrect, correct, or mixed)
                  // The AnalyticsPage component will handle specific filtering for wrong-only sections
                  const catalogQuestionsAttempted = catalogList.filter(catalogQuestion => {
                    if (!questionAnswers || !questionAnswers[catalogQuestion.id]) {
                      return false;
                    }
                    const answers = questionAnswers[catalogQuestion.id];
                    if (!Array.isArray(answers) || answers.length === 0) {
                      return false;
                    }
                    // Include if there is at least one recorded correctness (true or false)
                    return answers.some(answer => answer && (answer.isCorrect === true || answer.isCorrect === false));
                  });
                  
                  // Combine user questions with catalog questions that are attempted
                  const combined = [...wrongLog, ...catalogQuestionsAttempted];
                  return (
                    <AnalyticsPage questions={combined} />
                  );
                })()
              )}
            </SidebarLayout>
          </ProtectedRoute>
        } />

        <Route path="/calendar" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="calendar" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              <CalendarPage onStartQuiz={handleStartQuizFromCalendar} />
            </SidebarLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="profile" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              <Profile onBack={() => navigateWithScroll('/questions')} />
            </SidebarLayout>
          </ProtectedRoute>
        } />

        <Route path="/account" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="account" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              <AccountPage onBack={() => navigateWithScroll('/questions')} />
            </SidebarLayout>
          </ProtectedRoute>
        } />

        {/* Footer/Legal/Company pages */}
        <Route path="/about" element={<AboutPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/careers" element={<CareersPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/contact" element={<ContactPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/terms" element={<TermsPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/help" element={<HelpCenterPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/blog" element={<BlogPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/cookies" element={<CookiePolicyPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/press" element={<PressPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/dashboard" element={<DashboardPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/study-plans" element={<StudyPlansPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/practice-tests" element={<PracticeTestsPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/mobile" element={<MobileAppPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/gdpr" element={<GDPRPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/community" element={<CommunityPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/tutorials" element={<TutorialsPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/api-docs" element={<APIDocsPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/status" element={<StatusPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/features" element={<FeaturesPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/pricing" element={<PricingPage onBack={() => navigateWithScroll('/home')} />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="admin" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              <AdminPage />
            </SidebarLayout>
          </ProtectedRoute>
        } />
        <Route path="/backups" element={
          <ProtectedRoute>
            <SidebarLayout 
              currentPage="backups" 
              onPageChange={handlePageChange} 
              onLogout={handleLogout}
              onAccountClick={() => navigateWithScroll('/account')}
              onProfileClick={() => navigateWithScroll('/profile')}
              onHomeClick={handleLogoClick}
            >
              <BackupPage />
            </SidebarLayout>
          </ProtectedRoute>
        } />
        {/* Placeholder for remaining /coming-soon/:slug */}
        <Route path="/coming-soon/:slug" element={<ComingSoonPage title={null} />} />

        {/* Redirect any unknown routes */}
         <Route path="*" element={<Navigate to={user ? "/selector" : "/home"} replace />} />
      </Routes>
      
      {/* Undo Toast */}
      <UndoToast />
    </>
  );
}



export default App; 