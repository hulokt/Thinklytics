import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarProvider } from "./ui/sidebar";
import { 
  IconFileText, 
  IconPlayCircle, 
  IconHistory, 
  IconBarChart, 
  IconUser,
  IconLogout,
  IconStar
} from "./ui/icons";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useAuth } from '../contexts/AuthContext';
import DarkModeToggle from './ui/DarkModeToggle';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Sun, Moon } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';

export function SidebarLayout({ children, currentPage, onPageChange, onLogout, onAccountClick, onProfileClick, onHomeClick }) {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState({ name: 'User', email: '' });
  const { user } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const loadUserData = () => {
      if (user) {
        setUserData({
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || ''
        });
      }
    };

    loadUserData();
  }, [user]);

  const links = [
    {
      label: "Question Logger",
      page: "question-logger",
      icon: (
        <IconFileText className="h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300 transition-colors duration-300" />
      ),
    },
    {
      label: "Quiz",
      page: "question-selector",
      icon: (
        <IconPlayCircle className="h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300 transition-colors duration-300" />
      ),
    },
    {
      label: "Quiz History",
      page: "quiz-history",
      icon: (
        <IconHistory className="h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300 transition-colors duration-300" />
      ),
    },
    {
      label: "Analytics",
      page: "analytics",
      icon: (
        <IconBarChart className="h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300 transition-colors duration-300" />
      ),
    },
    {
      label: "Calendar",
      page: "calendar",
      icon: (
        <CalendarIcon className="h-5 w-5 shrink-0 text-gray-700 dark:text-gray-300 transition-colors duration-300" />
      ),
    },
  ];
  
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-full flex-1 flex-col overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300 md:flex-row",
        "h-screen min-h-screen fixed inset-0"
      )}
    >
      <SidebarProvider open={open} setOpen={setOpen}>
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {open ? <Logo onLogout={onLogout} /> : <LogoIcon onLogout={onLogout} />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onPageChange(link.page);
                      // Close mobile sidebar after navigation
                      if (window.innerWidth < 768) {
                        setOpen(false);
                      }
                    }}
                    className={`flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md transition-colors duration-300 ${
                      currentPage === link.page
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className="shrink-0">
                      {link.icon}
                    </div>
                    <span
                      className={cn(
                        "text-sm whitespace-nowrap overflow-hidden origin-left transform-gpu transition-all duration-300",
                        open
                          ? "opacity-100 scale-x-100 ml-2"
                          : "opacity-0 scale-x-0 ml-0"
                      )}
                    >
                      {link.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md w-full transition-colors duration-300 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <div className="shrink-0">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm whitespace-nowrap overflow-hidden origin-left transform-gpu transition-all duration-300",
                    open
                      ? "opacity-100 scale-x-100 ml-2"
                      : "opacity-0 scale-x-0 ml-0"
                  )}
                >
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>
              
              {/* Profile/Rank Button */}
              <button
                onClick={() => {
                  onProfileClick();
                  // Close mobile sidebar after navigation
                  if (window.innerWidth < 768) {
                    setOpen(false);
                  }
                }}
                className={`flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md w-full transition-colors duration-300 ${
                  currentPage === 'profile'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <div className={`${!open ? 'mr-2' : ''}`}>
                  <IconStar className="text-yellow-600 dark:text-yellow-400 h-5 w-5 flex-shrink-0 transition-colors duration-300" />
                </div>
                <motion.div
                  initial={false}
                  animate={open ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.3 }}
                  className="origin-left whitespace-nowrap overflow-hidden ml-2"
                >
                  <span className="flex text-sm font-medium text-gray-800 dark:text-white">
                    My Rank
                  </span>
                  <span className="flex text-xs text-gray-500 dark:text-gray-400">
                    View Points & Stats
                  </span>
                </motion.div>
              </button>
              
              {/* User Account Button */}
              <button
                onClick={() => {
                  onAccountClick();
                  // Close mobile sidebar after navigation
                  if (window.innerWidth < 768) {
                    setOpen(false);
                  }
                }}
                className={`flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md w-full transition-colors duration-300 ${
                  currentPage === 'account'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <IconUser className="text-neutral-700 dark:text-gray-300 h-5 w-5 flex-shrink-0 transition-colors duration-300" />
                <motion.div
                  initial={false}
                  animate={open ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
                  transition={{ duration: 0.3 }}
                  className="origin-left whitespace-nowrap overflow-hidden ml-2"
                >
                  <span className="flex text-sm font-medium text-gray-800 dark:text-white">
                    {userData.name}
                  </span>
                  <span className="flex text-xs text-gray-500 dark:text-gray-400">
                    {userData.email}
                  </span>
                </motion.div>
              </button>
              {/* Logout Button */}
              <button
                onClick={() => {
                  onLogout();
                  // Close mobile sidebar after logout
                  if (window.innerWidth < 768) {
                    setOpen(false);
                  }
                }}
                className="hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 py-2 px-3 transition-colors duration-300"
              >
                <IconLogout className={`h-5 w-5 shrink-0 text-red-600 dark:text-red-400 transition-colors duration-300 ${!open ? 'mr-2' : ''}`} />
              </button>
            </div>
          </SidebarBody>
        </Sidebar>
      </SidebarProvider>
      <Dashboard>{children}</Dashboard>
    </div>
  );
}

export const Logo = ({ onLogout }) => {
  const handleClick = () => {
    console.log('🏠 Logo (expanded) clicked! Calling onLogout...');
    if (onLogout) {
      onLogout();
    } else {
      console.error('🏠 onLogout is not defined!');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative z-20 flex items-center space-x-3 py-3 px-2 w-full text-left hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors duration-300"
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
        <div className="h-6 w-6 bg-white rounded-lg flex items-center justify-center">
          <div className="h-3 w-3 bg-blue-600 rounded-sm"></div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col"
      >
        <span className="font-bold text-lg text-gray-800 dark:text-white transition-colors duration-300">
          Redomind
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Study Platform
        </span>
      </motion.div>
    </button>
  );
};

export const LogoIcon = ({ onLogout }) => {
  const handleClick = () => {
    console.log('🏠 LogoIcon (collapsed) clicked! Calling onLogout...');
    if (onLogout) {
      onLogout();
    } else {
      console.error('🏠 onLogout is not defined!');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative z-20 flex items-center justify-center py-3 px-2 w-full hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors duration-300"
    >
      <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
        <div className="h-6 w-6 bg-white rounded-lg flex items-center justify-center">
          <div className="h-3 w-3 bg-blue-600 rounded-sm"></div>
        </div>
      </div>
    </button>
  );
};

// Main content area - Modified for mobile scrolling
const Dashboard = ({ children }) => {
  return (
    <div className="flex flex-1 h-screen min-h-screen overflow-hidden sm:h-screen sm:min-h-screen sm:overflow-hidden">
      <div className="flex h-auto min-h-screen w-full flex-1 flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-y-auto sm:h-screen sm:min-h-screen sm:overflow-hidden">
        <div className="flex-1 h-auto min-h-0 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 overflow-y-auto sm:h-full sm:overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};