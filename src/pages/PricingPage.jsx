import React from 'react';
import { ArrowLeft, Check, Star } from 'lucide-react';

const PricingPage = ({ onBack }) => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with SAT prep",
      features: [
        "Up to 50 practice questions",
        "Basic analytics",
        "Quiz creation",
        "Study calendar",
        "Mobile access"
      ],
      popular: false,
      cta: "Get Started Free",
      href: "/signup"
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "Everything you need to ace the SAT",
      features: [
        "Unlimited practice questions",
        "Advanced analytics & insights",
        "Custom quiz creation",
        "Study planning & scheduling",
        "Progress tracking",
        "Performance reports",
        "Priority support",
        "Cloud sync across devices"
      ],
      popular: true,
      cta: "Start Free Trial",
      href: "/signup"
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "per month",
      description: "Complete SAT preparation suite",
      features: [
        "Everything in Pro",
        "AI-powered study recommendations",
        "Personalized study plans",
        "Advanced question bank",
        "Mock test simulations",
        "Expert tutoring access",
        "College application guidance",
        "Score improvement guarantee"
      ],
      popular: false,
      cta: "Start Free Trial",
      href: "/signup"
    }
  ];

  return (
    <div className="min-h-screen homepage-bg transition-colors duration-300">
      {/* Header */}
      <div className="homepage-card shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-lg homepage-card hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 homepage-text-primary" />
              </button>
              <div>
                <h1 className="text-2xl font-bold homepage-text-primary">Pricing</h1>
                <p className="homepage-text-secondary">Choose the perfect plan for your SAT prep</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold homepage-text-primary mb-6">
            Simple, transparent
            <span className="homepage-gradient-text"> pricing</span>
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto">
            Start free and upgrade as you need. All plans include our core features to help you succeed on the SAT.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative homepage-card rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 homepage-hover-glow ${
                plan.popular 
                  ? 'border-[var(--brand-60)]' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-[var(--brand-60)] to-[var(--brand-70)] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold homepage-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold homepage-text-primary">
                    {plan.price}
                  </span>
                  <span className="homepage-text-secondary ml-2">
                    /{plan.period}
                  </span>
                </div>
                <p className="homepage-text-secondary">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="homepage-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => window.location.href = plan.href}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-200 ${
                  plan.popular
                    ? 'homepage-cta-primary text-white hover:shadow-xl'
                    : 'homepage-cta-secondary homepage-text-primary hover:shadow-lg'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="homepage-card rounded-2xl p-8 shadow-lg mb-16 homepage-hover-glow">
          <h3 className="text-2xl font-bold homepage-text-primary mb-8 text-center">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold homepage-text-primary mb-2">
                Can I cancel anytime?
              </h4>
              <p className="homepage-text-secondary">
                Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
              </p>
            </div>
            <div>
              <h4 className="font-semibold homepage-text-primary mb-2">
                Is there a free trial?
              </h4>
              <p className="homepage-text-secondary">
                Yes! All paid plans come with a 7-day free trial. No credit card required to start.
              </p>
            </div>
            <div>
              <h4 className="font-semibold homepage-text-primary mb-2">
                What payment methods do you accept?
              </h4>
              <p className="homepage-text-secondary">
                We accept all major credit cards, PayPal, and Apple Pay. All payments are processed securely.
              </p>
            </div>
            <div>
              <h4 className="font-semibold homepage-text-primary mb-2">
                Do you offer student discounts?
              </h4>
              <p className="homepage-text-secondary">
                Yes! Students with a valid .edu email address can get 20% off any paid plan.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="blue-gradient-bg rounded-3xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to start improving your SAT score?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students who are already achieving their target scores with Thinklytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/signup'}
              className="bg-white text-[var(--brand-60)] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => window.location.href = '/contact'}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-[var(--brand-60)] transition-colors duration-200"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage; 