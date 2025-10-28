import React, { useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from './Navbar';
import ParticleUpflow from './ui/ParticleUpflow';
import { useDarkMode } from '../contexts/DarkModeContext';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const { isDarkMode } = useDarkMode();
  const { signInWithGoogle } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.email) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setLoginError(''); // Clear any previous errors
    
    try {
      await onLogin(formData);
      // If we get here, login was successful
    } catch (error) {
      setLoginError(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (loginError) {
      setLoginError('');
    }
  };

  const isEmailValid = (email) => {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setLoginError('');
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setLoginError(error.message || 'Google sign in failed. Please try again.');
      }
      // On success, the redirect happens automatically
    } catch (error) {
      console.error('Google login error:', error);
      setLoginError('Google sign in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-[#061429] via-[#040d1c] to-black text-white' 
        : 'bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-900'
    }`}>
      {/* Navbar */}
      <Navbar />

      {/* Enhanced Background with Purposeful Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Base gradient */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-950/20 via-indigo-950/10 to-purple-950/20' 
            : 'bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-purple-100/60'
        }`}></div>
        
        {/* Main Ambient Orbs - Symmetrical */}
        <div className={`absolute top-20 left-20 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-500/15 to-cyan-500/10' 
            : 'bg-gradient-to-br from-blue-400/12 to-cyan-400/8'
        }`}></div>
        <div className={`absolute bottom-20 right-20 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-indigo-500/15 to-purple-500/10' 
            : 'bg-gradient-to-br from-indigo-400/12 to-purple-400/8'
        }`}></div>
        
        {/* Subtle Grid Pattern */}
        <div className={`absolute inset-0 ${isDarkMode ? 'opacity-[0.04]' : 'opacity-[0.06]'}`}>
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(to right, ${isDarkMode ? '#3b82f6' : '#60a5fa'} 1px, transparent 1px), 
                             linear-gradient(to bottom, ${isDarkMode ? '#3b82f6' : '#60a5fa'} 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}></div>
        </div>
        
        {/* Corner Frame Elements - Purposeful Design */}
        <div className={`absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 rounded-tl-3xl ${
          isDarkMode ? 'border-blue-400/30' : 'border-blue-500/25'
        }`}></div>
        <div className={`absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 rounded-tr-3xl ${
          isDarkMode ? 'border-indigo-400/30' : 'border-indigo-500/25'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 rounded-bl-3xl ${
          isDarkMode ? 'border-cyan-400/30' : 'border-cyan-500/25'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 rounded-br-3xl ${
          isDarkMode ? 'border-purple-400/30' : 'border-purple-500/25'
        }`}></div>
        
        {/* Floating Accent Shapes - Left Side Pattern */}
        <div className={`absolute top-1/4 left-16 w-20 h-20 border-2 rounded-2xl rotate-12 animate-float ${
          isDarkMode 
            ? 'border-blue-400/40 bg-blue-500/5' 
            : 'border-blue-400/30 bg-blue-500/5'
        } backdrop-blur-sm`}></div>
        <div className={`absolute top-1/2 left-24 w-16 h-16 rounded-full animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/10' 
            : 'bg-gradient-to-br from-cyan-400/15 to-blue-400/8'
        } backdrop-blur-sm`}></div>
        <div className={`absolute top-3/4 left-12 w-12 h-12 border-2 rounded-lg rotate-45 animate-float-slow ${
          isDarkMode 
            ? 'border-indigo-400/40 bg-indigo-500/5' 
            : 'border-indigo-400/30 bg-indigo-500/5'
        } backdrop-blur-sm`}></div>
        
        {/* Floating Accent Shapes - Right Side Pattern */}
        <div className={`absolute top-1/3 right-20 w-24 h-24 border-2 rounded-2xl -rotate-12 animate-float delay-500 ${
          isDarkMode 
            ? 'border-purple-400/40 bg-purple-500/5' 
            : 'border-purple-400/30 bg-purple-500/5'
        } backdrop-blur-sm`}></div>
        <div className={`absolute top-2/3 right-16 w-14 h-14 rounded-full animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/10' 
            : 'bg-gradient-to-br from-indigo-400/15 to-purple-400/8'
        } backdrop-blur-sm`}></div>
        
        {/* Centered Decorative Elements */}
        <div className={`absolute top-32 left-1/2 -translate-x-1/2 w-1 h-24 ${
          isDarkMode ? 'bg-gradient-to-b from-blue-400/30 via-blue-400/10 to-transparent' : 'bg-gradient-to-b from-blue-500/25 via-blue-500/8 to-transparent'
        }`}></div>
        <div className={`absolute bottom-32 left-1/2 -translate-x-1/2 w-1 h-24 ${
          isDarkMode ? 'bg-gradient-to-t from-purple-400/30 via-purple-400/10 to-transparent' : 'bg-gradient-to-t from-purple-500/25 via-purple-500/8 to-transparent'
        }`}></div>
        
        {/* Subtle Light Accents - Strategic Placement */}
        <div className={`absolute top-1/4 right-1/3 w-2 h-2 rounded-full ${
          isDarkMode ? 'bg-blue-400/60 shadow-lg shadow-blue-400/40' : 'bg-blue-500/50 shadow-lg shadow-blue-500/30'
        } animate-pulse`}></div>
        <div className={`absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full ${
          isDarkMode ? 'bg-purple-400/60 shadow-lg shadow-purple-400/40' : 'bg-purple-500/50 shadow-lg shadow-purple-500/30'
        } animate-pulse delay-1000`}></div>
      </div>

      {/* Particle Animation - always under the form */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none w-full flex justify-center">
        <ParticleUpflow width={320} height={320} />
      </div>

      {/* Content */}
      <main className="flex-1 w-full flex flex-col items-center justify-center px-4 pt-24 pb-8 relative min-h-screen">
        {/* Top Label */}
        <p className={`text-sm font-medium tracking-widest mb-2 ${
          isDarkMode ? 'text-[#28A0FF]' : 'text-blue-600'
        }`}>LOGIN</p>

        {/* Heading */}
        <h1 className={`text-center font-semibold text-2xl sm:text-3xl md:text-4xl leading-tight max-w-4xl ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Welcome Back!
        </h1>

        {/* Subheading */}
        <p className={`max-w-xl text-center mt-3 text-sm sm:text-base ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Access your personalized SAT dashboard.
        </p>

        {/* Form Card with modern styling */}
        <div className={`mt-8 w-full max-w-md rounded-2xl shadow-2xl px-6 py-8 backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-2xl before:blur-2xl before:z-0 ${
          isDarkMode 
            ? 'bg-[#111827] border border-blue-900/40 before:bg-[radial-gradient(circle,rgba(40,160,255,0.32)_0%,transparent_80%)] shadow-blue-500/30' 
            : 'bg-white/80 border border-blue-200/50 before:bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_80%)] shadow-blue-500/20'
        }`}>
          <form className="flex flex-col space-y-6 relative" onSubmit={handleSubmit} autoComplete="off" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
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
                    onChange={(e) => handleInputChange('password', e.target.value)}
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
            
            {/* Login Error Display */}
            {loginError && (
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                isDarkMode 
                  ? 'bg-red-900/20 border-red-700/50 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-red-500/20' : 'bg-red-100'
                }`}>
                  <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{loginError}</p>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className={`w-full py-3 rounded-full font-bold uppercase tracking-wide shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-[#28A0FF] hover:bg-[#3ab6ff] text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={loading || googleLoading}
            >
              {loading ? 'Signing In...' : 'Login'}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className={`flex-grow border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}></div>
              <span className={`flex-shrink mx-4 text-sm ${
                isDarkMode ? 'text-gray-500' : 'text-gray-600'
              }`}>or</span>
              <div className={`flex-grow border-t ${
                isDarkMode ? 'border-gray-700' : 'border-gray-300'
              }`}></div>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className={`w-full py-3 rounded-full font-semibold flex items-center justify-center gap-3 border-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-white/5 border-gray-700 hover:bg-white/10 hover:border-gray-600 text-white' 
                  : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md text-gray-900'
              }`}
            >
              {googleLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                  <span>Signing in with Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className={`text-center text-xs mt-2 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-600'
            }`}>
              By signing in you agree to our{' '}
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
          Don&apos;t have an account?{' '}
          <button onClick={onSwitchToSignup} className={`font-medium ${
            isDarkMode 
              ? 'text-[#28A0FF] hover:text-[#3ab6ff]' 
              : 'text-blue-600 hover:text-blue-700'
          }`}>
            Create one
          </button>
        </p>
      </main>
    </div>
  );
};

export default LoginPage; 