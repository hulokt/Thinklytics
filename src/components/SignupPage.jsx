import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ArrowLeft, Eye, EyeOff, Mail, User, Lock, CheckCircle, Mail as MailIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import Navbar from './Navbar';
import ParticleUpflow from './ui/ParticleUpflow';
import { useDarkMode } from '../contexts/DarkModeContext';

const SignupPage = ({ onSignup, onSwitchToLogin, onBack }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const validate = () => {
    const errs = {};
    if (!formData.firstName) errs.firstName = 'First name is required';
    if (!formData.lastName) errs.lastName = 'Last name is required';
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear signup error when user starts typing
    if (signupError) {
      setSignupError('');
    }
  };

  const isEmailValid = (email) => {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSignupError(''); // Clear any previous signup errors
    
    try {
      const result = await onSignup(formData);
      
      // Check if signup was successful but email confirmation is required
      if (result && result.success) {
        setUserEmail(formData.email);
        setEmailSent(true);
      }
    } catch (error) {
      console.error('Signup error:', error);
      
      // Check if this is an email confirmation required error
      if (error.message && error.message.includes('confirmation link')) {
        setUserEmail(formData.email);
        setEmailSent(true);
      } else {
        setSignupError(error.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Success UI Component with modern design
  const EmailConfirmationSuccess = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full"
    >
      <div className={`rounded-2xl shadow-2xl p-8 backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-2xl before:blur-2xl before:z-0 ${
        isDarkMode 
          ? 'bg-[#111827] border border-blue-900/40 before:bg-[radial-gradient(circle,rgba(40,160,255,0.32)_0%,transparent_80%)] shadow-blue-500/30' 
          : 'bg-white/80 border border-blue-200/50 before:bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_80%)] shadow-blue-500/20'
      }`}>
        <div className="text-center mb-8 relative z-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDarkMode ? 'bg-green-900/20' : 'bg-green-100'
            }`}
          >
            <CheckCircle className={`w-10 h-10 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-2xl font-bold mb-3 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Check Your Email!
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}
          >
            We've sent a confirmation link to:
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mt-3 p-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-blue-900/20 border-blue-700' 
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <p className={`font-medium text-sm break-all ${
              isDarkMode ? 'text-blue-300' : 'text-blue-700'
            }`}>
              {userEmail}
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 relative z-10"
        >
          <div className={`flex items-start space-x-3 p-4 rounded-lg border ${
            isDarkMode 
              ? 'bg-green-900/20 border-green-700' 
              : 'bg-green-50 border-green-200'
          }`}>
            <MailIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`} />
            <div className={`text-sm ${
              isDarkMode ? 'text-green-300' : 'text-green-700'
            }`}>
              <p className="font-medium mb-1">Next Steps:</p>
              <ul className="space-y-1 text-xs">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the confirmation link in the email</li>
                <li>• Return here to sign in to your account</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                setEmailSent(false);
                setSignupError('');
                setErrors({});
              }}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Try Different Email
            </button>
            
            <button
              onClick={onSwitchToLogin}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
                isDarkMode 
                  ? 'bg-[#28A0FF] hover:bg-[#3ab6ff] text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Go to Sign In
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 text-center relative z-10"
        >
          <p className={`text-xs ${
            isDarkMode ? 'text-gray-500' : 'text-gray-600'
          }`}>
            Didn't receive the email? Check your spam folder or contact support.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );

  // If email was sent, show success UI
  if (emailSent) {
    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gradient-to-b from-[#061429] via-[#040d1c] to-black' 
          : 'bg-gradient-to-b from-blue-50 via-indigo-50 to-white'
      }`}>
        {/* Minimal Navbar */}
        <Navbar minimal={true} onLogin={onBack} />
        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <EmailConfirmationSuccess />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-[#061429] via-[#040d1c] to-black text-white' 
        : 'bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-900'
    }`}>
      {/* Navbar */}
      <Navbar />

      {/* Enhanced Background with Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-950/20 via-indigo-950/10 to-purple-950/20' 
            : 'bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-purple-100/60'
        }`}></div>
        
        {/* Main Floating Orbs */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20' 
            : 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20' 
            : 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15'
        }`}></div>
        
        {/* Additional Floating Elements */}
        <div className={`absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/15' 
            : 'bg-gradient-to-r from-purple-500/12 to-pink-500/12'
        }`}></div>
        <div className={`absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl animate-pulse delay-1500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15' 
            : 'bg-gradient-to-r from-cyan-500/12 to-blue-500/12'
        }`}></div>
        
        {/* Geometric Shapes */}
        <div className={`absolute top-20 left-10 w-32 h-32 border-2 rounded-2xl rotate-12 animate-float ${
          isDarkMode 
            ? 'border-blue-400/30 bg-transparent' 
            : 'border-blue-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 rounded-full animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' 
            : 'bg-gradient-to-br from-blue-500/15 to-indigo-500/15'
        }`}></div>
        <div className={`absolute bottom-32 left-20 w-20 h-20 border-2 rounded-lg rotate-45 animate-float-slow ${
          isDarkMode 
            ? 'border-purple-400/30 bg-transparent' 
            : 'border-purple-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        
        {/* Modern Abstract Shapes */}
        <div className={`absolute top-1/3 left-16 w-24 h-32 rounded-tl-3xl rounded-br-3xl animate-float delay-800 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20' 
            : 'bg-gradient-to-r from-blue-400/15 to-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-1/3 right-16 w-32 h-24 rounded-tr-3xl rounded-bl-3xl animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-400/20 to-indigo-400/20' 
            : 'bg-gradient-to-r from-purple-400/15 to-indigo-400/15'
        }`}></div>
        
        {/* Star-like Shapes */}
        <div className={`absolute top-1/3 right-1/6 w-8 h-8 transform rotate-45 animate-float delay-900 ${
          isDarkMode 
            ? 'bg-amber-400/25' 
            : 'bg-amber-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        <div className={`absolute bottom-2/5 left-1/8 w-6 h-6 transform -rotate-15 animate-float-slow delay-1100 ${
          isDarkMode 
            ? 'bg-lime-400/25' 
            : 'bg-lime-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        
        {/* Triangle Accents */}
        <div className={`absolute top-1/4 right-1/4 w-8 h-8 transform rotate-45 animate-float delay-1000 ${
          isDarkMode 
            ? 'bg-cyan-400/20' 
            : 'bg-cyan-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-12 h-12 transform -rotate-30 animate-float-delayed ${
          isDarkMode 
            ? 'bg-rose-400/20' 
            : 'bg-rose-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        
        {/* Shining Light Effects */}
        <div className={`absolute top-1/5 right-1/4 w-2 h-2 rounded-full animate-ping delay-500 ${
          isDarkMode ? 'bg-white/60' : 'bg-blue-300/70'
        }`}></div>
        <div className={`absolute bottom-1/5 left-1/4 w-1 h-1 rounded-full animate-ping delay-1200 ${
          isDarkMode ? 'bg-yellow-300/80' : 'bg-yellow-300/70'
        }`}></div>
        <div className={`absolute top-2/5 left-3/4 w-1.5 h-1.5 rounded-full animate-ping delay-800 ${
          isDarkMode ? 'bg-cyan-300/70' : 'bg-cyan-300/60'
        }`}></div>
        <div className={`absolute bottom-2/5 right-3/4 w-2.5 h-2.5 rounded-full animate-ping delay-1800 ${
          isDarkMode ? 'bg-pink-300/60' : 'bg-pink-300/50'
        }`}></div>
        
        {/* Particle Effect */}
        <div className="absolute inset-0">
          {useMemo(() => 
            [...Array(15)].map((_, i) => {
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              const delay = Math.random() * 3;
              const duration = 2 + Math.random() * 2;
              const size = Math.random() * 3 + 1;
              
              return (
                <div
                  key={`particle-${i}`}
                  className={`absolute rounded-full animate-ping ${
                    isDarkMode ? 'bg-blue-500/40' : 'bg-blue-500/30'
                  }`}
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
            }), [isDarkMode]
          )}
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.05]`}>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px), 
                             radial-gradient(circle at 75% 75%, #6366f1 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
          }}></div>
        </div>
        
        {/* Floating Lines */}
        <div className={`absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform rotate-45 animate-pulse delay-1000`}></div>
        <div className={`absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent transform -rotate-45 animate-pulse delay-2000`}></div>
        <div className={`absolute top-2/3 left-0 w-24 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform rotate-12 animate-pulse delay-500`}></div>
        
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 rounded-tl-3xl ${
          isDarkMode ? 'border-blue-400/20' : 'border-blue-400/15'
        }`}></div>
        <div className={`absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 rounded-tr-3xl ${
          isDarkMode ? 'border-purple-400/20' : 'border-purple-400/15'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 rounded-bl-3xl ${
          isDarkMode ? 'border-cyan-400/20' : 'border-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 rounded-br-3xl ${
          isDarkMode ? 'border-indigo-400/20' : 'border-indigo-400/15'
        }`}></div>
      </div>

      {/* Particle Animation */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none w-full flex justify-center">
        <ParticleUpflow width={320} height={320} />
      </div>

      {/* Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 pt-24 pb-8 relative min-h-screen">
        {/* Top Label */}
        <p className={`text-sm font-medium tracking-widest mb-2 ${
          isDarkMode ? 'text-[#28A0FF]' : 'text-blue-600'
        }`}>SIGN UP</p>

        {/* Heading */}
        <h1 className={`text-center font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight max-w-4xl ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Create Your Account and Start Your SAT Journey
        </h1>

        {/* Subheading */}
        <p className={`max-w-xl text-center mt-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Join thousands of students improving their SAT scores with AI-powered analytics and personalized practice.
        </p>

        {/* Form Card */}
        <div className={`mt-12 w-full max-w-md rounded-2xl shadow-2xl px-6 py-8 backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-2xl before:blur-2xl before:z-0 ${
          isDarkMode 
            ? 'bg-[#111827] border border-blue-900/40 before:bg-[radial-gradient(circle,rgba(40,160,255,0.32)_0%,transparent_80%)] shadow-blue-500/30' 
            : 'bg-white/80 border border-blue-200/50 before:bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_80%)] shadow-blue-500/20'
        }`}>
          <form className="flex flex-col space-y-6 relative" onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold uppercase mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>First Name</label>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-[#0F172A] border border-[#1e293b] placeholder-gray-500 text-white' 
                      : 'bg-gray-50 border border-gray-300 placeholder-gray-500 text-gray-900'
                  } ${
                    errors.firstName 
                      ? 'ring-2 ring-red-500 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' 
                      : isDarkMode 
                        ? 'focus:ring-[#28A0FF] focus:border-[#28A0FF]' 
                        : 'focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  value={formData.firstName}
                  onChange={e => handleInputChange('firstName', e.target.value)}
                />
                {errors.firstName && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="font-medium">{errors.firstName}</span>
                  </div>
                )}
              </div>
              <div>
                <label className={`block text-xs font-semibold uppercase mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Last Name</label>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-[#0F172A] border border-[#1e293b] placeholder-gray-500 text-white' 
                      : 'bg-gray-50 border border-gray-300 placeholder-gray-500 text-gray-900'
                  } ${
                    errors.lastName 
                      ? 'ring-2 ring-red-500 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' 
                      : isDarkMode 
                        ? 'focus:ring-[#28A0FF] focus:border-[#28A0FF]' 
                        : 'focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                />
                {errors.lastName && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="font-medium">{errors.lastName}</span>
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-xs font-semibold uppercase mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full rounded-lg px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-[#0F172A] border border-[#1e293b] placeholder-gray-500 text-white' 
                      : 'bg-gray-50 border border-gray-300 placeholder-gray-500 text-gray-900'
                  } ${
                    errors.email || (formData.email && !isEmailValid(formData.email))
                      ? 'ring-2 ring-red-500 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' 
                      : isDarkMode 
                        ? 'focus:ring-[#28A0FF] focus:border-[#28A0FF]' 
                        : 'focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value && !isEmailValid(e.target.value)) {
                      setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
                    }
                  }}
                />
                {errors.email && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="font-medium">{errors.email}</span>
                  </div>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-xs font-semibold uppercase mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`w-full rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      isDarkMode 
                        ? 'bg-[#0F172A] border border-[#1e293b] placeholder-gray-500 text-white' 
                        : 'bg-gray-50 border border-gray-300 placeholder-gray-500 text-gray-900'
                    } ${
                      errors.password 
                        ? 'ring-2 ring-red-500 border-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]' 
                        : isDarkMode 
                          ? 'focus:ring-[#28A0FF] focus:border-[#28A0FF]' 
                          : 'focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                    }`}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="font-medium">{errors.password}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-3 rounded-full font-bold uppercase tracking-wide shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-[#28A0FF] hover:bg-[#3ab6ff] text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={loading}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <p className={`text-center text-xs mt-2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              By signing up you agree to our{' '}
              <a href="#" className={`underline ${
                isDarkMode ? 'text-[#28A0FF]' : 'text-blue-600'
              }`}>Terms</a> and{' '}
              <a href="#" className={`underline ${
                isDarkMode ? 'text-[#28A0FF]' : 'text-blue-600'
              }`}>Privacy Policy</a>
            </p>
          </form>
        </div>
        <p className={`mt-8 text-sm ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} className={`font-medium ${
            isDarkMode 
              ? 'text-[#28A0FF] hover:text-[#3ab6ff]' 
              : 'text-blue-600 hover:text-blue-700'
          }`}>
            Log in
          </button>
        </p>
      </main>
    </div>
  );
};

// Enhanced Input Component
const Input = ({ className, type, icon, rightIcon, error, ...props }) => {
  return (
    <div className="relative">
      {icon && (
        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
          error ? 'text-red-400' : 'text-gray-400 dark:text-gray-500'
        }`}>
          {icon}
        </div>
      )}
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-lg border bg-white dark:bg-gray-700 px-3 py-2 text-base sm:text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error 
            ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
            : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
          icon && "pl-10",
          rightIcon && "pr-10",
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightIcon}
        </div>
      )}
    </div>
  );
};

// Label Component
const Label = ({ className, ...props }) => (
  <label
    className={cn(
      "text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
);

// Container Component
const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default SignupPage; 