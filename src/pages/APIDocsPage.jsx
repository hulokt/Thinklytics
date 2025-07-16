import React, { useState } from 'react';
import { ArrowLeft, Code, Book, Zap, Shield, Copy, ExternalLink } from 'lucide-react';

const APIDocsPage = ({ onBack }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('auth');

  const endpoints = {
    auth: {
      title: 'Authentication',
      description: 'Authenticate users and manage sessions',
      methods: [
        {
          method: 'POST',
          path: '/api/auth/login',
          description: 'Login user with email and password',
          params: ['email', 'password'],
          response: { token: 'jwt_token', user: { id: 1, email: 'user@example.com' } }
        },
        {
          method: 'POST',
          path: '/api/auth/register',
          description: 'Register new user account',
          params: ['name', 'email', 'password'],
          response: { user: { id: 2, name: 'John Doe', email: 'john@example.com' } }
        },
        {
          method: 'POST',
          path: '/api/auth/logout',
          description: 'Logout current user',
          params: [],
          response: { message: 'Logged out successfully' }
        }
      ]
    },
    questions: {
      title: 'Questions',
      description: 'Manage SAT questions and answers',
      methods: [
        {
          method: 'GET',
          path: '/api/questions',
          description: 'Get all questions for authenticated user',
          params: [],
          response: { questions: [{ id: 1, question: 'Sample question', answer: 'A' }] }
        },
        {
          method: 'POST',
          path: '/api/questions',
          description: 'Create new question',
          params: ['question', 'options', 'correct_answer', 'section'],
          response: { question: { id: 2, question: 'New question', answer: 'B' } }
        },
        {
          method: 'PUT',
          path: '/api/questions/:id',
          description: 'Update existing question',
          params: ['question', 'options', 'correct_answer'],
          response: { question: { id: 1, question: 'Updated question', answer: 'C' } }
        },
        {
          method: 'DELETE',
          path: '/api/questions/:id',
          description: 'Delete question',
          params: [],
          response: { message: 'Question deleted successfully' }
        }
      ]
    },
    analytics: {
      title: 'Analytics',
      description: 'Access performance analytics and insights',
      methods: [
        {
          method: 'GET',
          path: '/api/analytics/performance',
          description: 'Get user performance statistics',
          params: [],
          response: { accuracy: 85, total_questions: 250, improvement: 15 }
        },
        {
          method: 'GET',
          path: '/api/analytics/progress',
          description: 'Get learning progress over time',
          params: ['start_date', 'end_date'],
          response: { progress: [{ date: '2024-01-01', score: 1200 }] }
        }
      ]
    }
  };

  const features = [
    {
      icon: Code,
      title: 'RESTful API',
      description: 'Clean, intuitive REST endpoints with JSON responses'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'JWT-based authentication with role-based access control'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'WebSocket connections for live data synchronization'
    },
    {
      icon: Book,
      title: 'Comprehensive Docs',
      description: 'Detailed documentation with examples and use cases'
    }
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'text-green-600 bg-green-50';
      case 'POST': return 'text-blue-600 bg-blue-50';
      case 'PUT': return 'text-yellow-600 bg-yellow-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen homepage-bg transition-colors duration-300">
      {/* Header */}
      <div className="homepage-card shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg homepage-card hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 homepage-text-primary" />
            </button>
            <h1 className="text-3xl font-bold homepage-text-primary">API Documentation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Powerful
            <span className="homepage-gradient-text"> API</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Integrate Thinklytics into your applications with our comprehensive REST API. 
            Access user data, questions, analytics, and more with simple HTTP requests.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="text-center homepage-card p-6 rounded-xl shadow-lg homepage-hover-glow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl homepage-feature-icon mb-4">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold homepage-text-primary mb-2">{feature.title}</h3>
              <p className="homepage-text-secondary text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="homepage-card rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold homepage-text-primary mb-4">Endpoints</h3>
              <nav className="space-y-2">
                {Object.entries(endpoints).map(([key, endpoint]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedEndpoint(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedEndpoint === key 
                        ? 'homepage-cta-primary text-white' 
                        : 'homepage-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {endpoint.title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="homepage-card rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold homepage-text-primary mb-4">
                  {endpoints[selectedEndpoint].title}
                </h2>
                <p className="text-lg homepage-text-secondary">
                  {endpoints[selectedEndpoint].description}
                </p>
              </div>

              {/* API Methods */}
              <div className="space-y-8">
                {endpoints[selectedEndpoint].methods.map((method, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(method.method)}`}>
                        {method.method}
                      </span>
                      <code className="text-sm homepage-text-primary font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {method.path}
                      </code>
                    </div>
                    
                    <p className="homepage-text-secondary mb-4">{method.description}</p>
                    
                    {method.params.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold homepage-text-primary mb-2">Parameters:</h4>
                        <ul className="space-y-1">
                          {method.params.map((param, i) => (
                            <li key={i} className="text-sm homepage-text-secondary">
                              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                                {param}
                              </code>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-semibold homepage-text-primary mb-2">Response:</h4>
                      <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm overflow-x-auto">
                        <code className="homepage-text-primary">
                          {JSON.stringify(method.response, null, 2)}
                        </code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Section */}
        <div className="mt-16 homepage-card rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Getting Started</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-4">1. Authentication</h4>
              <p className="homepage-text-secondary mb-4">
                All API requests require authentication. Include your API key in the Authorization header:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm">
                <code className="homepage-text-primary">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </pre>
            </div>
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-4">2. Base URL</h4>
              <p className="homepage-text-secondary mb-4">
                All API requests should be made to our base URL:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-sm">
                <code className="homepage-text-primary">
                  https://api.thinklytics.com/v1
                </code>
              </pre>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 blue-gradient-bg rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Start Building?</h3>
          <p className="text-lg mb-6 opacity-90">
            Get your API key and start integrating Thinklytics into your applications today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[var(--brand-60)] hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <span>Get API Key</span>
              <ExternalLink className="w-4 h-4" />
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
              <span>View Examples</span>
              <Code className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocsPage; 