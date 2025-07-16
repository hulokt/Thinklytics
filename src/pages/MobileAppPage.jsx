import React from 'react';
import { ArrowLeft, Smartphone, Tablet, Monitor, Wifi, Zap, Shield, Users, Globe, Clock, CheckCircle } from 'lucide-react';

const MobileAppPage = ({ onBack }) => {
  const features = [
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Our platform is built with mobile devices in mind, ensuring a seamless experience on smartphones, tablets, and desktops."
    },
    {
      icon: Wifi,
      title: "Access Anywhere",
      description: "Study on the go with our responsive web platform. Access your dashboard, questions, and practice tests from any device with internet connectivity."
    },
    {
      icon: Zap,
      title: "Fast Performance",
      description: "Optimized for speed and efficiency, our platform loads quickly and works smoothly on all devices, even with slower internet connections."
    },
    {
      icon: Shield,
      title: "Secure Access",
      description: "Your data is protected with enterprise-grade security. Access your account safely from any device with secure authentication."
    }
  ];

  const deviceSupport = [
    {
      device: "Smartphones",
      icon: Smartphone,
      description: "Full functionality on iOS and Android devices",
      features: ["Touch-optimized interface", "Responsive design", "Offline capability", "Push notifications"]
    },
    {
      device: "Tablets",
      icon: Tablet,
      description: "Enhanced experience on iPad and Android tablets",
      features: ["Larger touch targets", "Split-screen support", "Pencil compatibility", "Landscape mode"]
    },
    {
      device: "Desktop & Laptop",
      icon: Monitor,
      description: "Complete feature set on Windows, Mac, and Linux",
      features: ["Full keyboard shortcuts", "Multi-window support", "Advanced analytics", "Export capabilities"]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Study Anywhere",
      description: "Turn waiting time into study time. Practice questions during commutes, breaks, or any spare moment."
    },
    {
      icon: Users,
      title: "Seamless Sync",
      description: "Your progress syncs across all devices instantly. Start on your phone, continue on your laptop."
    },
    {
      icon: Globe,
      title: "No Downloads Required",
      description: "Access everything through your web browser. No app store downloads or updates needed."
    }
  ];

  const responsiveFeatures = [
    "Adaptive layouts that work on all screen sizes",
    "Touch-friendly navigation and controls",
    "Optimized text sizing for readability",
    "Fast loading times on mobile networks",
    "Offline functionality for downloaded content",
    "Cross-device synchronization",
    "Progressive Web App capabilities",
    "Voice input support for hands-free use"
  ];

  const accessibilityFeatures = [
    "Screen reader compatibility",
    "High contrast mode support",
    "Keyboard navigation",
    "Adjustable font sizes",
    "Color-blind friendly design",
    "Voice command integration",
    "Gesture-based navigation",
    "Multi-language support"
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
            <h1 className="text-3xl font-bold homepage-text-primary">Mobile Access</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl homepage-feature-icon mb-6">
            <Smartphone className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Study
            <span className="homepage-gradient-text"> Anywhere</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto leading-relaxed">
            Our responsive web platform works perfectly on all your devices. No downloads required - just open your browser 
            and start studying on your phone, tablet, or computer.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Why Our Platform Works Everywhere</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-lg homepage-feature-icon flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold homepage-text-primary">{feature.title}</h4>
                </div>
                <p className="homepage-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Device Support */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Works on All Your Devices</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {deviceSupport.map((device, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg homepage-hover-glow">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-xl homepage-feature-icon flex items-center justify-center mx-auto mb-4">
                    <device.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold homepage-text-primary mb-2">{device.device}</h4>
                  <p className="homepage-text-secondary text-sm">{device.description}</p>
                </div>
                <div className="space-y-2">
                  {device.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs homepage-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Features */}
        <div className="homepage-card rounded-2xl shadow-xl p-8 mb-16 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6 text-center">Responsive Design Features</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {responsiveFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] rounded-full mt-2 flex-shrink-0"></div>
                <span className="homepage-text-secondary">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">Benefits of Mobile Access</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="homepage-card rounded-xl p-6 shadow-lg text-center homepage-hover-glow">
                <div className="w-16 h-16 rounded-xl homepage-feature-icon flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold homepage-text-primary mb-3">{benefit.title}</h4>
                <p className="homepage-text-secondary">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accessibility */}
        <div className="blue-gradient-bg rounded-2xl p-8 text-white mb-16">
          <h3 className="text-2xl font-bold mb-6">Accessibility for Everyone</h3>
          <p className="text-lg mb-6 opacity-90">
            We believe education should be accessible to all students, regardless of their abilities or the devices they use.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {accessibilityFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                <span className="text-sm opacity-90">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="homepage-card rounded-2xl shadow-xl p-8 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-6">How to Access on Any Device</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon text-white flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Open Your Browser</h4>
                <p className="homepage-text-secondary">
                  Use any modern web browser - Chrome, Safari, Firefox, or Edge on any device.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon text-white flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Navigate to Thinklytics</h4>
                <p className="homepage-text-secondary">
                  Go to our website and log in with your existing account credentials.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full homepage-feature-icon text-white flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h4 className="font-semibold homepage-text-primary mb-2">Start Studying</h4>
                <p className="homepage-text-secondary">
                  Access all your features - questions, practice tests, analytics, and study plans - optimized for your device.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAppPage; 