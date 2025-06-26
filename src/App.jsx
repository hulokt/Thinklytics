import React, { useState, useEffect } from 'react';
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

// Main App Component wrapped with Auth Provider and Dark Mode Provider
function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}

// App Content Component that uses Auth Context
function AppContent() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState('loading');
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
    if (authLoading) {
      setCurrentPage('loading');
      return;
    }

    // Restore last page if exists (only after auth resolved)
    const savedPage = localStorage.getItem('satlog:lastPage');
    const savedResumeId = localStorage.getItem('satlog:resumeQuizId');

    if (user && savedResumeId) {
      // Try resume quiz automatically
      const idNum = parseInt(savedResumeId, 10);
      const existing = quizManager?.findQuizById(idNum);
      if (existing) {
        setCurrentQuiz(existing.questions);
        setIsResumingQuiz(true);
        setResumingQuizData(existing);
        setCurrentPage('quiz');
        return;
      } else {
        // Clear stale resume id
        localStorage.removeItem('satlog:resumeQuizId');
      }
    }

    if (user && savedPage && savedPage !== 'quiz') {
      setCurrentPage(savedPage);
      return;
    }

    if (user) {
      console.log('✅ User authenticated:', user.email);
      // If we just authenticated and are on a public page, move to question-logger; otherwise keep current
      setCurrentPage(prev => {
        if (['homepage', 'login', 'signup', 'loading'].includes(prev)) {
          return 'question-logger';
        }
        return prev;
      });
    } else {
      console.log('❌ User not authenticated, checking current page...');
      // If user momentarily null, avoid kicking the user off an active private page (like quiz)
      setCurrentPage(prevPage => {
        if (['login', 'signup', 'homepage'].includes(prevPage)) {
          return prevPage; // stay on allowed public pages
        }
        if (prevPage === 'loading') {
          return 'homepage';
        }
        // Keep current page unchanged to wait for auth recovery
        return prevPage;
      });
    }
  }, [user, authLoading]);

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
        // Throw error to be handled by the form, don't redirect
        throw new Error(error.message || 'Invalid email or password. Please check your credentials and try again.');
      }
      
      console.log('✅ Login successful:', loggedInUser?.email);
      return { success: true };
    } catch (error) {
      console.error('❌ Login exception:', error);
      // Throw error to be handled by the form, don't redirect
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
        // Throw error to be handled by the form, don't redirect
        throw new Error(error.message || 'Signup failed. Please try again.');
      }
      
      console.log('✅ Signup successful:', newUser?.email);
      
      // For development, auto-confirm and sign in
      if (newUser && !error) {
        await handleLogin({ email, password });
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Signup exception:', error);
      // Throw error to be handled by the form, don't redirect
      throw new Error(error.message || 'Signup failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      const { error } = await signOut();
      
      if (error) {
        console.error('❌ Logout failed:', error);
        // Don't show alert for logout errors, just continue
      }
      
      // Clear local state regardless of error
      setCurrentPage('homepage');
      setCurrentQuiz(null);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout exception:', error);
      // Still clear state even if logout had an error
      setCurrentPage('homepage');
      setCurrentQuiz(null);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
    }
  };

  const handleGetStarted = () => {
    if (user) {
      setCurrentPage('question-logger');
    } else {
      setCurrentPage('signup');
    }
  };

  const handleGoToLogin = () => {
    if (user) {
      setCurrentPage('question-logger');
    } else {
      setCurrentPage('login');
    }
  };

  const handleBackToHome = () => {
    if (user) {
      setCurrentPage('question-logger');
    } else {
      setCurrentPage('homepage');
    }
  };

  const handleLogoClick = () => {
    console.log('🔗 Logo clicked! Current user:', user?.email || 'No user');
    console.log('🔗 Current page:', currentPage);
    
    if (user) {
      console.log('🔗 User is logged in, navigating to question-logger');
      setCurrentPage('question-logger');
    } else {
      console.log('🔗 No user, navigating to homepage');
      setCurrentPage('homepage');
    }
  };

  const handleSwitchToLogin = () => setCurrentPage('login');
  const handleSwitchToSignup = () => setCurrentPage('signup');
  const handleAccountClick = () => setCurrentPage('account');
  const handleProfileClick = () => setCurrentPage('profile');
  const handleBackFromAccount = () => setCurrentPage('question-logger');
  const handleBackFromProfile = () => setCurrentPage('question-logger');

  const handleAddQuestion = async (newQuestion) => {
    if (!questions) return;
    
    // Allow newQuestion to be either a single question object or an array of questions
    const newQuestionsArray = Array.isArray(newQuestion) ? newQuestion : [newQuestion];

    // Map each question to ensure it has a unique id
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
    setCurrentPage('quiz');
  };

  const handleStartQuizFromCalendar = async (event) => {
    try {
      if (!event) return;

      console.log('📅 Calendar start/resume triggered:', event);

      // --------------------------------------------------
      // 1) PLANNED QUIZ → Start new in-progress quiz with SAME quizNumber
      // --------------------------------------------------
      if (event.status === 'planned') {
        // Allow start only on the scheduled date (if provided)
        const plannedDate = event.plannedDate || event.metadata?.plannedDate;
        if (plannedDate) {
          const todayStr = new Date().toISOString().split('T')[0];
          const plannedStr = new Date(plannedDate).toISOString().split('T')[0];
          if (todayStr !== plannedStr) {
            alert(`This quiz is scheduled for ${new Date(plannedDate).toLocaleDateString()}. You can only start it on that date.`);
            return;
          }
        }

        // Try to locate the existing planned-quiz record first (by id or quizNumber)
        const eventQuizNumber = event.quizNumber ?? event.metadata?.quizNumber;
        let plannedRecord = null;
        if (event.quizId) {
          plannedRecord = quizManager?.findQuizById(event.quizId);
        }
        if (!plannedRecord && eventQuizNumber) {
          plannedRecord = quizManager?.findQuizByNumber(eventQuizNumber);
        }

        // If still not found, refresh quizzes once and retry
        if (!plannedRecord) {
          await quizManager.refreshQuizzes();
          if (event.quizId) plannedRecord = quizManager.findQuizById(event.quizId);
          if (!plannedRecord && eventQuizNumber) plannedRecord = quizManager.findQuizByNumber(eventQuizNumber);
        }

        const builderTemplate = quizManager.createNewQuiz(event.questions || []);

        // Determine quizNumber we must keep
        const lockedQuizNumber = plannedRecord?.quizNumber || event.metadata?.quizNumber || event.quizNumber || builderTemplate.quizNumber;

        const inProgressQuiz = {
          ...(plannedRecord || builderTemplate), // start with existing planned or template
          ...builderTemplate,                   // ensure we get all fresh builder fields
          id: plannedRecord ? plannedRecord.id : builderTemplate.id, // keep same id if we had one
          quizNumber: lockedQuizNumber,         // override numbering
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

        // Update the calendar event to reflect its new in-progress status (do NOT delete)
        const updatedEvents = (calendarEvents || []).map(ev =>
          ev.id === event.id ? { ...ev, status: 'in-progress' } : ev
        );
        await upsertCalendarEvents(updatedEvents);

        // Launch QuizPage (treat as resuming so it uses the quiz record we just saved)
        setCurrentQuiz(inProgressQuiz.questions);
        setIsResumingQuiz(true);
        setResumingQuizData(inProgressQuiz);
        setCurrentPage('quiz');
        return;
      }

      // --------------------------------------------------
      // 2) IN-PROGRESS QUIZ → Resume existing quiz
      // --------------------------------------------------
      if (event.status === 'in-progress') {
        const eventQuizNumber2 = event.quizNumber ?? event.metadata?.quizNumber;
        let existingQuiz = null;

        if (event.quizId) existingQuiz = quizManager.findQuizById(event.quizId);
        if (!existingQuiz && eventQuizNumber2) existingQuiz = quizManager.findQuizByNumber(eventQuizNumber2);

        if (!existingQuiz && event.metadata && event.metadata.questions) {
          existingQuiz = event.metadata; // Fallback to quiz data embedded in calendar item
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
          setCurrentPage('quiz');
          return;
        }
      }

      // --------------------------------------------------
      // 3) FALLBACK – behave like quick ad-hoc start from builder
      // --------------------------------------------------
      console.warn('⚠️ Fallback path triggered for calendar start – treating as ad-hoc quiz');
      const adHocQuestions = event.questions || [];
      setCurrentQuiz(adHocQuestions);
      setIsResumingQuiz(false);
      setResumingQuizData(null);
      setCurrentPage('quiz');
    } catch (err) {
      console.error('❌ Failed to start calendar quiz:', err);
    }
  };

  const handleResumeQuiz = (quizData) => {
    setCurrentQuiz(quizData.questions);
    setIsResumingQuiz(true);
    setResumingQuizData(quizData);
    setCurrentPage('quiz');
  };

  const handleQuizBack = () => {
    setCurrentPage('question-selector');
    setCurrentQuiz(null);
    setIsResumingQuiz(false);
    setResumingQuizData(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setCurrentQuiz(null);
    setIsResumingQuiz(false);
    setResumingQuizData(null);
  };

  // Persist current page on change
  useEffect(() => {
    if (currentPage && currentPage !== 'loading') {
      localStorage.setItem('satlog:lastPage', currentPage);
    }
  }, [currentPage]);

  // When entering quiz page store resume id, clear on leave/finish
  useEffect(() => {
    if (currentPage === 'quiz' && resumingQuizData) {
      localStorage.setItem('satlog:resumeQuizId', String(resumingQuizData.id));
    } else if (currentPage !== 'quiz') {
      localStorage.removeItem('satlog:resumeQuizId');
    }
  }, [currentPage, resumingQuizData]);

  // Loading screen
  if (currentPage === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Pre-login pages
  if (!user) {
    switch (currentPage) {
      case 'homepage':
        return <Homepage onGetStarted={handleGetStarted} onLogin={handleGoToLogin} />;
      case 'login':
        return (
          <LoginPage 
            onLogin={handleLogin} 
            onSwitchToSignup={handleSwitchToSignup}
            onBack={handleBackToHome} 
          />
        );
      case 'signup':
        return (
          <SignupPage 
            onSignup={handleSignup} 
            onSwitchToLogin={handleSwitchToLogin}
            onBack={handleBackToHome} 
          />
        );
      default:
        return <Homepage onGetStarted={handleGetStarted} onLogin={handleGoToLogin} />;
    }
  }

  // Account page (outside sidebar)
  if (currentPage === 'account') {
    return <AccountPage onBack={handleBackFromAccount} />;
  }

  // Quiz page (full screen)
  if (currentPage === 'quiz') {
    return (
      <SidebarLayout 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        onLogout={handleLogout}
        onAccountClick={handleAccountClick}
        onProfileClick={handleProfileClick}
        onHomeClick={handleLogoClick}
      >
        <div className="h-screen overflow-hidden">
          <QuizPage
            questions={currentQuiz}
            onBack={handleQuizBack}
            isResuming={isResumingQuiz}
            initialQuizData={resumingQuizData}
          />
        </div>
      </SidebarLayout>
    );
  }

  // Main app pages
  const renderPageContent = () => {
    switch (currentPage) {
      case 'question-logger':
        return (
          <QuestionLogger
            questions={questions || []}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        );
      case 'question-selector':
        return (
          <QuestionSelector
            questions={questions || []}
            onStartQuiz={handleStartQuiz}
            onResumeQuiz={handleResumeQuiz}
            inProgressQuizzes={inProgressQuizzes || []}
          />
        );
      case 'quiz-history':
        return (
          <QuizHistory
            onBack={() => handlePageChange('question-selector')}
            onResumeQuiz={handleResumeQuiz}
          />
        );
      case 'analytics':
        return <AnalyticsPage questions={questions || []} />;
      case 'profile':
        return <Profile onBack={() => handlePageChange('question-logger')} />;
      case 'calendar':
        return <CalendarPage onStartQuiz={handleStartQuizFromCalendar} />;
      default:
        return (
          <QuestionLogger
            questions={questions || []}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      <SidebarLayout 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        onLogout={handleLogout}
        onAccountClick={handleAccountClick}
        onProfileClick={handleProfileClick}
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
          <div className="h-full min-h-0 overflow-hidden">
            {renderPageContent()}
          </div>
        )}
      </SidebarLayout>
    </div>
  );
}

export default App; 