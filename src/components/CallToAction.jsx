import React from 'react';
import { Button } from "./ui/button";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";

const CallToAction = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-600/20 dark:to-purple-600/20 rounded-3xl p-12 border border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex justify-center space-x-8 mb-8">
            <div className="flex items-center space-x-2 text-green-500 dark:text-green-400">
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
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> SAT Score?</span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have already improved their scores with our AI-powered analytics platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg hover:scale-110 transition-all duration-500 ease-out transform"
            >
              Start Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white px-8 py-3 text-lg hover:scale-105 transition-all duration-300"
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