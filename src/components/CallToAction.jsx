import React from 'react';
import { Button } from "./ui/button";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  const handleStartFree = () => navigate("/signup");
  const handleViewDemo = () => navigate("/home"); // adjust path if demo page exists

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[var(--brand-60)]/20 via-[var(--brand-50p)]/20 to-[var(--brand-70)]/20 dark:from-[var(--brand-60)]/20 dark:via-[var(--brand-50p)]/20 dark:to-[var(--brand-70)]/20 rounded-3xl p-12 border border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400">
              <BookOpen className="w-6 h-6" />
              <span className="text-lg font-semibold">Smart Analytics</span>
            </div>
            <div className="flex items-center space-x-2 text-blue-500 dark:text-blue-400">
              <TrendingUp className="w-6 h-6" />
              <span className="text-lg font-semibold">Proven Results</span>
            </div>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to Transform Your 
            <span className="blue-gradient-text"> SAT Score?</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already improved their scores with our AI-powered analytics platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={handleStartFree}
              className="blue-gradient-bg text-white px-8 py-3 text-lg rounded-xl transform transition-transform duration-300 ease-out hover:scale-105 hover:opacity-95 flex items-center gap-2"
            >
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleViewDemo}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-3 text-lg rounded-xl transform transition-transform duration-300 ease-out hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white hover:scale-105"
            >
              View Demo
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 