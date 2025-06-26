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
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-24 md:h-28">
          <div className="flex items-center">
            <h1 className="text-gray-900 dark:text-white text-2xl md:text-3xl font-extrabold transition-colors duration-300">
              SAT Master Log
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="hidden sm:flex space-x-2">
              {navItems.map((item) => {
                const isCurrentPage = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`px-5 py-3 rounded-xl text-base font-semibold transition-colors duration-300 ${
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
                className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-4 py-3 text-base transition-colors duration-300"
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