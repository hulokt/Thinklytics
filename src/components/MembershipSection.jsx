import React from 'react';
import { Button } from "./ui/button";
import { Check, Star, Zap, Crown } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started with SAT prep",
    icon: Star,
    features: [
      "Track up to 3 practice tests",
      "Basic analytics dashboard",
      "Wrong answer logging",
      "Topic-wise breakdown",
      "Email support"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline",
    popular: false
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    description: "Advanced analytics and unlimited tracking",
    icon: Zap,
    features: [
      "Unlimited practice tests",
      "Advanced AI analytics",
      "Personalized study plans",
      "Performance predictions",
      "Priority support",
      "Export your data",
      "Mobile app access"
    ],
    buttonText: "Start Pro Trial",
    buttonVariant: "default",
    popular: true
  },
  {
    name: "Premium",
    price: "$39",
    period: "per month",
    description: "Everything you need for SAT mastery",
    icon: Crown,
    features: [
      "Everything in Pro",
      "1-on-1 tutoring sessions",
      "Custom practice questions",
      "College admissions guidance",
      "Early access to new features",
      "White-glove onboarding",
      "Dedicated success manager"
    ],
    buttonText: "Go Premium",
    buttonVariant: "default",
    popular: false
  }
];

const MembershipSection = () => {
  return (
    <section className="py-20 px-6" id="pricing">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
            Choose Your 
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Learning Path</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            From basic tracking to comprehensive SAT mastery, we have a plan that fits your goals and budget.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                plan.popular 
                  ? 'bg-gradient-to-b from-blue-50 to-cyan-50 dark:from-blue-600/20 dark:to-cyan-600/20 border-2 border-blue-500/70 dark:border-cyan-500/50 shadow-xl' 
                  : 'bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/{plan.period}</span>
                </div>

                <Button
                  className={`w-full mb-6 ${
                    plan.buttonVariant === 'default'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-0'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-transparent'
                  }`}
                  variant={plan.buttonVariant}
                  size="lg"
                >
                  {plan.buttonText}
                </Button>
              </div>

              <div className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? 'bg-blue-500' : 'bg-gray-500 dark:bg-gray-600'
                    }`}>
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
            <span>✓ Secure payment processing</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MembershipSection; 