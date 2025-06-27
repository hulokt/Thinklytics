import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { SidebarLayout } from './components/SidebarLayout';
import Homepage from './components/Homepage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AccountPage from './components/AccountPage';
import Profile from './components/Profile';
import QuestionLogger from './components/QuestionLogger';
import QuestionSelector from './components/QuestionSelector';
import QuizPage from './components/QuizPage';
import QuizHistory from './components/QuizHistory';
import AnalyticsPage from './components/AnalyticsPage';
import CalendarPage from './components/CalendarPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { useQuestions, useCalendarEvents } from './hooks/useUserData';
import { useQuizManager, QUIZ_STATUS } from './components/QuizManager';
import { supabase } from './lib/supabaseClient';

// Main App Component wrapped with Auth Provider and Dark Mode Provider
function App() {
  const isProd = import.meta.env.PROD;
  const basename = isProd ? "/SatLog" : "/";
  
  console.log('🏠 App component - Environment:', {
    isProd,
    basename,
    env: import.meta.env
  });
  
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router basename={basename}>
          <AppContent />
        </Router>
      </AuthProvider>
    </DarkModeProvider>
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
            console.warn('Auth exchange returned error:', exchangeError.message);

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
        console.error('Auth callback exception:', err);
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
  
  // Use Supabase data hooks
  const { 
    data: questionsData, 
    upsertData: upsertQuestions, 
    loading: questionsLoading 
  } = useQuestions();
  
  // Use new QuizManager
  const { 
    quizManager, 
    allQuizzesLoading,
    inProgressQuizzes 
  } = useQuizManager();

  // Calendar data (for planned quizzes)
  const { data: calendarEvents, upsertData: upsertCalendarEvents } = useCalendarEvents();

  // Ensure questions is always an array
  const questions = Array.isArray(questionsData) ? questionsData : [];

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
    if (user && questions) {
      console.log('📊 Data loaded:', {
        questions: questions?.length || 0,
        inProgress: inProgressQuizzes?.length || 0,
        questionsLoading,
        allQuizzesLoading
      });
    }
  }, [user, questions, inProgressQuizzes, questionsLoading, allQuizzesLoading]);

  const handleLogin = async (formData = null) => {
    try {
      console.log('🔐 Attempting login with:', formData);
      
      const email = formData?.email || 'demo@redomind.com';
      const password = formData?.password || 'demo123';
      
      const { user: loggedInUser, error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ Login failed:', error);
        throw new Error(error.message || 'Invalid email or password. Please check your credentials and try again.');
      }
      
      console.log('✅ Login successful:', loggedInUser?.email);
      navigate('/questions');
      return { success: true };
    } catch (error) {
      console.error('❌ Login exception:', error);
      throw new Error(error.message || 'Invalid email or password. Please check your credentials and try again.');
    }
  };

  const handleSignup = async (formData) => {
    try {
      console.log('📝 Attempting signup with:', formData);
      
      const email = formData?.email || 'user@redomind.com';
      const password = formData?.password || 'user123';
      const name = formData?.name || 'New User';
      
      const { user: newUser, error } = await signUp(email, password, {
        data: {
          name: name,
          account_type: 'Standard'
        }
      });
      
      if (error) {
        console.error('❌ Signup failed:', error);
        throw new Error(error.message || 'Signup failed. Please try again.');
      }
      
      console.log('✅ Signup successful:', newUser?.email);
      
      // Check if user was created but needs email confirmation
      if (newUser && !newUser.email_confirmed_at) {
        console.log('📧 Email confirmation required for:', newUser.email);
        return { success: true, requiresConfirmation: true };
      }
      
      // For development, auto-confirm and sign in if email is already confirmed
      if (newUser && newUser.email_confirmed_at) {
        await handleLogin({ email, password });
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Signup exception:', error);
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      // Clear local state first
      setCurrentQuiz(null);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      
      const { error } = await signOut();
      
      if (error) {
        console.error('❌ Logout failed:', error);
      }
      
      // Navigate to home after logout is complete
      navigate('/home');
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout exception:', error);
      // Clear local state regardless of error
      setCurrentQuiz(null);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      navigate('/home');
    }
  };

  const handleAddQuestion = async (newQuestion) => {
    if (!questions) return;
    
    const newQuestionsArray = Array.isArray(newQuestion) ? newQuestion : [newQuestion];
    const questionsWithIds = newQuestionsArray.map(q => ({ ...q, id: Date.now() + Math.random() }));
    const updatedQuestions = [...questions, ...questionsWithIds];
    await upsertQuestions(updatedQuestions);
  };

  const handleUpdateQuestion = async (questionId, updatedQuestion) => {
    if (!questions) return;
    
    const updatedQuestions = questions.map(q => q.id === questionId ? { ...q, ...updatedQuestion } : q);
    await upsertQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!questions) return;
    
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    await upsertQuestions(updatedQuestions);
  };

  const handleStartQuiz = (selectedQuestions) => {
    setCurrentQuiz(selectedQuestions);
    setIsResumingQuiz(false);
    setResumingQuizData(null);
    navigate('/quiz');
  };

  const handleStartQuizFromCalendar = async (event) => {
    try {
      if (!event) return;

      console.log('📅 Calendar start/resume triggered:', event);

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
        navigate('/quiz');
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
          navigate('/quiz');
          return;
        }
      }

      console.warn('⚠️ Fallback path triggered for calendar start – treating as ad-hoc quiz');
      const adHocQuestions = event.questions || [];
      setCurrentQuiz(adHocQuestions);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      navigate('/quiz');
    } catch (err) {
      console.error('❌ Failed to start calendar quiz:', err);
    }
  };

  const handleResumeQuiz = (quizData) => {
    setCurrentQuiz(quizData.questions);
    setIsResumingQuiz(true);
    setResumingQuizData(quizData);
    navigate('/quiz');
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
    navigate(page);
    clearQuizState();
  };

  const handleLogoClick = () => {
    console.log('🏠 handleLogoClick called!');
    console.log('🏠 Current user:', user);
    console.log('🏠 Current location:', location.pathname);
    
    // Clear quiz state
    console.log('🏠 Clearing quiz state...');
    setCurrentQuiz(null);
    setIsResumingQuiz(false);
    setResumingQuizData(null);
    localStorage.removeItem('satlog:resumeQuizId');
    
    console.log('🏠 Navigating to /home (Homepage)');
    navigate('/home');
    
    console.log('🏠 handleLogoClick completed');
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
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      <Route path="/home" element={
        <PublicRoute>
          <Homepage 
            onGetStarted={() => navigate('/signup')} 
            onLogin={() => navigate('/login')} 
          />
        </PublicRoute>
      } />
      
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToSignup={() => navigate('/signup')}
            onBack={() => navigate('/home')} 
          />
        </PublicRoute>
      } />
      
      <Route path="/signup" element={
        <PublicRoute>
          <SignupPage 
            onSignup={handleSignup} 
            onSwitchToLogin={() => navigate('/login')}
            onBack={() => navigate('/home')} 
          />
        </PublicRoute>
      } />

      {/* Auth Callback Route */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route path="/questions" element={
        <ProtectedRoute>
          <SidebarLayout 
            currentPage="questions" 
            onPageChange={handlePageChange} 
            onLogout={handleLogout}
            onAccountClick={() => navigate('/account')}
            onProfileClick={() => navigate('/profile')}
            onHomeClick={handleLogoClick}
          >
            {(questionsLoading || allQuizzesLoading) ? (
              <div className="flex items-center justify-center h-full min-h-0">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading questions...</p>
                </div>
              </div>
            ) : (
              <QuestionLogger
                questions={questions || []}
                onAddQuestion={handleAddQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
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
            onAccountClick={() => navigate('/account')}
            onProfileClick={() => navigate('/profile')}
            onHomeClick={handleLogoClick}
          >
            {(questionsLoading || allQuizzesLoading) ? (
              <div className="flex items-center justify-center h-full min-h-0">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading questions...</p>
                </div>
              </div>
            ) : (
              <QuestionSelector
                questions={questions || []}
                onStartQuiz={handleStartQuiz}
                onResumeQuiz={handleResumeQuiz}
                inProgressQuizzes={inProgressQuizzes || []}
              />
            )}
          </SidebarLayout>
        </ProtectedRoute>
      } />

      <Route path="/quiz" element={
        <ProtectedRoute>
          <SidebarLayout
            currentPage="quiz"
            onPageChange={handlePageChange}
            onLogout={handleLogout}
            onAccountClick={() => navigate('/account')}
            onProfileClick={() => navigate('/profile')}
            onHomeClick={handleLogoClick}
          >
            <QuizPage
              questions={currentQuiz}
              onBack={() => {
                clearQuizState();
                navigate('/selector');
              }}
              isResuming={isResumingQuiz}
              initialQuizData={resumingQuizData}
            />
          </SidebarLayout>
        </ProtectedRoute>
      } />

      <Route path="/history" element={
        <ProtectedRoute>
          <SidebarLayout 
            currentPage="history" 
            onPageChange={handlePageChange} 
            onLogout={handleLogout}
            onAccountClick={() => navigate('/account')}
            onProfileClick={() => navigate('/profile')}
            onHomeClick={handleLogoClick}
          >
            {(questionsLoading || allQuizzesLoading) ? (
              <div className="flex items-center justify-center h-full min-h-0">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              <QuizHistory
                onBack={() => navigate('/selector')}
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
            onAccountClick={() => navigate('/account')}
            onProfileClick={() => navigate('/profile')}
            onHomeClick={handleLogoClick}
          >
            {questionsLoading ? (
              <div className="flex items-center justify-center h-full min-h-0">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading...</p>
                </div>
              </div>
            ) : (
              <AnalyticsPage questions={questions || []} />
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
            onAccountClick={() => navigate('/account')}
            onProfileClick={() => navigate('/profile')}
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
            onAccountClick={() => navigate('/account')}
            onProfileClick={() => navigate('/profile')}
            onHomeClick={handleLogoClick}
          >
            <Profile onBack={() => navigate('/questions')} />
          </SidebarLayout>
        </ProtectedRoute>
      } />

      <Route path="/account" element={
        <ProtectedRoute>
          <AccountPage onBack={() => navigate('/questions')} />
        </ProtectedRoute>
      } />

      {/* Redirect any unknown routes */}
      <Route path="*" element={<Navigate to={user ? "/questions" : "/home"} replace />} />
    </Routes>
  );
}

export default App; 