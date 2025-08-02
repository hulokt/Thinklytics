import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Navbar from './Navbar';
import ParticleUpflow from './ui/ParticleUpflow';
import { useDarkMode } from '../contexts/DarkModeContext';

const LoginPage = ({ onLogin, onSwitchToSignup }) => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    await onLogin(formData);
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isEmailValid = (email) => {
    return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-b from-[#061429] via-[#040d1c] to-black text-white' 
        : 'bg-gradient-to-b from-blue-50 via-indigo-50 to-white text-gray-900'
    }`}>
      {/* Navbar */}
      <Navbar />

      {/* Star field */}
      <div className={`absolute inset-0 pointer-events-none ${
        isDarkMode 
          ? 'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]' 
          : 'bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.03)_0%,transparent_70%)]'
      }`}></div>

      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-[700px] h-[500px] rounded-full blur-3xl ${
          isDarkMode 
            ? 'bg-[radial-gradient(circle,rgba(40,160,255,0.45)_0%,transparent_70%)]' 
            : 'bg-[radial-gradient(circle,rgba(59,130,246,0.15)_0%,transparent_70%)]'
        }`}></div>
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
        <p className={`max-w-xl text-center mt-4 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Sign in to your account to access your personalized SAT dashboard.
        </p>

        {/* Form Card with modern styling */}
        <div className={`mt-12 w-full max-w-md rounded-2xl shadow-2xl px-6 py-8 backdrop-blur-sm relative before:absolute before:inset-0 before:rounded-2xl before:blur-2xl before:z-0 ${
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
            <button
              type="submit"
              className={`w-full py-3 rounded-full font-bold uppercase tracking-wide shadow-md transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
                isDarkMode 
                  ? 'bg-[#28A0FF] hover:bg-[#3ab6ff] text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Login'}
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