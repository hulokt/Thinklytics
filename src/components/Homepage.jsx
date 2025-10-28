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
  TrendingUp,
  Zap,
  Trophy,
  Users,
  Activity,
} from "lucide-react";
import { ContainerTextFlip } from "./ui/container-text-flip";

import { InfiniteMovingCards } from "./ui/InfiniteMovingCards";
import Footer from "./Footer";
import MembershipSection from "./MembershipSection";
import QASection from "./QASection";
import CallToAction from "./CallToAction";
import Navbar from "./Navbar";

const Homepage = ({ onGetStarted, onLogin }) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const [userInteracted, setUserInteracted] = React.useState(false);
  const [autoHoveredStat, setAutoHoveredStat] = React.useState(0);
  const [autoTilt, setAutoTilt] = React.useState({ x: 0, y: 0 });
  const [particlePositions, setParticlePositions] = React.useState(
    [...Array(12)].map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100
    }))
  );
  const activeCardRef = React.useRef(null);
  
  // Auto-cycle through cards
  React.useEffect(() => {
    if (userInteracted) return;
    
    const cardInterval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % 3);
      // Update particle positions
      setParticlePositions(
        [...Array(12)].map(() => ({
          x: Math.random() * 100,
          y: Math.random() * 100
        }))
      );
    }, 8000); // Change card every 8 seconds (slower)
    
    return () => clearInterval(cardInterval);
  }, [userInteracted]);
  
  // Gentle swinging animation for active card
  React.useEffect(() => {
    if (userInteracted) return;
    
    let angle = 0;
    const swingInterval = setInterval(() => {
      angle += 0.02; // Slow increment for smooth animation
      const x = Math.sin(angle) * 2; // Gentle swing -2 to +2 degrees
      const y = Math.cos(angle * 0.8) * 2.5; // Slightly different frequency
      setAutoTilt({ x, y });
    }, 50); // Update every 50ms for smooth animation
    
    return () => clearInterval(swingInterval);
  }, [userInteracted]);
  
  // Auto-hover through stats on active card
  React.useEffect(() => {
    if (userInteracted) return;
    
    const statInterval = setInterval(() => {
      setAutoHoveredStat((prev) => (prev + 1) % 3);
    }, 1500); // Change hovered stat every 1.5 seconds
    
    return () => clearInterval(statInterval);
  }, [userInteracted]);
  
  const handleUserInteraction = () => {
    setUserInteracted(true);
  };
  
  const cards = [
    {
      id: 0,
      title: "Smart Analytics",
      icon: <Activity className="w-12 h-12 stroke-[2.5]" />,
      gradient: "from-blue-600 to-indigo-600",
      darkGradient: "dark:from-blue-500 dark:to-indigo-500",
      stats: [
        { label: 'Questions Logged', value: '247' },
        { label: 'Weak Topics', value: '12' },
        { label: 'Study Streak', value: '15 days' },
      ],
      score: "1520",
      progress: 78
    },
    {
      id: 1,
      title: "AI Insights",
      icon: <Zap className="w-12 h-12 stroke-[2.5] fill-white/20" />,
      gradient: "from-purple-600 to-pink-600",
      darkGradient: "dark:from-purple-500 dark:to-pink-500",
      stats: [
        { label: 'AI Recommendations', value: '34' },
        { label: 'Pattern Matches', value: '89%' },
        { label: 'Focus Areas', value: '5' },
      ],
      score: "AI+",
      progress: 92
    },
    {
      id: 2,
      title: "Practice Quizzes",
      icon: <Trophy className="w-12 h-12 stroke-[2.5] fill-white/20" />,
      gradient: "from-emerald-600 to-teal-600",
      darkGradient: "dark:from-emerald-500 dark:to-teal-500",
      stats: [
        { label: 'Quizzes Completed', value: '42' },
        { label: 'Accuracy Rate', value: '87%' },
        { label: 'Time Saved', value: '12hrs' },
      ],
      score: "42",
      progress: 85
    }
  ];

  const nextCard = () => {
    handleUserInteraction();
    setActiveCard((prev) => (prev + 1) % cards.length);
    // Update particle positions on manual card change
    setParticlePositions(
      [...Array(12)].map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100
      }))
    );
  };

  const prevCard = () => {
    handleUserInteraction();
    setActiveCard((prev) => (prev - 1 + cards.length) % cards.length);
    // Update particle positions on manual card change
    setParticlePositions(
      [...Array(12)].map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100
      }))
    );
  };

  return (
    <div className="min-h-screen w-full homepage-bg homepage-text-primary transition-colors duration-300">
      {/* Navigation */}
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />

      {/* Hero Section - REVOLUTIONARY SPLIT DESIGN */}
      <section className="relative w-full overflow-hidden min-h-screen flex items-center">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20"></div>
          
          {/* Massive Animated Shapes */}
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-full blur-3xl" style={{animation: 'float-mega 20s ease-in-out infinite'}}></div>
          <div className="absolute -bottom-1/2 -left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10 rounded-full blur-3xl" style={{animation: 'float-mega 25s ease-in-out infinite reverse'}}></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), 
                               linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-28">
          {/* Main Hero Grid - Asymmetric Layout */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* LEFT SIDE - Content */}
            <div className="space-y-10">
              {/* Mega Headline */}
              <div className="space-y-6" style={{animation: 'fadeInUp 0.6s ease-out 0.4s both'}}>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[1.1] tracking-tight">
                  <span className="block text-gray-900 dark:text-white">
                    Transform Your
                  </span>
                  <span className="block mt-2">
                    <span className={`bg-gradient-to-r ${cards[activeCard].gradient} ${cards[activeCard].darkGradient} bg-clip-text text-transparent transition-all duration-1000`}>
                      SAT Scores
                    </span>
                  </span>
                  <span className="block mt-2 text-gray-900 dark:text-white">
                    With Data
                  </span>
                </h1>

                <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed font-medium">
                  The intelligent platform that turns your mistakes into mastery. 
                  <span className="text-gray-900 dark:text-white font-semibold"> Track, analyze, and conquer</span> the SAT with AI-powered insights.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4" style={{animation: 'fadeInUp 0.6s ease-out 0.6s both'}}>
                <button
                  onClick={onGetStarted}
                  className={`group relative px-8 py-5 rounded-2xl bg-gradient-to-r ${cards[activeCard].gradient} ${cards[activeCard].darkGradient} text-white font-bold text-lg shadow-2xl transition-all duration-500 hover:scale-105 overflow-hidden ${!userInteracted ? 'animate-soft-pulse' : ''}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${cards[activeCard].gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <div className="relative flex items-center justify-center gap-3">
                    <span>Get Started Free</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={onLogin}
                  className="px-8 py-5 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white font-bold text-lg hover:border-blue-400 dark:hover:border-blue-600 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                >
                  Sign In
                </button>
              </div>

              {/* Trust Indicators - Compact Stats */}
              <div className="flex flex-wrap items-center gap-8 pt-6" style={{animation: 'fadeInUp 0.6s ease-out 0.8s both'}}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">10K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Students</div>
                  </div>
                </div>

                <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">+150</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Avg Boost</div>
                  </div>
                </div>

                <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">95%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Success</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - Interactive 3D Card Carousel */}
            <div className="relative" style={{animation: 'fadeInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both'}}>
              <div className="relative w-full max-w-[600px] mx-auto h-[650px]" style={{perspective: '2000px'}}>
                {/* Multi-Layer Background Glow - Dynamic based on active card */}
                <div className="absolute inset-0" style={{transformStyle: 'preserve-3d'}}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${cards[activeCard].gradient}/30 ${cards[activeCard].darkGradient}/20 rounded-[40%] blur-[100px] transition-all duration-1000 ease-out`} 
                    style={{
                      animation: 'organic-pulse 6s cubic-bezier(0.45, 0, 0.55, 1) infinite',
                      transform: 'translateZ(-50px) scale(1.2)'
                    }}></div>
                  <div className={`absolute inset-0 bg-gradient-to-tl ${cards[activeCard].gradient}/20 ${cards[activeCard].darkGradient}/10 rounded-[50%] blur-[80px] transition-all duration-1000 ease-out`} 
                    style={{
                      animation: 'organic-pulse 8s cubic-bezier(0.45, 0, 0.55, 1) infinite reverse',
                      transform: 'translateZ(-30px) scale(1.1)',
                      animationDelay: '1s'
                    }}></div>
                </div>

                {/* Card Stack - All 3 cards positioned with 3D transforms */}
                <div className="relative w-full h-full flex items-center justify-center" style={{transformStyle: 'preserve-3d'}}>
                  {cards.map((card, index) => {
                    const offset = index - activeCard;
                    const isActive = index === activeCard;
                    const isPrev = offset === -1 || (activeCard === 0 && index === cards.length - 1);
                    const isNext = offset === 1 || (activeCard === cards.length - 1 && index === 0);
                    
                    let transform = 'translateX(0) translateZ(0) rotateY(0deg) scale(1)';
                    let opacity = 1;
                    let zIndex = 30;
                    let filter = 'blur(0px)';
                    
                    if (isPrev) {
                      transform = 'translateX(-320px) translateZ(-200px) rotateY(25deg) scale(0.85)';
                      opacity = 0.3;
                      zIndex = 10;
                      filter = 'blur(2px)';
                    } else if (isNext) {
                      transform = 'translateX(320px) translateZ(-200px) rotateY(-25deg) scale(0.85)';
                      opacity = 0.3;
                      zIndex = 10;
                      filter = 'blur(2px)';
                    } else if (!isActive) {
                      transform = 'translateX(0) translateZ(-400px) rotateY(0deg) scale(0.7)';
                      opacity = 0;
                      zIndex = 0;
                      filter = 'blur(5px)';
                    }

                    return (
                      <div
                        key={card.id}
                        ref={isActive ? activeCardRef : null}
                        className="absolute w-96 h-[540px] rounded-3xl bg-white dark:bg-gray-900 shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 cursor-pointer group"
                        onClick={() => {
                          handleUserInteraction();
                          setActiveCard(index);
                          // Update particle positions
                          setParticlePositions(
                            [...Array(12)].map(() => ({
                              x: Math.random() * 100,
                              y: Math.random() * 100
                            }))
                          );
                        }}
                        style={{
                          transform: isActive && !userInteracted 
                            ? `translateX(0) translateZ(0) rotateX(${autoTilt.x}deg) rotateY(${autoTilt.y}deg) scale(1.01)` 
                            : transform,
                          opacity,
                          zIndex,
                          filter,
                          transformStyle: 'preserve-3d',
                          transition: 'all 0.9s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          boxShadow: isActive 
                            ? '0 40px 80px -20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)' 
                            : '0 20px 40px -10px rgba(0,0,0,0.2)'
                        }}
                        onMouseMove={(e) => {
                          if (!isActive) return;
                          handleUserInteraction();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const x = e.clientX - rect.left;
                          const y = e.clientY - rect.top;
                          const centerX = rect.width / 2;
                          const centerY = rect.height / 2;
                          const rotateX = (y - centerY) / 30;
                          const rotateY = (centerX - x) / 30;
                          e.currentTarget.style.transform = `translateX(0) translateZ(0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) return;
                          e.currentTarget.style.transform = 'translateX(0) translateZ(0) rotateX(0deg) rotateY(0deg) scale(1)';
                        }}
                      >
                        {/* Dashboard Header with gradient overlay */}
                        <div className={`bg-gradient-to-r ${card.gradient} ${card.darkGradient} p-6 relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                          <div className="relative flex items-center justify-between text-white" 
                            style={{
                              transform: isActive ? 'translateZ(20px)' : 'translateZ(0)',
                              transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                            }}>
                            <div>
                              <div className="text-sm font-medium opacity-90 tracking-wide">{card.title}</div>
                              <div className={`text-6xl font-black mt-2 tracking-tight transition-all duration-500 ${
                                !userInteracted && isActive ? 'scale-105' : ''
                              }`}
                                style={{
                                  animation: isActive ? 'number-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
                                  textShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                }}
                                onMouseEnter={handleUserInteraction}
                              >{card.score}</div>
                            </div>
                            <div className={`w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-500 ${
                              !userInteracted && isActive ? 'scale-110 rotate-12' : 'group-hover:scale-110 group-hover:rotate-12'
                            }`}
                              style={{
                                animation: isActive ? 'icon-float 3s ease-in-out infinite' : 'none'
                              }}
                              onMouseEnter={handleUserInteraction}
                            >
                              {card.icon}
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid with stagger animation */}
                        <div className="p-6 space-y-4">
                          {card.stats.map((stat, i) => {
                            const isAutoHovered = !userInteracted && isActive && i === autoHoveredStat;
                            return (
                              <div key={i} 
                                className={`flex items-center justify-between p-4 rounded-xl group/stat transition-all duration-300 ${
                                  isAutoHovered 
                                    ? 'bg-gray-100 dark:bg-gray-750 scale-[1.02] shadow-lg' 
                                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 hover:scale-[1.02] hover:shadow-lg'
                                }`}
                                style={{
                                  animation: isActive ? `slide-in-stat 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both` : 'none',
                                  transform: isActive ? 'translateZ(10px)' : 'translateZ(0)'
                                }}
                                onMouseEnter={handleUserInteraction}
                              >
                                <span className={`text-gray-700 dark:text-gray-300 font-medium transition-transform duration-300 ${
                                  isAutoHovered ? 'translate-x-1' : 'group-hover/stat:translate-x-1'
                                }`}>{stat.label}</span>
                                <span className={`text-xl font-black bg-gradient-to-r ${card.gradient} ${card.darkGradient} bg-clip-text text-transparent transition-transform duration-300 ${
                                  isAutoHovered ? 'scale-110' : 'group-hover/stat:scale-110'
                                }`}>
                                  {stat.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress Bar with liquid animation */}
                        <div className="px-6 pb-6" onMouseEnter={handleUserInteraction}>
                          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                            <span>Overall Progress</span>
                            <span className={`text-xs font-bold bg-gradient-to-r ${card.gradient} ${card.darkGradient} bg-clip-text text-transparent transition-all duration-500 ${
                              !userInteracted && isActive ? 'scale-110' : ''
                            }`}
                              style={{
                                animation: isActive ? 'counter-up 1s ease-out 0.5s both' : 'none'
                              }}>
                              {card.progress}%
                            </span>
                          </div>
                          <div className={`h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden relative transition-all duration-500 ${
                            !userInteracted && isActive ? 'scale-y-110' : ''
                          }`}>
                            <div 
                              className={`h-full bg-gradient-to-r ${card.gradient} ${card.darkGradient} rounded-full relative`}
                              style={{
                                width: isActive ? `${card.progress}%` : '0%',
                                transition: 'width 1.2s cubic-bezier(0.65, 0, 0.35, 1) 0.3s',
                              }}>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" 
                                style={{
                                  animation: isActive ? 'progress-shine 2s ease-in-out infinite' : 'none'
                                }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Magnetic hover effect for non-active cards */}
                        {!isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/30 via-black/20 to-transparent backdrop-blur-sm opacity-0 hover:opacity-100 transition-all duration-500">
                            <div className={`px-6 py-3 rounded-full bg-gradient-to-r ${card.gradient} ${card.darkGradient} text-white font-bold shadow-2xl transform hover:scale-110 transition-transform duration-300`}
                              style={{animation: 'bounce-gentle 2s ease-in-out infinite'}}>
                              Click to View
                            </div>
                          </div>
                        )}

                        {/* Ambient light effect on active card */}
                        {isActive && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className={`absolute top-0 left-0 w-32 h-32 bg-gradient-to-br ${card.gradient}/20 blur-2xl rounded-full`}
                              style={{animation: 'ambient-light-1 4s ease-in-out infinite'}}></div>
                            <div className={`absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl ${card.gradient}/15 blur-2xl rounded-full`}
                              style={{animation: 'ambient-light-2 5s ease-in-out infinite'}}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Auto-play indicator */}
                <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-gradient-to-r ${cards[activeCard].gradient} backdrop-blur-sm border border-white/20 shadow-2xl transition-all duration-1000 ${
                  !userInteracted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    <span>Auto-playing • Move mouse to take control</span>
                  </div>
                </div>

                {/* Enhanced Navigation Controls */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-6 z-40">
                  {/* Previous Button */}
                  <button
                    onClick={prevCard}
                    className="w-16 h-16 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:scale-110 hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                    <ChevronDown className="w-7 h-7 text-gray-700 dark:text-gray-300 rotate-90 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors relative z-10 group-hover/btn:-translate-x-1 transition-transform duration-300" />
                  </button>

                  {/* Dots Indicator with morphing animation */}
                  <div className="flex gap-3 px-6 py-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
                    {cards.map((card, index) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          handleUserInteraction();
                          setActiveCard(index);
                          // Update particle positions
                          setParticlePositions(
                            [...Array(12)].map(() => ({
                              x: Math.random() * 100,
                              y: Math.random() * 100
                            }))
                          );
                        }}
                        className={`transition-all duration-700 rounded-full relative ${
                          index === activeCard 
                            ? `w-12 h-3.5 bg-gradient-to-r ${card.gradient} ${card.darkGradient} shadow-lg` 
                            : 'w-3.5 h-3.5 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-125'
                        }`}
                        style={{
                          transform: index === activeCard ? 'scale(1)' : 'scale(1)',
                          transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        {index === activeCard && (
                          <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${card.gradient} ${card.darkGradient} blur-md opacity-60`}></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={nextCard}
                    className="w-16 h-16 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 flex items-center justify-center hover:scale-110 hover:bg-white dark:hover:bg-gray-800 transition-all duration-500 group/btn relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700"></div>
                    <ChevronDown className="w-7 h-7 text-gray-700 dark:text-gray-300 -rotate-90 group-hover/btn:text-blue-600 dark:group-hover/btn:text-blue-400 transition-colors relative z-10 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>

                {/* Organic Floating Particles - Move only on card switch */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {particlePositions.map((pos, i) => {
                    const size = 4 + (i % 3) * 2;
                    const depth = (i % 5) * 20 - 50;
                    const blurAmount = 1 + (i % 3);
                    
                    return (
                      <div
                        key={i}
                        className={`absolute rounded-full bg-gradient-to-br ${cards[activeCard].gradient} ${cards[activeCard].darkGradient}`}
                        style={{
                          width: `${size}px`,
                          height: `${size}px`,
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          transform: `translateZ(${depth}px)`,
                          opacity: 0.4 + (i % 4) * 0.1,
                          filter: `blur(${blurAmount}px)`,
                          transition: 'all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      ></div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes soft-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
          .animate-soft-pulse { animation: soft-pulse 2.5s ease-in-out infinite; }
          @keyframes float-mega {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(-30px, -40px) scale(1.05); }
            66% { transform: translate(20px, -30px) scale(1.08); }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(50px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          /* New Sophisticated Animations */
          @keyframes organic-pulse {
            0%, 100% { 
              transform: translateZ(-50px) scale(1.2) rotate(0deg);
              border-radius: 40%;
            }
            25% { 
              transform: translateZ(-40px) scale(1.25) rotate(2deg);
              border-radius: 45%;
            }
            50% { 
              transform: translateZ(-45px) scale(1.3) rotate(-1deg);
              border-radius: 35%;
            }
            75% { 
              transform: translateZ(-42px) scale(1.22) rotate(1deg);
              border-radius: 42%;
            }
          }

          @keyframes number-pop {
            0% {
              transform: scale(0.8);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }

          @keyframes icon-float {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            25% {
              transform: translateY(-8px) rotate(3deg);
            }
            50% {
              transform: translateY(-4px) rotate(-2deg);
            }
            75% {
              transform: translateY(-10px) rotate(1deg);
            }
          }

          @keyframes slide-in-stat {
            from {
              opacity: 0;
              transform: translateX(-30px) translateZ(0px);
            }
            to {
              opacity: 1;
              transform: translateX(0) translateZ(10px);
            }
          }

          @keyframes counter-up {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes progress-shine {
            0% {
              transform: translateX(-100%) skewX(-15deg);
            }
            100% {
              transform: translateX(200%) skewX(-15deg);
            }
          }

          @keyframes bounce-gentle {
            0%, 100% {
              transform: scale(1) translateY(0);
            }
            50% {
              transform: scale(1.05) translateY(-5px);
            }
          }

          @keyframes ambient-light-1 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.3;
            }
            25% {
              transform: translate(20px, -10px) scale(1.2);
              opacity: 0.4;
            }
            50% {
              transform: translate(10px, -20px) scale(1.1);
              opacity: 0.35;
            }
            75% {
              transform: translate(-5px, -15px) scale(1.15);
              opacity: 0.38;
            }
          }

          @keyframes ambient-light-2 {
            0%, 100% {
              transform: translate(0, 0) scale(1);
              opacity: 0.25;
            }
            33% {
              transform: translate(-15px, 10px) scale(1.15);
              opacity: 0.35;
            }
            66% {
              transform: translate(-25px, 5px) scale(1.25);
              opacity: 0.3;
            }
          }

          @keyframes organic-float-0 {
            0%, 100% {
              transform: translate(0, 0) translateZ(var(--depth)) rotate(0deg);
            }
            25% {
              transform: translate(15px, -20px) translateZ(calc(var(--depth) * 1.2)) rotate(90deg);
            }
            50% {
              transform: translate(30px, -10px) translateZ(var(--depth)) rotate(180deg);
            }
            75% {
              transform: translate(10px, -30px) translateZ(calc(var(--depth) * 0.8)) rotate(270deg);
            }
          }

          @keyframes organic-float-1 {
            0%, 100% {
              transform: translate(0, 0) translateZ(var(--depth)) rotate(0deg) scale(1);
            }
            33% {
              transform: translate(-20px, 25px) translateZ(calc(var(--depth) * 1.3)) rotate(120deg) scale(1.2);
            }
            66% {
              transform: translate(-10px, -15px) translateZ(calc(var(--depth) * 0.7)) rotate(240deg) scale(0.9);
            }
          }

          @keyframes organic-float-2 {
            0%, 100% {
              transform: translate(0, 0) translateZ(var(--depth)) skew(0deg);
            }
            20% {
              transform: translate(25px, 15px) translateZ(calc(var(--depth) * 1.4)) skew(5deg);
            }
            40% {
              transform: translate(-15px, 30px) translateZ(calc(var(--depth) * 0.6)) skew(-3deg);
            }
            60% {
              transform: translate(10px, -20px) translateZ(calc(var(--depth) * 1.1)) skew(2deg);
            }
            80% {
              transform: translate(-25px, -10px) translateZ(calc(var(--depth) * 0.9)) skew(-4deg);
            }
          }

          @keyframes organic-float-3 {
            0%, 100% {
              transform: translate(0, 0) translateZ(var(--depth)) rotate(0deg);
            }
            30% {
              transform: translate(-18px, -25px) translateZ(calc(var(--depth) * 1.5)) rotate(-60deg);
            }
            60% {
              transform: translate(22px, 18px) translateZ(calc(var(--depth) * 0.5)) rotate(60deg);
            }
          }
        `}</style>
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