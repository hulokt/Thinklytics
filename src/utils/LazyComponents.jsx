import React, { Suspense, lazy } from 'react';

// Loading fallback component
const LoadingFallback = ({ text = "Loading..." }) => (
  <div className="flex items-center justify-center h-64 homepage-bg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="homepage-text-secondary">{text}</p>
    </div>
  </div>
);

// Error boundary for lazy components
class LazyComponentError extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {

  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-64 homepage-bg">
          <div className="text-center">
            <p className="homepage-text-primary mb-2">Failed to load component</p>
            <button 
              onClick={() => window.location.reload()} 
              className="homepage-cta-primary px-4 py-2 rounded text-white"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy-loaded components with proper chunking
export const LazyAnalyticsPage = lazy(() => 
  import('../components/AnalyticsPage').then(module => ({ 
    default: module.default 
  }))
);

export const LazyQuestionLogger = lazy(() => 
  import('../components/QuestionLogger').then(module => ({ 
    default: module.default 
  }))
);

export const LazyQuizPage = lazy(() => 
  import('../components/QuizPage').then(module => ({ 
    default: module.default 
  }))
);

export const LazyCalendarPage = lazy(() => 
  import('../components/CalendarPage').then(module => ({ 
    default: module.default 
  }))
);

// HOC for wrapping lazy components
export const withLazyLoading = (LazyComponent, loadingText) => (props) => (
  <LazyComponentError>
    <Suspense fallback={<LoadingFallback text={loadingText} />}>
      <LazyComponent {...props} />
    </Suspense>
  </LazyComponentError>
);

// Pre-wrapped components ready to use
export const AnalyticsPage = withLazyLoading(LazyAnalyticsPage, "Loading analytics...");
export const QuestionLogger = withLazyLoading(LazyQuestionLogger, "Loading question editor...");
export const QuizPage = withLazyLoading(LazyQuizPage, "Loading quiz...");
export const CalendarPage = withLazyLoading(LazyCalendarPage, "Loading calendar..."); 