import React, { useState, useEffect } from "react";
import { Sidebar, SidebarBody, SidebarProvider } from "./ui/sidebar";
import { 
  IconFileText, 
  IconPlayCircle, 
  IconHistory, 
  IconBarChart, 
  IconUser,
  IconLogout
} from "./ui/icons";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useAuth } from '../contexts/AuthContext';
import DarkModeToggle from './ui/DarkModeToggle';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Sun, Moon } from 'lucide-react';

export function SidebarLayout({ children, currentPage, onPageChange, onLogout, onAccountClick, onHomeClick }) {
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
                    onClick={() => onPageChange(link.page)}
                    className={`flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md transition-colors duration-300 ${
                      currentPage === link.page
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <div className={`${!open ? 'mr-2' : ''}`}>
                      {link.icon}
                    </div>
                    <span className={`text-sm transition-opacity duration-150 ${
                      open ? 'opacity-100' : 'opacity-0'
                    } group-hover/sidebar:translate-x-1`}>
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
                <div className={`flex items-center justify-center transition-colors duration-300 ${!open ? 'mr-2' : ''}`}>
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <span className={`text-sm transition-opacity duration-150 ${
                  open ? 'opacity-100' : 'opacity-0'
                } group-hover/sidebar:translate-x-1`}>
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>
              
              {/* User Account Button */}
              <button
                onClick={onAccountClick}
                className={`flex items-center justify-start gap-2 group/sidebar py-2 px-3 rounded-md w-full transition-colors duration-300 ${
                  currentPage === 'account'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                }`}
              >
                <IconUser className={`text-neutral-700 dark:text-gray-300 h-5 w-5 flex-shrink-0 transition-colors duration-300 ${!open ? 'mr-2' : ''}`} />
                <div className={`flex flex-col items-start transition-opacity duration-150 ${
                  open ? 'opacity-100' : 'opacity-0'
                } group-hover/sidebar:translate-x-1`}>
                  <span className="text-sm font-medium text-gray-800 dark:text-white transition-colors duration-300">{userData.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">{userData.email}</span>
                </div>
              </button>
              {/* Logout Button */}
              <button
                onClick={onLogout}
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

// Main content area
const Dashboard = ({ children }) => {
  return (
    <div className="flex flex-1 h-screen min-h-screen overflow-hidden">
      <div className="flex h-screen min-h-screen w-full flex-1 flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-auto">
        <div className="flex-1 h-full min-h-0 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
          {children}
        </div>
      </div>
    </div>
  );
}; 