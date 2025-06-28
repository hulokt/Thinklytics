import React, { useState } from 'react';
import { ArrowLeft, Code, Database, Key, BookOpen, Zap, Shield, Download, Play, Copy } from 'lucide-react';

const APIDocsPage = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const apiFeatures = [
    {
      icon: Database,
      title: "Data Export",
      description: "Export your question logs, quiz results, and analytics data in JSON or CSV format."
    },
    {
      icon: Key,
      title: "Authentication",
      description: "Secure API access using OAuth 2.0 and API keys for third-party integrations."
    },
    {
      icon: Zap,
      title: "Real-time Sync",
      description: "Real-time data synchronization for seamless integration with external tools."
    },
    {
      icon: Shield,
      title: "Rate Limiting",
      description: "Built-in rate limiting to ensure fair usage and optimal performance for all users."
    }
  ];

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/questions",
      description: "Retrieve user's question logs",
      parameters: [
        { name: "limit", type: "integer", description: "Number of questions to return (max 100)" },
        { name: "offset", type: "integer", description: "Number of questions to skip" },
        { name: "section", type: "string", description: "Filter by SAT section" }
      ]
    },
    {
      method: "POST",
      path: "/api/v1/questions",
      description: "Create a new question log",
      parameters: [
        { name: "section", type: "string", required: true, description: "SAT section (math, reading, writing)" },
        { name: "domain", type: "string", required: true, description: "Question domain" },
        { name: "question_text", type: "string", required: true, description: "Question content" },
        { name: "user_answer", type: "string", description: "User's answer" },
        { name: "correct_answer", type: "string", description: "Correct answer" }
      ]
    },
    {
      method: "GET",
      path: "/api/v1/analytics",
      description: "Get user analytics and performance data",
      parameters: [
        { name: "timeframe", type: "string", description: "Time period (week, month, year)" },
        { name: "section", type: "string", description: "Filter by SAT section" }
      ]
    },
    {
      method: "GET",
      path: "/api/v1/quizzes",
      description: "Retrieve user's quiz history",
      parameters: [
        { name: "status", type: "string", description: "Filter by quiz status (completed, in_progress)" },
        { name: "limit", type: "integer", description: "Number of quizzes to return" }
      ]
    }
  ];

  const codeExamples = [
    {
      language: "JavaScript",
      title: "Fetch User Questions",
      code: `fetch('https://api.thinklytics.com/v1/questions', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`
    },
    {
      language: "Python",
      title: "Create Question Log",
      code: `import requests

url = "https://api.thinklytics.com/v1/questions"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "section": "math",
    "domain": "algebra",
    "question_text": "Solve for x: 2x + 5 = 13",
    "user_answer": "4",
    "correct_answer": "4"
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`
    },
    {
      language: "cURL",
      title: "Get Analytics",
      code: `curl -X GET "https://api.thinklytics.com/v1/analytics?timeframe=month" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400';
      case 'POST': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'PUT': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400';
      case 'DELETE': return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <Code className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Developer
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> API</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Integrate Thinklytics into your applications with our comprehensive REST API. 
            Access user data, analytics, and create custom integrations.
          </p>
        </div>

        {/* API Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">API Features</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {apiFeatures.map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{feature.title}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {['overview', 'endpoints', 'examples', 'authentication'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Overview</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Base URL</h4>
                  <code className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg text-sm font-mono">
                    https://api.thinklytics.com/v1
                  </code>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Response Format</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    All API responses are returned in JSON format with the following structure:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional message",
  "timestamp": "2024-12-15T10:30:00Z"
}`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Rate Limits</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    API requests are limited to 1000 requests per hour per API key. Rate limit headers are included in all responses.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Endpoints</h3>
              <div className="space-y-6">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg text-sm font-mono">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{endpoint.description}</p>
                    {endpoint.parameters && endpoint.parameters.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">Parameters:</h5>
                        <div className="space-y-2">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <div key={paramIndex} className="flex items-start space-x-3">
                              <code className="bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-sm font-mono">
                                {param.name}
                              </code>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                ({param.type}){param.required && ' - Required'} - {param.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Code Examples</h3>
              <div className="space-y-8">
                {codeExamples.map((example, index) => (
                  <div key={index}>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{example.title}</h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-400 text-sm">{example.language}</span>
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <pre className="text-gray-300 text-sm">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'authentication' && (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Authentication</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">API Keys</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    All API requests require authentication using an API key. Include your API key in the Authorization header:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-sm overflow-x-auto">
{`Authorization: Bearer YOUR_API_KEY`}
                  </pre>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Getting Your API Key</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                    <li>Log in to your Thinklytics account</li>
                    <li>Navigate to Account Settings</li>
                    <li>Go to the API section</li>
                    <li>Generate a new API key</li>
                    <li>Copy and securely store your API key</li>
                  </ol>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security Note</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    Keep your API key secure and never share it publicly. If you suspect your key has been compromised, 
                    regenerate it immediately in your account settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SDKs and Tools */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">SDKs and Tools</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Download className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h4 className="text-lg font-semibold mb-2">Official SDKs</h4>
              <p className="text-sm opacity-90 mb-4">JavaScript, Python, and Node.js SDKs available</p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Download SDKs
              </button>
            </div>
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h4 className="text-lg font-semibold mb-2">Interactive Docs</h4>
              <p className="text-sm opacity-90 mb-4">Test API endpoints directly in your browser</p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Try API
              </button>
            </div>
            <div className="text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-90" />
              <h4 className="text-lg font-semibold mb-2">Postman Collection</h4>
              <p className="text-sm opacity-90 mb-4">Import our Postman collection for easy testing</p>
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Download Collection
              </button>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Need Help?</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Developer Support</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get help with API integration, troubleshooting, and best practices.
              </p>
              <a
                href="mailto:api@thinklytics.com"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                api@thinklytics.com
              </a>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Community</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Join our developer community for discussions, examples, and updates.
              </p>
              <a
                href="#"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Developer Forum →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIDocsPage; 