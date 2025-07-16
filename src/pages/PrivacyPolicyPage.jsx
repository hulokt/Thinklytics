import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Users } from 'lucide-react';

const PrivacyPolicyPage = ({ onBack }) => {
  const sections = [
    {
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          text: "We collect information you provide directly to us, such as when you create an account, including your name, email address, and educational information."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you use our platform, including your study patterns, question responses, and time spent on different sections."
        },
        {
          subtitle: "Device Information",
          text: "We collect information about the device you use to access our platform, including IP address, browser type, and operating system."
        }
      ]
    },
    {
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Provide Our Services",
          text: "We use your information to provide, maintain, and improve our SAT preparation platform and personalized learning experiences."
        },
        {
          subtitle: "Personalization",
          text: "We use your study data to create personalized recommendations and identify areas where you need additional practice."
        },
        {
          subtitle: "Communication",
          text: "We may use your email address to send you important updates about our service, study tips, and educational content."
        }
      ]
    },
    {
      title: "Information Sharing",
      icon: Users,
      content: [
        {
          subtitle: "We Do Not Sell Your Data",
          text: "We do not sell, trade, or otherwise transfer your personal information to third parties for their marketing purposes."
        },
        {
          subtitle: "Service Providers",
          text: "We may share your information with trusted third-party service providers who help us operate our platform and provide our services."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose your information if required by law or to protect our rights, property, or safety."
        }
      ]
    },
    {
      title: "Data Security",
      icon: Lock,
      content: [
        {
          subtitle: "Security Measures",
          text: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
        },
        {
          subtitle: "Data Encryption",
          text: "All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols."
        },
        {
          subtitle: "Access Controls",
          text: "We limit access to your personal information to employees who need it to provide our services."
        }
      ]
    }
  ];

  const rights = [
    "Access your personal information",
    "Correct inaccurate information",
    "Request deletion of your data",
    "Export your data",
    "Opt out of marketing communications",
    "Lodge a complaint with supervisory authorities"
  ];

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
            <h1 className="text-3xl font-bold homepage-text-primary">Privacy Policy</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl homepage-feature-icon mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Your Privacy
            <span className="homepage-gradient-text"> Matters</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            We are committed to protecting your privacy and ensuring the security of your personal information. 
            This policy explains how we collect, use, and protect your data.
          </p>
          <p className="text-sm homepage-text-muted mt-4">
            Last updated: December 2024
          </p>
        </div>

        {/* Policy Sections */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <div key={index} className="homepage-card rounded-2xl shadow-xl p-8 homepage-hover-glow">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 rounded-lg homepage-feature-icon flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold homepage-text-primary">{section.title}</h3>
              </div>
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h4 className="text-lg font-semibold homepage-text-primary mb-3">{item.subtitle}</h4>
                    <p className="homepage-text-secondary leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Your Rights Section */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white mt-12">
          <h3 className="text-2xl font-bold mb-6">Your Privacy Rights</h3>
          <p className="text-lg mb-6 opacity-90">
            You have the following rights regarding your personal information:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {rights.map((right, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>{right}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="homepage-card rounded-2xl shadow-xl p-8 mt-12 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">Additional Information</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Data Retention</h4>
              <p className="homepage-text-secondary">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. 
                You may request deletion of your account and associated data at any time.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Children's Privacy</h4>
              <p className="homepage-text-secondary">
                Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information 
                from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, 
                please contact us.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Changes to This Policy</h4>
              <p className="homepage-text-secondary">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy 
                on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold homepage-text-primary mb-3">Contact Us</h4>
              <p className="homepage-text-secondary">
                If you have any questions about this privacy policy or our data practices, please contact us at{' '}
                <a href="mailto:privacy@thinklytics.com" className="blue-gradient-text hover:underline">
                  privacy@thinklytics.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="homepage-text-secondary mb-4">
            By using Thinklytics, you agree to this privacy policy.
          </p>
          <button
            onClick={onBack}
            className="homepage-cta-primary text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 