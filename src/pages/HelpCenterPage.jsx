import React, { useState } from 'react';
import { ArrowLeft, Search, BookOpen, Users, MessageCircle, Video, FileText, Mail } from 'lucide-react';

const HelpCenterPage = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'features', name: 'Features' },
    { id: 'account', name: 'Account & Billing' },
    { id: 'technical', name: 'Technical Support' }
  ];

  const faqs = [
    {
      category: 'getting-started',
      question: "How do I create my first question log?",
      answer: "To create your first question log, click on the 'Add Question' button in the Questions section. Fill in the question details including section, domain, question type, and your answer. You can also import questions from CSV files for bulk entry."
    },
    {
      category: 'getting-started',
      question: "What sections of the SAT does Thinklytics support?",
      answer: "Thinklytics supports all major SAT sections including Math (Calculator and No Calculator), Evidence-Based Reading and Writing, and the Essay section. Each section is broken down into specific domains and question types for detailed tracking."
    },
    {
      category: 'features',
      question: "How does the analytics feature work?",
      answer: "Our analytics feature analyzes your question logs to identify patterns in your performance. It shows your strengths and weaknesses by section, domain, and question type, helping you focus your study efforts where they're needed most."
    },
    {
      category: 'features',
      question: "Can I create custom study plans?",
      answer: "Yes! You can create custom study plans by selecting specific questions from your question bank and scheduling them for future practice. The calendar feature helps you stay organized and maintain a consistent study schedule."
    },
    {
      category: 'account',
      question: "How do I reset my password?",
      answer: "To reset your password, go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a link to reset your password. Make sure to check your spam folder if you don't see the email."
    },
    {
      category: 'account',
      question: "Can I export my data?",
      answer: "Yes, you can export your question logs and quiz results as PDF files. This feature is available in both the Questions and History sections. Your data is also automatically backed up to our secure servers."
    },
    {
      category: 'technical',
      question: "The app is running slowly. What should I do?",
      answer: "Try refreshing your browser or clearing your browser cache. If the issue persists, check your internet connection and try accessing the platform from a different browser. Contact support if problems continue."
    },
    {
      category: 'technical',
      question: "I'm having trouble uploading images. What formats are supported?",
      answer: "We support common image formats including JPG, PNG, and GIF. Make sure your image file is under 10MB. If you're still having issues, try compressing the image or converting it to a different format."
    }
  ];

  const supportChannels = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email within 24 hours",
      action: "Send Email",
      href: "mailto:support@thinklytics.com"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      action: "Start Chat",
      href: "#"
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      action: "Watch Videos",
      href: "#"
    },
    {
      icon: FileText,
      title: "Documentation",
      description: "Browse our comprehensive guides",
      action: "Read Docs",
      href: "#"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help Center</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How Can We
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Help?</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions, learn how to use our features, and get the support you need 
            to make the most of Thinklytics.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{faq.question}</h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h4>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search terms or browse our categories above.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Support Channels */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Get in Touch
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-4">
                  <channel.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{channel.title}</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{channel.description}</p>
                <a
                  href={channel.href}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {channel.action}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Links</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Getting Started</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Creating Your First Question</a></li>
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Understanding Analytics</a></li>
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Setting Up Your Profile</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Question Logging</a></li>
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Quiz Creation</a></li>
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Progress Tracking</a></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 dark:text-white">Account</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Privacy Settings</a></li>
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Data Export</a></li>
                <li><a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">Account Deletion</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Still Need Help?</h3>
          <p className="text-lg mb-6 opacity-90">
            Our support team is here to help you succeed. Don't hesitate to reach out!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@thinklytics.com"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Support
            </a>
            <button
              onClick={onBack}
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage; 