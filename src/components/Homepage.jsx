import React, { useMemo } from "react";
import {
  BookOpen,
  CheckCircle,
  Target,
  Edit3,
  Award,
  MoveUpRight,
  ClipboardCopy,
  BarChart,
  FileQuestion,
  Star,
  BrainCircuit,
  Filter,
  Twitter,
  Linkedin,
  Youtube,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Star as LucideStar,
  Sparkles,
} from "lucide-react";
import { ContainerTextFlip } from "./ui/container-text-flip";

import { InfiniteMovingCards } from "./ui/InfiniteMovingCards";
import Footer from "./Footer";
import MembershipSection from "./MembershipSection";
import QASection from "./QASection";
import CallToAction from "./CallToAction";
import Navbar from "./Navbar";

const Homepage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen w-full homepage-bg homepage-text-primary transition-colors duration-300">
      {/* Navigation */}
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />

      {/* Hero Section - ULTRA MODERN */}
      <section className="relative w-full flex flex-col items-center justify-center overflow-hidden pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24 md:pb-32 min-h-screen">
        {/* Modern Animated Background */}
        <div className="absolute inset-0 h-full w-full">
          {/* Enhanced Gradient Mesh Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-purple-100/60 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20"></div>
          
          {/* Enhanced Animated Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 dark:from-blue-400/20 dark:to-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/25 to-pink-500/25 dark:from-purple-400/15 dark:to-pink-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 dark:from-indigo-400/20 dark:to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Enhanced Geometric Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-400/50 dark:border-blue-700/30 rounded-2xl rotate-12 animate-float bg-white/20 dark:bg-transparent backdrop-blur-sm"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/30 to-indigo-500/30 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-32 left-20 w-20 h-20 border-2 border-purple-400/50 dark:border-purple-700/30 rounded-lg rotate-45 animate-float-slow bg-white/20 dark:bg-transparent backdrop-blur-sm"></div>
          
          {/* Enhanced Particle Effect */}
          <div className="absolute inset-0">
            {useMemo(() => 
              [...Array(20)].map((_, i) => {
                // Generate stable random values that don't change on re-render
                const left = Math.random() * 100;
                const top = Math.random() * 100;
                const delay = Math.random() * 3;
                const duration = 2 + Math.random() * 2;
                
                return (
                  <div
                    key={`particle-${i}`}
                    className="absolute w-2 h-2 bg-blue-500/60 dark:bg-blue-300/40 rounded-full animate-ping"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`
                    }}
                  ></div>
                );
              }), []
            )}
          </div>
          
          {/* Enhanced Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,rgba(59,130,246,0.08)_50%,transparent_100%)] dark:bg-[linear-gradient(to_right,transparent_0%,rgba(59,130,246,0.02)_50%,transparent_100%)] bg-[size:100px_100px]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl mx-auto">
          {/* Enhanced Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/90 dark:homepage-card border-2 border-blue-200 dark:border mb-8 backdrop-blur-sm shadow-xl">
            <div className="relative">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-[var(--brand-60)] animate-pulse" />
              <div className="absolute inset-0 w-5 h-5 bg-blue-400/30 dark:bg-blue-400/20 rounded-full animate-ping"></div>
            </div>
            <span className="text-sm font-semibold text-blue-700 dark:text-[var(--brand-70)]">
              AI-Powered SAT Prep Platform
            </span>
          </div>

          {/* Enhanced Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 leading-[0.9] tracking-tight">
            <span className="block text-gray-900 dark:homepage-text-primary">Master the SAT with</span>
            <div className="relative">
              <ContainerTextFlip
                words={["Smart Analytics", "AI Insights", "Data-Driven Prep"]}
                className="homepage-gradient-text relative z-10"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-indigo-500/30 dark:from-blue-400/20 dark:via-purple-400/20 dark:to-indigo-400/20 blur-3xl -z-10"></div>
            </div>
          </h1>

          {/* Enhanced Subtitle */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:homepage-text-secondary max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 font-medium">
            Transform your mistakes into mastery. Log questions, analyze patterns, and boost your score with intelligent insights and personalized practice.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
            <button
              onClick={onGetStarted}
              className="group relative inline-flex items-center justify-center gap-3 h-16 w-full sm:w-auto px-8 sm:px-10 rounded-3xl homepage-cta-primary text-white font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden transform hover:scale-105"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[var(--brand-70)] via-[var(--brand-50p)] to-[var(--brand-60)] opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="relative z-10">Start Learning Free</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
            </button>
            <button
              onClick={onLogin}
              className="group inline-flex items-center justify-center gap-3 h-16 w-full sm:w-auto px-8 sm:px-10 rounded-3xl homepage-cta-secondary backdrop-blur-sm border-2 font-bold text-lg sm:text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <span>Sign In</span>
            </button>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto px-4">
            {[
              { 
                number: "10K+", 
                label: "Students", 
                icon: (
                  <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                )
              },
              { 
                number: "150+", 
                label: "Score Increase", 
                icon: (
                  <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
              { 
                number: "95%", 
                label: "Success Rate", 
                icon: (
                  <svg className="w-12 h-12 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                )
              }
            ].map((stat, i) => (
              <div key={i} className="group relative p-6 rounded-2xl bg-white/90 dark:homepage-card backdrop-blur-sm border-2 border-blue-100 dark:border hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="flex justify-center mb-4 opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold homepage-gradient-text mb-2">{stat.number}</div>
                  <div className="text-sm sm:text-base text-gray-600 dark:homepage-text-muted font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Unified Background Container - From Social Proof to End */}
      <div className="relative overflow-hidden">
        {/* Background Effects - Applied to entire lower section */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-purple-100/60 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20"></div>
          
          {/* Main Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/10 dark:to-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Additional Floating Elements */}
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-gradient-to-r from-purple-500/15 to-pink-500/15 dark:from-purple-400/8 dark:to-pink-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
          <div className="absolute bottom-1/3 left-1/4 w-48 h-48 bg-gradient-to-r from-cyan-500/15 to-blue-500/15 dark:from-cyan-400/8 dark:to-blue-400/8 rounded-full blur-3xl animate-pulse delay-1500"></div>
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-r from-emerald-500/12 to-teal-500/12 dark:from-emerald-400/6 dark:to-teal-400/6 rounded-full blur-3xl animate-pulse delay-2500"></div>
          
          {/* Geometric Shapes */}
          <div className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-400/30 dark:border-blue-700/20 rounded-2xl rotate-12 animate-float bg-white/10 dark:bg-transparent backdrop-blur-sm"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-full animate-float-delayed"></div>
          <div className="absolute bottom-32 left-20 w-20 h-20 border-2 border-purple-400/30 dark:border-purple-700/20 rounded-lg rotate-45 animate-float-slow bg-white/10 dark:bg-transparent backdrop-blur-sm"></div>
          <div className="absolute top-1/2 right-10 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/10 dark:to-purple-400/10 rounded-full animate-float delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 border-2 border-cyan-400/30 dark:border-cyan-700/20 rounded-xl rotate-12 animate-float-delayed bg-white/10 dark:bg-transparent backdrop-blur-sm"></div>
          <div className="absolute top-16 left-1/3 w-40 h-40 border border-emerald-400/25 dark:border-emerald-700/15 rounded-3xl rotate-45 animate-float-slow bg-white/5 dark:bg-transparent backdrop-blur-sm"></div>
          <div className="absolute bottom-40 left-1/2 w-36 h-36 bg-gradient-to-br from-rose-500/15 to-pink-500/15 dark:from-rose-400/8 dark:to-pink-400/8 rounded-full animate-float delay-1500"></div>
          
          {/* Modern Abstract Shapes */}
          <div className="absolute top-1/3 left-16 w-24 h-32 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-tl-3xl rounded-br-3xl animate-float delay-800"></div>
          <div className="absolute bottom-1/3 right-16 w-32 h-24 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 dark:from-purple-400/10 dark:to-indigo-400/10 rounded-tr-3xl rounded-bl-3xl animate-float-delayed"></div>
          <div className="absolute top-2/3 left-1/4 w-20 h-40 bg-gradient-to-b from-emerald-400/15 to-teal-400/15 dark:from-emerald-400/8 dark:to-teal-400/8 rounded-full animate-float delay-1200"></div>
          
          {/* Particle Effect */}
          <div className="absolute inset-0">
            {useMemo(() => 
              [...Array(25)].map((_, i) => {
                const left = Math.random() * 100;
                const top = Math.random() * 100;
                const delay = Math.random() * 3;
                const duration = 2 + Math.random() * 2;
                const size = Math.random() * 3 + 1;
                
                return (
                  <div
                    key={`particle-${i}`}
                    className="absolute bg-blue-500/40 dark:bg-blue-300/20 rounded-full animate-ping"
                    style={{
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${size}px`,
                      height: `${size}px`,
                      animationDelay: `${delay}s`,
                      animationDuration: `${duration}s`
                    }}
                  ></div>
                );
              }), []
            )}
          </div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px), 
                               radial-gradient(circle at 75% 75%, #6366f1 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
              backgroundPosition: '0 0, 30px 30px'
            }}></div>
          </div>
          
          {/* Floating Lines */}
          <div className="absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform rotate-45 animate-pulse delay-1000"></div>
          <div className="absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent transform -rotate-45 animate-pulse delay-2000"></div>
          <div className="absolute top-2/3 left-0 w-24 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform rotate-12 animate-pulse delay-500"></div>
          <div className="absolute top-1/2 right-1/4 w-36 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent transform rotate-75 animate-pulse delay-1800"></div>
          <div className="absolute bottom-1/2 left-1/3 w-28 h-px bg-gradient-to-r from-transparent via-rose-400/25 to-transparent transform -rotate-30 animate-pulse delay-2200"></div>
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-blue-400/20 dark:border-blue-700/10 rounded-tl-3xl"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 border-purple-400/20 dark:border-purple-700/10 rounded-tr-3xl"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 border-cyan-400/20 dark:border-cyan-700/10 rounded-bl-3xl"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-indigo-400/20 dark:border-indigo-700/10 rounded-br-3xl"></div>
          
          {/* Modern Hexagons */}
          <div className="absolute top-1/5 right-1/5 w-12 h-12 bg-blue-400/15 dark:bg-blue-400/8 transform rotate-30 animate-float" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
          <div className="absolute bottom-1/5 left-1/5 w-16 h-16 bg-purple-400/15 dark:bg-purple-400/8 transform rotate-45 animate-float-delayed" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
          <div className="absolute top-3/5 right-1/3 w-10 h-10 bg-emerald-400/15 dark:bg-emerald-400/8 transform -rotate-15 animate-float-slow" style={{clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'}}></div>
          
          {/* Triangle Accents */}
          <div className="absolute top-1/4 right-1/4 w-8 h-8 bg-cyan-400/20 dark:bg-cyan-400/10 transform rotate-45 animate-float delay-1000" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-12 h-12 bg-rose-400/20 dark:bg-rose-400/10 transform -rotate-30 animate-float-delayed" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
          <div className="absolute top-2/3 left-1/5 w-6 h-6 bg-indigo-400/20 dark:bg-indigo-400/10 transform rotate-90 animate-float-slow delay-500" style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
          
          {/* Additional Colorful Elements for Plain Areas */}
          <div className="absolute top-1/6 left-2/3 w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 dark:from-yellow-400/10 dark:to-orange-400/10 rounded-full animate-float delay-1300"></div>
          <div className="absolute bottom-1/6 right-2/3 w-18 h-18 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/10 dark:to-emerald-400/10 rounded-lg rotate-45 animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/6 w-10 h-20 bg-gradient-to-b from-violet-400/20 to-fuchsia-400/20 dark:from-violet-400/10 dark:to-fuchsia-400/10 rounded-full animate-float-slow delay-800"></div>
          <div className="absolute bottom-1/3 right-1/6 w-22 h-22 bg-gradient-to-br from-red-400/20 to-pink-400/20 dark:from-red-400/10 dark:to-pink-400/10 rounded-2xl rotate-12 animate-float delay-1600"></div>
          
          {/* Star-like Shapes */}
          <div className="absolute top-1/3 right-1/6 w-8 h-8 bg-amber-400/25 dark:bg-amber-400/12 transform rotate-45 animate-float delay-900" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
          <div className="absolute bottom-2/5 left-1/8 w-6 h-6 bg-lime-400/25 dark:bg-lime-400/12 transform -rotate-15 animate-float-slow delay-1100" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
          
          {/* Diamond Shapes */}
          <div className="absolute top-3/4 right-1/8 w-10 h-10 bg-gradient-to-r from-sky-400/20 to-blue-400/20 dark:from-sky-400/10 dark:to-blue-400/10 transform rotate-45 animate-float delay-1400"></div>
          <div className="absolute top-1/8 left-1/2 w-8 h-8 bg-gradient-to-r from-pink-400/20 to-rose-400/20 dark:from-pink-400/10 dark:to-rose-400/10 transform rotate-45 animate-float-delayed"></div>
          <div className="absolute bottom-1/8 left-3/4 w-12 h-12 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 dark:from-teal-400/10 dark:to-cyan-400/10 transform rotate-45 animate-float-slow delay-700"></div>
          
          {/* Shining Light Effects */}
          <div className="absolute top-1/5 right-1/4 w-2 h-2 bg-white/60 dark:bg-white/30 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-1/5 left-1/4 w-1 h-1 bg-yellow-300/80 dark:bg-yellow-300/40 rounded-full animate-ping delay-1200"></div>
          <div className="absolute top-2/5 left-3/4 w-1.5 h-1.5 bg-cyan-300/70 dark:bg-cyan-300/35 rounded-full animate-ping delay-800"></div>
          <div className="absolute bottom-2/5 right-3/4 w-2.5 h-2.5 bg-pink-300/60 dark:bg-pink-300/30 rounded-full animate-ping delay-1800"></div>
          <div className="absolute top-3/5 right-1/3 w-1 h-1 bg-emerald-300/80 dark:bg-emerald-300/40 rounded-full animate-ping delay-2200"></div>
          <div className="absolute bottom-3/5 left-1/3 w-2 h-2 bg-purple-300/70 dark:bg-purple-300/35 rounded-full animate-ping delay-300"></div>
          
          {/* Wave-like Elements */}
          <div className="absolute top-2/5 right-1/12 w-16 h-4 bg-gradient-to-r from-purple-400/20 to-violet-400/20 dark:from-purple-400/10 dark:to-violet-400/10 rounded-full animate-float delay-1700"></div>
          <div className="absolute bottom-3/5 left-1/12 w-20 h-3 bg-gradient-to-r from-orange-400/20 to-red-400/20 dark:from-orange-400/10 dark:to-red-400/10 rounded-full animate-float-slow delay-300"></div>
          <div className="absolute top-4/5 left-1/4 w-14 h-5 bg-gradient-to-r from-emerald-400/20 to-green-400/20 dark:from-emerald-400/10 dark:to-green-400/10 rounded-full animate-float delay-1900"></div>
          
          {/* Cross/Plus Shapes */}
          <div className="absolute top-3/7 left-1/7 w-3 h-12 bg-yellow-400/20 dark:bg-yellow-400/10 rounded-full animate-float delay-600"></div>
          <div className="absolute top-3/7 left-1/7 w-12 h-3 bg-yellow-400/20 dark:bg-yellow-400/10 rounded-full animate-float delay-600"></div>
          <div className="absolute bottom-2/7 right-1/7 w-2 h-8 bg-cyan-400/20 dark:bg-cyan-400/10 rounded-full animate-float-slow delay-1500"></div>
          <div className="absolute bottom-2/7 right-1/7 w-8 h-2 bg-cyan-400/20 dark:bg-cyan-400/10 rounded-full animate-float-slow delay-1500"></div>
          
          {/* Flowing Energy Lines */}
          <div className="absolute top-1/8 left-1/4 w-48 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent transform rotate-25 animate-pulse delay-2300"></div>
          <div className="absolute bottom-1/8 right-1/4 w-40 h-px bg-gradient-to-r from-transparent via-rose-400/25 to-transparent transform -rotate-25 animate-pulse delay-2600"></div>
          <div className="absolute top-3/8 right-1/8 w-32 h-px bg-gradient-to-r from-transparent via-yellow-400/25 to-transparent transform rotate-60 animate-pulse delay-2900"></div>
        </div>

        {/* Social Proof */}
        <section className="relative z-10 py-16 border-t border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 tracking-wide uppercase">
              Trusted by students at top universities
            </p>
          <InfiniteMovingCards items={logos} direction="right" speed="slow" />
        </div>
      </section>

                {/* Features Section - Modern Bento Grid */}
        <section id="features" className="relative z-10 py-24 px-6">
          {/* Section-specific decorative elements */}
          <div className="absolute top-10 left-10 w-8 h-8 bg-blue-400/20 dark:bg-blue-400/10 rounded-full animate-float delay-500"></div>
          <div className="absolute top-20 right-20 w-6 h-6 bg-purple-400/20 dark:bg-purple-400/10 rounded-lg rotate-45 animate-float-delayed"></div>
          <div className="absolute bottom-10 left-1/3 w-4 h-4 bg-emerald-400/20 dark:bg-emerald-400/10 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-20 right-1/4 w-5 h-5 bg-rose-400/20 dark:bg-rose-400/10 rounded-lg rotate-12 animate-float delay-800"></div>
          
          {/* Shining lights for features */}
          <div className="absolute top-1/4 left-1/5 w-1 h-1 bg-yellow-300/80 dark:bg-yellow-300/40 rounded-full animate-ping delay-1000"></div>
          <div className="absolute top-3/4 right-1/5 w-1.5 h-1.5 bg-cyan-300/70 dark:bg-cyan-300/35 rounded-full animate-ping delay-1500"></div>
          
          <div className="max-w-7xl mx-auto relative">
            {/* Section Header */}
          <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                Everything You Need to Excel
            </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">
                Comprehensive tools designed to transform your study approach and maximize your SAT potential.
            </p>
          </div>

            {/* Modern Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                  className="group relative p-8 rounded-3xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-blue-200 dark:hover:border-blue-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-500 hover:scale-[1.02]"
              >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {React.cloneElement(feature.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
              </section>

        {/* How It Works - 3 Steps */}
        <section className="relative z-10 py-24">
          {/* Section-specific decorative elements */}
          <div className="absolute top-16 left-16 w-10 h-10 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-full animate-float delay-700"></div>
          <div className="absolute top-32 right-16 w-8 h-8 bg-gradient-to-br from-purple-400/20 to-indigo-400/20 dark:from-purple-400/10 dark:to-indigo-400/10 rounded-lg rotate-45 animate-float-delayed"></div>
          <div className="absolute bottom-16 left-1/4 w-6 h-6 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-32 right-1/4 w-7 h-7 bg-gradient-to-br from-rose-400/20 to-pink-400/20 dark:from-rose-400/10 dark:to-pink-400/10 rounded-lg rotate-30 animate-float delay-1100"></div>
          
          {/* Step connector decorations */}
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-blue-300/60 dark:bg-blue-300/30 rounded-full animate-ping delay-400"></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-indigo-300/60 dark:bg-indigo-300/30 rounded-full animate-ping delay-1200"></div>
          
          {/* Shining lights for steps */}
          <div className="absolute top-1/3 left-1/6 w-1 h-1 bg-yellow-300/80 dark:bg-yellow-300/40 rounded-full animate-ping delay-600"></div>
          <div className="absolute bottom-1/3 right-1/6 w-1.5 h-1.5 bg-purple-300/70 dark:bg-purple-300/35 rounded-full animate-ping delay-1800"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-light">
                Transform your SAT preparation in three simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Log Your Mistakes",
                  description: "Simply capture questions you get wrong during practice tests or study sessions. Our AI automatically categorizes them by topic and difficulty.",
                  icon: <ClipboardCopy className="w-8 h-8" />
                },
                {
                  step: "02", 
                  title: "Analyze Patterns",
                  description: "Get instant insights into your weak areas with advanced analytics. See exactly where you're struggling and track your improvement over time.",
                  icon: <BarChart className="w-8 h-8" />
                },
                {
                  step: "03",
                  title: "Practice Precisely",
                  description: "Generate custom quizzes targeting your specific weaknesses. Focus your study time on what matters most for maximum score improvement.",
                  icon: <Target className="w-8 h-8" />
                }
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="text-center group">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                      {step.icon}
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 tracking-wider">STEP {step.step}</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{step.description}</p>
                  </div>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 transform translate-x-4"></div>
                  )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
        <section id="testimonials" className="relative z-10 py-20">
          {/* Section-specific decorative elements */}
          <div className="absolute top-12 left-12 w-12 h-12 bg-gradient-to-br from-amber-400/20 to-yellow-400/20 dark:from-amber-400/10 dark:to-yellow-400/10 rounded-full animate-float delay-300"></div>
          <div className="absolute top-24 right-12 w-10 h-10 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/10 dark:to-emerald-400/10 rounded-lg rotate-45 animate-float-delayed"></div>
          <div className="absolute bottom-12 left-1/5 w-8 h-8 bg-gradient-to-br from-violet-400/20 to-purple-400/20 dark:from-violet-400/10 dark:to-purple-400/10 rounded-full animate-float-slow"></div>
          <div className="absolute bottom-24 right-1/5 w-9 h-9 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 dark:from-cyan-400/10 dark:to-blue-400/10 rounded-lg rotate-30 animate-float delay-900"></div>
          
          {/* Heart/Love shapes for testimonials */}
          <div className="absolute top-1/3 left-1/8 w-6 h-6 bg-red-400/25 dark:bg-red-400/12 animate-float delay-1300" style={{clipPath: 'polygon(50% 85%, 20% 40%, 50% 25%, 80% 40%)'}}></div>
          <div className="absolute bottom-1/3 right-1/8 w-5 h-5 bg-pink-400/25 dark:bg-pink-400/12 animate-float-slow delay-2000" style={{clipPath: 'polygon(50% 85%, 20% 40%, 50% 25%, 80% 40%)'}}></div>
          
          {/* Star ratings decorations */}
          <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-amber-400/30 dark:bg-amber-400/15 transform rotate-45 animate-float delay-1600" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400/30 dark:bg-yellow-400/15 transform -rotate-15 animate-float-delayed" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
          
          {/* Shining lights for testimonials */}
          <div className="absolute top-1/5 left-1/4 w-1 h-1 bg-gold-300/80 dark:bg-yellow-300/40 rounded-full animate-ping delay-800"></div>
          <div className="absolute bottom-1/5 right-1/4 w-1.5 h-1.5 bg-emerald-300/70 dark:bg-emerald-300/35 rounded-full animate-ping delay-1400"></div>
          <div className="absolute top-3/5 left-1/6 w-1 h-1 bg-pink-300/80 dark:bg-pink-300/40 rounded-full animate-ping delay-2100"></div>
          
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold homepage-gradient-text">
              Loved by Students Nationwide
            </h2>
              <p className="mt-4 text-base md:text-lg homepage-text-secondary max-w-2xl mx-auto">
              See how Thinklytics is transforming SAT prep for students just like you.
            </p>
          </div>
          <div className="relative flex h-[500px] flex-col items-center justify-center overflow-hidden rounded-lg">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </div>
      </section>

      {/* Membership Section */}
        <div className="relative z-10">
      <MembershipSection />
        </div>

      {/* FAQ Accordion */}
        <div className="relative z-10">
      <QASection />
        </div>

      {/* Call to Action */}
        <div className="relative z-10">
      <CallToAction />
        </div>

      {/* Footer */}
        <div className="relative z-10">
      <Footer />
        </div>
      </div>
    </div>
  );
};

