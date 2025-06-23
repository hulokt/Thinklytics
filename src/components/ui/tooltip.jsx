import React, { useState } from 'react';

const InfoTooltip = ({ content, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-4 h-4 rounded-full bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-white transition-colors flex items-center justify-center text-xs font-bold"
      >
        i
      </button>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -top-2 left-6 transform">
          <div className="relative">
            {/* Arrow pointing to the icon */}
            <div className="absolute -left-2 top-2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
            
            <div className="space-y-2">
              {typeof content === 'string' ? (
                <p>{content}</p>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip; 