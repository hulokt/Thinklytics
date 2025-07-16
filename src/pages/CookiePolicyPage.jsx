import React from 'react';
import { ArrowLeft, Cookie, Shield, Settings, Eye } from 'lucide-react';

const CookiePolicyPage = ({ onBack }) => {
  const cookieTypes = [
    {
      icon: Shield,
      title: 'Essential Cookies',
      description: 'Required for the website to function properly and cannot be disabled.',
      examples: ['Authentication', 'Security', 'Form submissions'],
      required: true
    },
    {
      icon: Eye,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      examples: ['Google Analytics', 'Performance metrics', 'Usage statistics'],
      required: false
    },
    {
      icon: Settings,
      title: 'Functional Cookies',
      description: 'Remember your preferences and settings for a better experience.',
      examples: ['Language preferences', 'Theme settings', 'Saved preferences'],
      required: false
    },
    {
      icon: Cookie,
      title: 'Marketing Cookies',
      description: 'Used to track visitors across websites to display relevant ads.',
      examples: ['Advertising networks', 'Social media tracking', 'Remarketing'],
      required: false
    }
  ];

  const lastUpdated = 'December 15, 2024';

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
            <h1 className="text-3xl font-bold homepage-text-primary">Cookie Policy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl homepage-feature-icon mb-6">
            <Cookie className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold homepage-text-primary mb-4">
            Cookie Policy
          </h2>
          <p className="text-lg homepage-text-secondary max-w-2xl mx-auto">
            Learn about how we use cookies and similar technologies to enhance your experience on Thinklytics.
          </p>
          <p className="text-sm homepage-text-secondary mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Introduction */}
        <div className="homepage-card rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-4">What Are Cookies?</h3>
          <p className="homepage-text-secondary mb-4">
            Cookies are small text files that are stored on your device when you visit a website. They help websites 
            remember information about your visit, which can make your next visit easier and the site more useful to you.
          </p>
          <p className="homepage-text-secondary">
            We use cookies and similar technologies to improve your experience on our platform, analyze usage patterns, 
            and provide personalized content and features.
          </p>
        </div>

        {/* Cookie Types */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Types of Cookies We Use</h3>
          <div className="space-y-6">
            {cookieTypes.map((cookie, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg homepage-feature-icon flex items-center justify-center">
                    <cookie.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold homepage-text-primary">{cookie.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cookie.required 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
                          : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      }`}>
                        {cookie.required ? 'Required' : 'Optional'}
                      </span>
                    </div>
                    <p className="homepage-text-secondary mb-4">{cookie.description}</p>
                    <div>
                      <h5 className="font-medium homepage-text-primary mb-2">Examples:</h5>
                      <ul className="space-y-1">
                        {cookie.examples.map((example, i) => (
                          <li key={i} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full"></div>
                            <span className="homepage-text-secondary text-sm">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How We Use Cookies */}
        <div className="homepage-card rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">How We Use Cookies</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">1. Essential Site Functions</h4>
              <p className="homepage-text-secondary mb-3">
                We use essential cookies to enable core website functionality, including:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">User authentication and account management</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Security and fraud prevention</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Shopping cart and quiz progress saving</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">2. Analytics and Performance</h4>
              <p className="homepage-text-secondary mb-3">
                We use analytics cookies to understand how our website is used and to improve performance:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Track visitor behavior and usage patterns</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Identify popular content and features</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Monitor site performance and errors</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">3. Personalization</h4>
              <p className="homepage-text-secondary mb-3">
                We use functional cookies to remember your preferences and provide a personalized experience:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Remember your language and region settings</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Save your theme and display preferences</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Customize content based on your interests</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cookie Management */}
        <div className="homepage-card rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Managing Your Cookie Preferences</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Browser Settings</h4>
              <p className="homepage-text-secondary mb-4">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Block all cookies or only third-party cookies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Delete existing cookies from your device</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Set your browser to notify you when cookies are set</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Our Cookie Preferences</h4>
              <p className="homepage-text-secondary mb-4">
                We provide a cookie consent banner that allows you to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Accept or decline non-essential cookies</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Customize your preferences by cookie type</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2"></div>
                  <span className="homepage-text-secondary text-sm">Change your preferences at any time</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Third-Party Cookies */}
        <div className="homepage-card rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Third-Party Cookies</h3>
          <p className="homepage-text-secondary mb-4">
            We may use third-party services that set their own cookies. These include:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Google Analytics</h4>
              <p className="homepage-text-secondary text-sm mb-2">
                Used to analyze website traffic and user behavior.
              </p>
              <a href="#" className="blue-gradient-text text-sm hover:underline">
                Learn more about Google's privacy policy
              </a>
            </div>
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Social Media Platforms</h4>
              <p className="homepage-text-secondary text-sm mb-2">
                Integration with social media may set tracking cookies.
              </p>
              <a href="#" className="blue-gradient-text text-sm hover:underline">
                View social media privacy policies
              </a>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="homepage-card rounded-xl p-8 shadow-lg mb-8">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Questions About Cookies?</h3>
          <p className="homepage-text-secondary mb-4">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full"></div>
              <span className="homepage-text-secondary">Email: privacy@thinklytics.com</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full"></div>
              <span className="homepage-text-secondary">Address: Tampa, Florida</span>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Manage Your Preferences</h3>
          <p className="text-lg mb-6 opacity-90">
            Take control of your privacy and customize your cookie preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-[var(--brand-60)] hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors">
              Cookie Preferences
            </button>
            <button className="bg-white/10 text-white hover:bg-white/20 px-8 py-3 rounded-lg font-medium transition-colors">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage; 