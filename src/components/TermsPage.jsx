import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

const TermsPage = ({ onBack }) => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' or 'privacy'

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 backdrop-blur-lg border-b ${
        isDarkMode ? 'bg-gray-950/90 border-gray-800' : 'bg-white/90 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 ${
              isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-lg">Thinklytics</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('terms')}
              className={`pb-4 pt-6 font-semibold border-b-2 transition-colors ${
                activeTab === 'terms'
                  ? 'border-blue-600 text-blue-600'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Terms of Service</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`pb-4 pt-6 font-semibold border-b-2 transition-colors ${
                activeTab === 'privacy'
                  ? 'border-blue-600 text-blue-600'
                  : isDarkMode
                    ? 'border-transparent text-gray-400 hover:text-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Privacy Policy</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {activeTab === 'terms' ? <TermsContent isDarkMode={isDarkMode} /> : <PrivacyContent isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
};

const TermsContent = ({ isDarkMode }) => (
  <div className="prose prose-lg max-w-none">
    <div className="mb-8">
      <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Terms of Service
      </h1>
      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>

    <div className="space-y-8">
      <Section
        title="1. Acceptance of Terms"
        content="By accessing and using Thinklytics, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        isDarkMode={isDarkMode}
      />

      <Section
        title="2. Description of Service"
        content="Thinklytics provides an AI-powered SAT preparation platform that helps students track their progress, analyze their performance, and practice with personalized quizzes. The service includes features such as question logging, analytics dashboards, and practice quiz generation."
        isDarkMode={isDarkMode}
      />

      <Section
        title="3. User Accounts"
        content="To access certain features, you must create an account. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account."
        isDarkMode={isDarkMode}
      />

      <Section
        title="4. User Conduct"
        content="You agree not to use the service to upload, post, or transmit any content that is unlawful, harmful, threatening, abusive, harassing, or otherwise objectionable. You will not attempt to gain unauthorized access to our systems or engage in any activity that disrupts or interferes with our service."
        isDarkMode={isDarkMode}
      />

      <Section
        title="5. Intellectual Property"
        content="All content included on this site, such as text, graphics, logos, images, and software, is the property of Thinklytics or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our content without explicit permission."
        isDarkMode={isDarkMode}
      />

      <Section
        title="6. Payment and Subscription"
        content="Certain features of the service may require a paid subscription. You agree to pay all fees associated with your subscription. Subscriptions automatically renew unless cancelled before the renewal date. Refunds are handled on a case-by-case basis at our discretion."
        isDarkMode={isDarkMode}
      />

      <Section
        title="7. Disclaimer of Warranties"
        content="The service is provided 'as is' without any warranties, expressed or implied. We do not warrant that the service will be uninterrupted, error-free, or that results obtained from the service will be accurate or reliable. Thinklytics is a study tool and does not guarantee specific SAT score improvements."
        isDarkMode={isDarkMode}
      />

      <Section
        title="8. Limitation of Liability"
        content="Thinklytics shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. This includes, but is not limited to, damages for loss of profits, data, or other intangible losses."
        isDarkMode={isDarkMode}
      />

      <Section
        title="9. Termination"
        content="We reserve the right to terminate or suspend your account and access to the service at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the service, us, or third parties, or for any other reason."
        isDarkMode={isDarkMode}
      />

      <Section
        title="10. Changes to Terms"
        content="We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Your continued use of the service after such modifications constitutes your acceptance of the updated terms."
        isDarkMode={isDarkMode}
      />

      <Section
        title="11. Contact Information"
        content="If you have any questions about these Terms of Service, please contact us at support@thinklytics.com"
        isDarkMode={isDarkMode}
      />
    </div>
  </div>
);

const PrivacyContent = ({ isDarkMode }) => (
  <div className="prose prose-lg max-w-none">
    <div className="mb-8">
      <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Privacy Policy
      </h1>
      <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>

    <div className="space-y-8">
      <Section
        title="1. Information We Collect"
        content="We collect information you provide directly to us, such as your name, email address, and account information. We also collect information about your use of the service, including questions you log, quiz results, and performance analytics. This data helps us provide personalized recommendations and improve our service."
        isDarkMode={isDarkMode}
      />

      <Section
        title="2. How We Use Your Information"
        content="We use your information to provide, maintain, and improve our service. This includes personalizing your experience, generating analytics and insights, creating custom quizzes based on your performance, communicating with you about the service, and protecting against unauthorized access or use of the service."
        isDarkMode={isDarkMode}
      />

      <Section
        title="3. Information Sharing"
        content="We do not sell your personal information to third parties. We may share your information with service providers who assist us in operating our platform, such as cloud hosting providers and analytics services. These providers are contractually obligated to protect your data and use it only for the purposes we specify."
        isDarkMode={isDarkMode}
      />

      <Section
        title="4. Data Security"
        content="We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of data in transit and at rest, regular security audits, and strict access controls. However, no method of transmission over the internet is 100% secure."
        isDarkMode={isDarkMode}
      />

      <Section
        title="5. Your Rights and Choices"
        content="You have the right to access, update, or delete your personal information at any time. You can manage your account settings, export your data, or request account deletion through your account settings or by contacting us. You can also opt out of marketing communications while continuing to use the service."
        isDarkMode={isDarkMode}
      />

      <Section
        title="6. Cookies and Tracking"
        content="We use cookies and similar tracking technologies to enhance your experience on our service. These help us remember your preferences, understand how you use the service, and improve our platform. You can control cookies through your browser settings, though some features may not function properly if cookies are disabled."
        isDarkMode={isDarkMode}
      />

      <Section
        title="7. Children's Privacy"
        content="Our service is intended for users who are at least 13 years old. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete it."
        isDarkMode={isDarkMode}
      />

      <Section
        title="8. Third-Party Services"
        content="Our service may contain links to third-party websites or integrate with third-party services (such as Google authentication). We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any information to them."
        isDarkMode={isDarkMode}
      />

      <Section
        title="9. Data Retention"
        content="We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes."
        isDarkMode={isDarkMode}
      />

      <Section
        title="10. Changes to Privacy Policy"
        content="We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the 'Last updated' date. We encourage you to review this Privacy Policy periodically."
        isDarkMode={isDarkMode}
      />

      <Section
        title="11. Contact Us"
        content="If you have any questions about this Privacy Policy or our data practices, please contact us at privacy@thinklytics.com"
        isDarkMode={isDarkMode}
      />
    </div>
  </div>
);

const Section = ({ title, content, isDarkMode }) => (
  <div>
    <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      {title}
    </h2>
    <p className={`leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {content}
    </p>
  </div>
);

export default TermsPage;


