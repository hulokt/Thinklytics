import React from 'react';
import { ArrowLeft, FileText, Shield, AlertTriangle, CheckCircle, Users } from 'lucide-react';

const TermsOfServicePage = ({ onBack }) => {
  const sections = [
    {
      title: "Acceptance of Terms",
      icon: CheckCircle,
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using Thinklytics, you accept and agree to be bound by the terms and provision of this agreement."
        },
        {
          subtitle: "Modifications",
          text: "We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through our platform."
        }
      ]
    },
    {
      title: "Use of Service",
      icon: Users,
      content: [
        {
          subtitle: "Eligibility",
          text: "You must be at least 13 years old to use our service. If you are under 18, you must have parental consent."
        },
        {
          subtitle: "Account Responsibility",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
        },
        {
          subtitle: "Acceptable Use",
          text: "You agree to use our platform only for lawful purposes and in accordance with these terms. You may not use our service to violate any applicable laws or regulations."
        }
      ]
    },
    {
      title: "Intellectual Property",
      icon: FileText,
      content: [
        {
          subtitle: "Our Rights",
          text: "Thinklytics and its original content, features, and functionality are owned by Thinklytics Inc. and are protected by international copyright, trademark, and other intellectual property laws."
        },
        {
          subtitle: "Your Content",
          text: "You retain ownership of any content you submit to our platform. By submitting content, you grant us a license to use, modify, and display that content in connection with our services."
        },
        {
          subtitle: "License to Use",
          text: "We grant you a limited, non-exclusive, non-transferable license to access and use our platform for your personal, non-commercial educational purposes."
        }
      ]
    },
    {
      title: "Privacy and Data",
      icon: Shield,
      content: [
        {
          subtitle: "Privacy Policy",
          text: "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms."
        },
        {
          subtitle: "Data Security",
          text: "We implement appropriate security measures to protect your data, but we cannot guarantee absolute security. You are responsible for maintaining the security of your account."
        }
      ]
    },
    {
      title: "Limitations and Disclaimers",
      icon: AlertTriangle,
      content: [
        {
          subtitle: "No Guarantees",
          text: "While we strive to provide accurate and helpful educational content, we do not guarantee that our platform will improve your SAT scores or that you will achieve specific results."
        },
        {
          subtitle: "Service Availability",
          text: "We do not guarantee that our platform will be available at all times. We may suspend or discontinue the service at any time with reasonable notice."
        },
        {
          subtitle: "Limitation of Liability",
          text: "To the maximum extent permitted by law, Thinklytics shall not be liable for any indirect, incidental, special, consequential, or punitive damages."
        }
      ]
    }
  ];

  const prohibitedActivities = [
    "Attempting to gain unauthorized access to our systems",
    "Using automated tools to access our platform",
    "Sharing account credentials with others",
    "Attempting to reverse engineer our platform",
    "Posting inappropriate or offensive content",
    "Violating any applicable laws or regulations"
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 mb-6">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Terms of
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Service</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            These terms govern your use of Thinklytics and outline the rights and responsibilities 
            of both you and our company. Please read them carefully.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Last updated: December 2024
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
              </div>
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{item.subtitle}</h4>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Prohibited Activities */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Prohibited Activities</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The following activities are strictly prohibited and may result in account termination:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {prohibitedActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700 dark:text-gray-300">{activity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Termination</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account Termination</h4>
              <p className="text-gray-600 dark:text-gray-300">
                We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users or our platform.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Effect of Termination</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Upon termination, your right to use our platform will cease immediately. We may delete your account and all associated data, though we may retain certain information as required by law.
              </p>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-12">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Governing Law</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Jurisdiction</h4>
              <p className="text-gray-600 dark:text-gray-300">
                These terms shall be governed by and construed in accordance with the laws of the State of Florida, without regard to its conflict of law provisions.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Dispute Resolution</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Any disputes arising from these terms or your use of our platform shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mt-12">
          <h3 className="text-2xl font-bold mb-6">Questions About These Terms?</h3>
          <p className="text-lg mb-6 opacity-90">
            If you have any questions about these terms of service, please contact us at{' '}
            <a href="mailto:legal@thinklytics.com" className="underline hover:no-underline">
              legal@thinklytics.com
            </a>
          </p>
          <button
            onClick={onBack}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage; 