import React from 'react';
import { ArrowLeft, Shield, Eye, Edit3, Trash2, Download, Lock, Users, FileText, AlertTriangle } from 'lucide-react';

const GDPRPage = ({ onBack }) => {
  const rights = [
    {
      icon: Eye,
      title: "Right to Access",
      description: "You have the right to request access to your personal data and information about how we process it."
    },
    {
      icon: Edit3,
      title: "Right to Rectification",
      description: "You can request correction of inaccurate or incomplete personal data we hold about you."
    },
    {
      icon: Trash2,
      title: "Right to Erasure",
      description: "You can request deletion of your personal data in certain circumstances (also known as 'right to be forgotten')."
    },
    {
      icon: Download,
      title: "Right to Data Portability",
      description: "You can request a copy of your personal data in a structured, machine-readable format."
    },
    {
      icon: Lock,
      title: "Right to Restrict Processing",
      description: "You can request that we limit how we use your personal data in certain situations."
    },
    {
      icon: Users,
      title: "Right to Object",
      description: "You can object to our processing of your personal data in certain circumstances."
    }
  ];

  const dataCategories = [
    {
      category: "Account Information",
      examples: ["Name, email address, password", "Account preferences and settings", "Profile information"],
      purpose: "To provide and manage your account",
      legalBasis: "Contract performance"
    },
    {
      category: "Study Data",
      examples: ["Question logs and answers", "Quiz results and progress", "Study time and patterns"],
      purpose: "To provide educational services and analytics",
      legalBasis: "Contract performance and legitimate interest"
    },
    {
      category: "Usage Data",
      examples: ["Login times and frequency", "Feature usage patterns", "Device and browser information"],
      purpose: "To improve our services and user experience",
      legalBasis: "Legitimate interest"
    },
    {
      category: "Communication Data",
      examples: ["Support emails and messages", "Feedback and survey responses", "Marketing communications"],
      purpose: "To provide support and communicate with you",
      legalBasis: "Contract performance and consent"
    }
  ];

  const dataRetention = [
    {
      dataType: "Account Information",
      retentionPeriod: "Until account deletion",
      reason: "Required to provide our services"
    },
    {
      dataType: "Study Data",
      retentionPeriod: "Until account deletion",
      reason: "Core service functionality"
    },
    {
      dataType: "Usage Analytics",
      retentionPeriod: "2 years",
      reason: "Service improvement and analytics"
    },
    {
      dataType: "Support Communications",
      retentionPeriod: "3 years",
      reason: "Customer service and legal compliance"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">GDPR Compliance</h1>
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
            Your Data
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Rights</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            We are committed to protecting your privacy and ensuring compliance with the General Data Protection Regulation (GDPR). 
            This page explains your rights and how we handle your personal data.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last updated: December 2024
          </p>
        </div>

        {/* Your Rights Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Your GDPR Rights</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {rights.map((right, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <right.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{right.title}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{right.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How We Process Your Data</h3>
          <div className="space-y-6">
            {dataCategories.map((category, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{category.category}</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Examples:</h5>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-300">
                      {category.examples.map((example, exampleIndex) => (
                        <li key={exampleIndex} className="flex items-start space-x-2">
                          <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Purpose:</h5>
                    <p className="text-gray-600 dark:text-gray-300">{category.purpose}</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Legal Basis:</h5>
                    <p className="text-gray-600 dark:text-gray-300">{category.legalBasis}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Data Retention Periods</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Data Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Retention Period</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Reason</th>
                </tr>
              </thead>
              <tbody>
                {dataRetention.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{item.dataType}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.retentionPeriod}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* How to Exercise Your Rights */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Exercise Your Rights</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Contact Us</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                To exercise any of your GDPR rights, please contact us at{' '}
                <a href="mailto:privacy@thinklytics.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  privacy@thinklytics.com
                </a>
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                We will respond to your request within 30 days of receipt.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What to Include</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Your full name and email address</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Specific right you want to exercise</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Any additional context or requirements</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Protection Officer */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
          <h3 className="text-2xl font-bold mb-6">Data Protection Officer</h3>
          <div className="space-y-4">
            <p className="text-lg opacity-90">
              We have appointed a Data Protection Officer (DPO) to ensure compliance with GDPR and to handle 
              any privacy-related inquiries.
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Contact Information:</h4>
              <p className="opacity-90">Email: dpo@thinklytics.com</p>
              <p className="opacity-90">Address: Thinklytics, Tampa, Florida</p>
            </div>
          </div>
        </div>

        {/* Updates and Contact */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Questions About GDPR?</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                If you have any questions about our GDPR compliance or how we handle your personal data, 
                please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:privacy@thinklytics.com"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
                >
                  Contact Privacy Team
                </a>
                <button
                  onClick={onBack}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GDPRPage; 