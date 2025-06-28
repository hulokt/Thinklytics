import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Moon, Sun, Menu, X, ArrowLeft } from "lucide-react";

const Navbar = ({ onGetStarted, onLogin, minimal = false }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize theme from localStorage or default to dark
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
      updateTheme(isDark);
    } else if (prefersDark) {
      setIsDarkMode(true);
      updateTheme(true);
    } else {
      setIsDarkMode(false);
      updateTheme(false);
    }
  }, []);

  const updateTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    updateTheme(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    console.log("Dark mode toggled:", newMode);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (path) => {
    setIsMobileMenuOpen(false);
    if (path === '/home') {
      scrollToTop();
    } else {
      navigate(path);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo - Clickable */}
          <div 
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
            onClick={scrollToTop}
          >
            <img src="/logo.png" alt="Thinklytics Logo" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover" />
            <span className="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Thinklytics
            </span>
          </div>
          {/* Minimal mode: only show Back to Home */}
          {minimal ? (
            <Button
              variant="ghost"
              onClick={onLogin} // This will be used for back to home
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          ) : (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.path);
                    }}
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 relative group cursor-pointer bg-transparent border-none p-0"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
                  </button>
                ))}
              </div>
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  onClick={onLogin}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={onGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  Get Started
                </Button>
              </div>
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-14 h-14 flex items-center justify-center"
                >
                  {isMobileMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                </Button>
              </div>
            </>
          )}
        </div>
        {/* Mobile Menu (unchanged, only show in non-minimal mode) */}
        {!minimal && isMobileMenuOpen && (
          <div className="md:hidden py-8 border-t border-gray-200 dark:border-white/10 animate-fade-in bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-8">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.path);
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 px-4 py-4 text-xl font-medium cursor-pointer rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 bg-transparent border-none w-full text-left"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex items-center justify-between pt-8 border-t border-gray-200 dark:border-white/10">
                <Button
                  variant="ghost"
                  onClick={toggleDarkMode}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 w-16 h-16 flex items-center justify-center"
                >
                  {isDarkMode ? <Sun className="h-8 w-8" /> : <Moon className="h-8 w-8" />}
                </Button>
                <div className="flex space-x-4">
                  <Button 
                    variant="outline" 
                    onClick={onLogin}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-8 py-4 text-lg font-medium"
                  >
                    Sign In
                  </Button>
                  <Button 
                    onClick={onGetStarted}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg font-medium"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 