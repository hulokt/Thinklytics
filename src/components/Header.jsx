import React from 'react';
import DarkModeToggle from './ui/DarkModeToggle';

const Header = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'question-logger', label: 'Question Logger' },
    { id: 'question-selector', label: 'Quiz' },
    { id: 'quiz-history', label: 'Quiz History' },
    { id: 'analytics', label: 'Analytics' }
  ];

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-gray-900 dark:text-white text-lg sm:text-xl font-bold transition-colors duration-300">
              SAT Master Log
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <nav className="hidden sm:flex space-x-1">
              {navItems.map((item) => {
                const isCurrentPage = currentPage === item.id;
                
                return (
                <button
                  key={item.id}
                  onClick={() => onPageChange(item.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                      isCurrentPage
                      ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </button>
                );
              })}
            </nav>
            
            {/* Mobile Navigation Menu */}
            <div className="sm:hidden">
              <select 
                value={currentPage} 
                onChange={(e) => onPageChange(e.target.value)}
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm transition-colors duration-300"
              >
                {navItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
            
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 