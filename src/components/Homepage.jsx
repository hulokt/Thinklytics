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
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
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

      {/* Problem → Solution Strip */}
      <ProblemSolutionStrip />

      {/* Infinite Scroll Logos */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-center text-sm font-semibold homepage-text-muted mb-6 tracking-wide">
            AS SEEN IN TOP EDUCATIONAL RESOURCES
          </h3>
          <InfiniteMovingCards items={logos} direction="right" speed="slow" />
        </div>
      </section>

      {/* Features Bento Grid - MODERNIZED */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold homepage-gradient-text mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl homepage-text-secondary max-w-3xl mx-auto">
              Comprehensive tools designed to help you identify weaknesses, track progress, and achieve your target score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl homepage-card backdrop-blur-sm border homepage-hover-glow transition-all duration-500"
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-[var(--brand-10)] dark:to-[var(--brand-20)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl homepage-feature-icon flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold homepage-text-primary mb-4">{feature.title}</h3>
                  <p className="homepage-text-secondary leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold blue-gradient-text">
              Loved by Students Nationwide
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
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
      <MembershipSection />

      {/* FAQ Accordion */}
      <QASection />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// --- Bento Grid Components ---

const MockQuizChart = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-50 dark:from-white/5 to-blue-100 dark:to-white/10 p-4 relative overflow-hidden">
    <div className="w-1/3 pr-2">
      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">Score</p>
      <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">88%</p>
      <p className="text-xs text-blue-800 dark:text-blue-300/80">+12%</p>
    </div>
    <div className="w-2/3 flex items-end">
      <div className="w-full h-full flex items-end gap-1">
        {[40, 60, 50, 75, 88].map((h, i) => (
          <div key={i} className="flex-1 bg-blue-300/70 dark:bg-blue-500/60 rounded-t-sm" style={{ height: `${h}%` }}></div>
        ))}
      </div>
    </div>
  </div>
);

const MockQuestionList = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-50 dark:from-white/5 to-indigo-100 dark:to-white/10 p-2 space-y-1">
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Standard Model
    </div>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Heart of Algebra
    </div>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Words in Context
    </div>
  </div>
);

const MockPersonalizedQuiz = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-50 dark:from-white/5 to-amber-100 dark:to-white/10 p-3 flex flex-col justify-center items-center text-center">
    <FileQuestion className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-1" />
    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
      10 Question Quiz
    </p>
    <p className="text-xs text-amber-800 dark:text-amber-300">
      from your error log
    </p>
  </div>
);

const MockAiInsights = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-50 dark:from-white/5 to-emerald-100 dark:to-white/10 p-2 flex-col space-y-1">
    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1 px-1">
      AI Suggestion:
    </p>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-emerald-900 dark:text-emerald-200">
      Focus on 'Heart of Algebra'
    </div>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-emerald-900 dark:text-emerald-200">
      Review comma usage rules
    </div>
  </div>
);

const MockFilterPills = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-50 dark:from-white/5 to-blue-100 dark:to-white/10 p-3 flex flex-wrap gap-2 content-start">
    <span className="bg-blue-200/50 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Reading
    </span>
    <span className="bg-blue-200/50 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Math
    </span>
    <span className="bg-blue-200/50 dark:bg-blue-500/20 text-blue-900 dark:text-blue-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Hard
    </span>
    <span className="bg-white/50 dark:bg-white/10 rounded-full px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
      Medium
    </span>
    <span className="bg-white/50 dark:bg-white/10 rounded-full px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
      Algebra
    </span>
  </div>
);

const features = [
  {
    title: "Smart Question Logging",
    description: "Instantly capture and categorize every question you get wrong with our intelligent tagging system.",
    icon: <ClipboardCopy className="w-7 h-7 text-white" />,
  },
  {
    title: "AI-Powered Analytics",
    description: "Get deep insights into your performance patterns with advanced analytics and personalized recommendations.",
    icon: <BrainCircuit className="w-7 h-7 text-white" />,
  },
  {
    title: "Personalized Practice",
    description: "Generate custom quizzes from your error log to target your specific weaknesses and improve faster.",
    icon: <FileQuestion className="w-7 h-7 text-white" />,
  },
  {
    title: "Progress Tracking",
    description: "Visualize your improvement with detailed charts and track your journey to your target score.",
    icon: <BarChart className="w-7 h-7 text-white" />,
  },
  {
    title: "Smart Filtering",
    description: "Filter by section, topic, difficulty, and more to focus your study sessions on what matters most.",
    icon: <Filter className="w-7 h-7 text-white" />,
  },
  {
    title: "Goal Setting",
    description: "Set realistic targets and track your progress with intelligent goal recommendations based on your data.",
    icon: <Target className="w-7 h-7 text-white" />,
  },
];

const logos = [
  "KHAN ACADEMY",
  "COLLEGE BOARD",
  "THE PRINCETON REVIEW",
  "KAPLAN",
  "BARRON'S",
  "VARSITY TUTORS",
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

// --- New Sections and Footer ---

// Problem → Solution Strip
const ProblemSolutionStrip = () => (
  <section className="relative z-20 -mt-16 sm:-mt-24 flex justify-center w-full px-4">
    <div className="max-w-4xl w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          { 
            solution: "Auto-logged mistakes", 
            icon: (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
            description: "Smart categorization",
            color: "blue"
          },
          { 
            solution: "Instant analytics", 
            icon: (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            ),
            description: "Real-time insights",
            color: "green"
          },
          { 
            solution: "Personalized quizzes", 
            icon: (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            description: "Targeted practice",
            color: "amber"
          }
        ].map((block, i) => (
          <div
            key={i}
            className="group relative p-6 sm:p-8 rounded-3xl homepage-card backdrop-blur-sm border homepage-hover-glow transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-[var(--brand-10)] dark:to-[var(--brand-20)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white group-hover:scale-110 transition-transform duration-300 ${
                block.color === 'blue' ? 'bg-blue-600 dark:bg-blue-500' :
                block.color === 'green' ? 'bg-green-600 dark:bg-green-500' :
                'bg-amber-600 dark:bg-amber-500'
              }`}>
                {block.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold homepage-text-primary mb-2">{block.solution}</h3>
              <p className="text-xs sm:text-sm homepage-text-muted">{block.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Homepage; 