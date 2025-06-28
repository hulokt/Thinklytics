import React from 'react';
import { ArrowLeft, Shield, Settings, Info, AlertTriangle } from 'lucide-react';

const CookiePolicyPage = ({ onBack }) => {
  const cookieTypes = [
    {
      title: "Essential Cookies",
      icon: Shield,
      description: "These cookies are necessary for the website to function properly and cannot be disabled.",
      examples: [
        "Authentication cookies to keep you logged in",
        "Security cookies to protect against fraud",
        "Session cookies to maintain your preferences"
      ],
      necessary: true
    },
    {
      title: "Analytics Cookies",
      icon: Info,
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      examples: [
        "Google Analytics to track page views",
        "Performance monitoring to improve site speed",
        "User behavior analysis to enhance features"
      ],
      necessary: false
    },
    {
      title: "Functional Cookies",
      icon: Settings,
      description: "These cookies enable enhanced functionality and personalization, such as remembering your preferences.",
      examples: [
        "Language preference settings",
        "Theme and display preferences",
        "Study progress tracking"
      ],
      necessary: false
    },
    {
      title: "Marketing Cookies",
      icon: AlertTriangle,
      description: "These cookies are used to track visitors across websites to display relevant advertisements.",
      examples: [
        "Social media integration cookies",
        "Advertising network cookies",
        "Retargeting and remarketing cookies"
      ],
      necessary: false
    }
  ];

  const cookieDetails = [
    {
      name: "session_id",
      purpose: "Maintains your login session",
      duration: "Session",
      type: "Essential"
    },
    {
      name: "csrf_token",
      purpose: "Protects against cross-site request forgery",
      duration: "Session",
      type: "Essential"
    },
    {
      name: "_ga",
      purpose: "Google Analytics tracking",
      duration: "2 years",
      type: "Analytics"
    },
    {
      name: "_gid",
      purpose: "Google Analytics session tracking",
      duration: "24 hours",
      type: "Analytics"
    },
    {
      name: "theme_preference",
      purpose: "Remembers your dark/light mode preference",
      duration: "1 year",
      type: "Functional"
    },
    {
      name: "study_progress",
      purpose: "Tracks your study session progress",
      duration: "Session",
      type: "Functional"
    }
  ];

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cookie Policy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Cookie
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Policy</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            This policy explains how we use cookies and similar technologies on our website 
            to provide you with the best possible experience.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last updated: December 2024
          </p>
        </div>

        {/* What Are Cookies Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What Are Cookies?</h3>
          <div className="space-y-4 text-gray-600 dark:text-gray-300">
            <p>
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences, 
              analyzing how you use our site, and personalizing content.
            </p>
            <p>
              We use both session cookies (which expire when you close your browser) and persistent cookies 
              (which remain on your device for a set period of time).
            </p>
          </div>
        </div>

        {/* Cookie Types */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Types of Cookies We Use</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {cookieTypes.map((type, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <type.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{type.title}</h4>
                    {type.necessary && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                        Necessary
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{type.description}</p>
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">Examples:</h5>
                  <ul className="space-y-1">
                    {type.examples.map((example, exampleIndex) => (
                      <li key={exampleIndex} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cookie Details Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detailed Cookie Information</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Cookie Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Purpose</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Type</th>
                </tr>
              </thead>
              <tbody>
                {cookieDetails.map((cookie, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 font-mono text-sm text-gray-900 dark:text-white">{cookie.name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{cookie.purpose}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{cookie.duration}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        cookie.type === 'Essential' 
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                          : cookie.type === 'Analytics'
                          ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      }`}>
                        {cookie.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Managing Cookies */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Managing Your Cookie Preferences</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Browser Settings</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>View and delete existing cookies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Block cookies from specific websites</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Set preferences for different types of cookies</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Cookie Consent</h4>
              <p className="text-gray-600 dark:text-gray-300">
                When you first visit our website, you'll see a cookie consent banner that allows you to 
                choose which types of cookies you want to accept. You can change these preferences at any time 
                by clicking the "Cookie Settings" link in our footer.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Third-Party Cookies</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Some cookies are set by third-party services that appear on our pages. We do not control 
                these cookies and they are subject to the third party's privacy policy. You can manage 
                these through your browser settings or by visiting the third party's website.
              </p>
            </div>
          </div>
        </div>

        {/* Impact of Disabling Cookies */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Impact of Disabling Cookies</h3>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>
              While you can disable cookies, please note that doing so may affect the functionality of our website:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>You may need to log in repeatedly</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Some features may not work properly</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Your preferences may not be saved</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>We may not be able to provide personalized content</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Updates and Contact */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Questions About Cookies?</h3>
          <div className="space-y-4">
            <p className="text-lg opacity-90">
              If you have any questions about our use of cookies or this cookie policy, please contact us at{' '}
              <a href="mailto:privacy@thinklytics.com" className="underline hover:no-underline">
                privacy@thinklytics.com
              </a>
            </p>
            <p className="opacity-90">
              We may update this cookie policy from time to time to reflect changes in our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on this page.
            </p>
          </div>
          <button
            onClick={onBack}
            className="mt-6 bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage; 