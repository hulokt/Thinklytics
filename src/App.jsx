import React, { useState, useEffect } from 'react';
import { SidebarLayout } from './components/SidebarLayout';
import Homepage from './components/Homepage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AccountPage from './components/AccountPage';
import QuestionLogger from './components/QuestionLogger';
import QuestionSelector from './components/QuestionSelector';
import QuizPage from './components/QuizPage';
import QuizHistory from './components/QuizHistory';
import AnalyticsPage from './components/AnalyticsPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { useQuestions, useInProgressQuizzes } from './hooks/useUserData';

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
  
  const { 
    data: inProgressQuizzes, 
    upsertData: upsertInProgressQuizzes, 
    loading: inProgressLoading 
  } = useInProgressQuizzes();

  // Ensure questions is always an array
  const questions = Array.isArray(questionsData) ? questionsData : [];

  // Handle authentication state changes
  useEffect(() => {
    if (authLoading) {
      setCurrentPage('loading');
      return;
    }

    if (user) {
      console.log('✅ User authenticated:', user.email);
      setCurrentPage('question-logger');
    } else {
      console.log('❌ User not authenticated, checking current page...');
      // Use a function to get the current page state to ensure we have the latest value
      setCurrentPage(prevPage => {
        console.log('🔍 Current page state:', prevPage);
        // Only redirect to homepage if we're not already on login/signup pages
        // This prevents redirecting away from login page when login fails
        if (!['login', 'signup'].includes(prevPage)) {
          console.log('🔄 Redirecting to homepage from:', prevPage);
          return 'homepage';
        } else {
          console.log('🚫 Staying on current page:', prevPage);
          return prevPage; // Stay on current page
        }
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
        inProgressLoading
      });
    }
  }, [user, questions, inProgressQuizzes, questionsLoading, inProgressLoading]);

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
  const handleBackFromAccount = () => setCurrentPage('question-logger');

  const handleAddQuestion = async (newQuestion) => {
    if (!questions) return;
    
    const questionWithId = { ...newQuestion, id: Date.now() };
    const updatedQuestions = [...questions, questionWithId];
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
        onHomeClick={handleLogoClick}
      >
        {(questionsLoading || inProgressLoading) ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading questions...</p>
            </div>
          </div>
        ) : (
          renderPageContent()
        )}
      </SidebarLayout>
    </div>
  );
}

export default App; 