// --- Data ---

const features = [
  {
    title: "Smart Question Logging",
    description: "Instantly capture and categorize every question you get wrong with our intelligent tagging system.",
    icon: <ClipboardCopy />,
  },
  {
    title: "AI-Powered Analytics",
    description: "Get deep insights into your performance patterns with advanced analytics and personalized recommendations.",
    icon: <BrainCircuit />,
  },
  {
    title: "Personalized Practice",
    description: "Generate custom quizzes from your error log to target your specific weaknesses and improve faster.",
    icon: <FileQuestion />,
  },
  {
    title: "Progress Tracking",
    description: "Visualize your improvement with detailed charts and track your journey to your target score.",
    icon: <BarChart />,
  },
  {
    title: "Smart Filtering",
    description: "Filter by section, topic, difficulty, and more to focus your study sessions on what matters most.",
    icon: <Filter />,
  },
  {
    title: "Goal Setting",
    description: "Set realistic targets and track your progress with intelligent goal recommendations based on your data.",
    icon: <Target />,
  },
];

const logos = [
  "Harvard",
  "Stanford", 
  "MIT",
  "Princeton",
  "Columbia",
  "Yale",
];

const testimonials = [
  {
    quote:
      "This tool was a game-changer. I was able to pinpoint exactly where I was going wrong and my score jumped 150 points!",
    name: "Sarah L.",
    title: "High School Student, California",
    avatar: "SL",
    stars: 5,
  },
  {
    quote:
      "Being able to generate quizzes from my own mistakes is brilliant. It's the most efficient way to study I've ever found.",
    name: "Michael C.",
    title: "SAT Prep Tutor",
    avatar: "MC",
    stars: 5,
  },
  {
    quote:
      "I used to dread reviewing my practice tests. Thinklytics made it simple and even a bit fun. I finally broke 1500!",
    name: "Jessica P.",
    title: "High School Student, New York",
    avatar: "JP",
    stars: 5,
  },
  {
    quote:
      "The analytics are fantastic. I could see my weak areas in the Reading section and focused my efforts there. Highly recommend.",
    name: "David H.",
    title: "High School Student, Texas",
    avatar: "DH",
    stars: 4,
  },
  {
    quote:
      "As a parent, I love that my son has a structured way to learn from his errors instead of just taking test after test.",
    name: "Emily R.",
    title: "Parent, Florida",
    avatar: "ER",
    stars: 5,
  },
];

export default Homepage; 