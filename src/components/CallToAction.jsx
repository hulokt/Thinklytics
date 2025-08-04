import React from 'react';
import { Button } from "./ui/button";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const navigate = useNavigate();

  const handleStartFree = () => navigate("/signup");
  const handleViewDemo = () => navigate("/home");

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="homepage-card backdrop-blur-sm border homepage-hover-glow rounded-3xl p-12 sm:p-16 md:p-20 shadow-2xl hover:shadow-3xl transition-all duration-500">
          {/* Feature Icons */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-lg font-semibold">Smart Analytics</span>
            </div>
            <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-lg font-semibold">Proven Results</span>
            </div>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="homepage-text-primary">Ready to Transform Your</span>
            <br />
            <span className="homepage-gradient-text">SAT Score?</span>
          </h2>
          
          <p className="text-xl sm:text-2xl homepage-text-secondary mb-12 max-w-4xl mx-auto leading-relaxed">
            Join thousands of students who have already improved their scores with our AI-powered analytics platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <button
              onClick={handleStartFree}
              className="group relative inline-flex items-center justify-center gap-3 h-16 w-full sm:w-auto px-12 rounded-3xl homepage-cta-primary text-white font-bold text-xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--brand-70)] via-[var(--brand-50p)] to-[var(--brand-60)] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">Start Free Today</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
            </button>
            
            <button
              onClick={handleViewDemo}
              className="group inline-flex items-center justify-center gap-3 h-16 w-full sm:w-auto px-12 rounded-3xl homepage-cta-secondary backdrop-blur-sm border-2 font-bold text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <span>View Demo</span>
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm homepage-text-muted">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              14-day free trial
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction; 