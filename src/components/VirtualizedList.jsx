import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useVirtualList, useDebouncedSearch } from '../utils/memoryOptimization';

const VirtualizedList = ({
  items = [],
  itemHeight = 80,
  containerHeight = 400,
  renderItem,
  searchTerm = '',
  filterFunction = () => true,
  className = '',
  loadingComponent = null,
  emptyComponent = null
}) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Debounce search to avoid excessive filtering
  const debouncedSearchTerm = useDebouncedSearch(searchTerm, 200);
  
  // Memoized filtered items
  const filteredItems = useMemo(() => {
    let result = Array.isArray(items) ? items : [];
    
    // Apply search filter
    if (debouncedSearchTerm) {
      result = result.filter(item => {
        const searchText = debouncedSearchTerm.toLowerCase();
        return (
          (item.questionText && item.questionText.toLowerCase().includes(searchText)) ||
          (item.passageText && item.passageText.toLowerCase().includes(searchText)) ||
          (item.section && item.section.toLowerCase().includes(searchText)) ||
          (item.domain && item.domain.toLowerCase().includes(searchText)) ||
          (item.questionType && item.questionType.toLowerCase().includes(searchText))
        );
      });
    }
    
    // Apply additional filter
    return result.filter(filterFunction);
  }, [items, debouncedSearchTerm, filterFunction]);
  
  // Use virtual list hook
  const { visibleItems, totalHeight, offsetY } = useVirtualList(
    filteredItems, 
    itemHeight, 
    containerHeight
  );
  
  // Handle scroll events
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
  }, []);
  
  // Update scroll position in virtual list
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTop;
    }
  }, [scrollTop]);
  
  // Loading state
  if (!items) {
    return loadingComponent || (
      <div className="flex items-center justify-center" style={{ height: containerHeight }}>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }
  
  // Empty state
  if (filteredItems.length === 0) {
    return emptyComponent || (
      <div className="flex items-center justify-center" style={{ height: containerHeight }}>
        <div className="text-gray-500">No items found</div>
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = Math.floor(scrollTop / itemHeight) + index;
            return (
              <div 
                key={item.id || actualIndex}
                style={{ height: itemHeight }}
                className="virtual-list-item"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Optimized question list for large datasets
export const VirtualizedQuestionList = ({
  questions = [],
  onQuestionSelect,
  selectedQuestions = [],
  searchTerm = '',
  filters = {},
  sortBy = 'createdAt',
  className = ''
}) => {
  const filterFunction = useCallback((question) => {
    // Apply filters
    if (filters.section && filters.section !== 'All Sections' && question.section !== filters.section) {
      return false;
    }
    if (filters.domain && question.domain !== filters.domain) {
      return false;
    }
    if (filters.questionType && question.questionType !== filters.questionType) {
      return false;
    }
    if (filters.difficulty && question.difficulty !== filters.difficulty) {
      return false;
    }
    return true;
  }, [filters]);
  
  const sortedQuestions = useMemo(() => {
    const sorted = [...questions];
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'section':
          return (a.section || '').localeCompare(b.section || '');
        case 'difficulty':
          const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
          return (difficultyOrder[a.difficulty] || 2) - (difficultyOrder[b.difficulty] || 2);
        default:
          return 0;
      }
    });
    return sorted;
  }, [questions, sortBy]);
  
  const renderQuestion = useCallback((question, index) => {
    const isSelected = selectedQuestions.includes(question.id);
    
    return (
      <div 
        className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
        }`}
        onClick={() => onQuestionSelect?.(question)}
      >
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {question.section || 'Unknown'}
            </span>
            <span className="text-xs text-gray-500">
              {question.domain || 'Unknown Domain'}
            </span>
          </div>
          <span className="text-xs text-gray-400">
            #{index + 1}
          </span>
        </div>
        
        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
          {question.questionText || 'No question text'}
        </p>
        
        {question.passageText && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
            {question.passageText.substring(0, 100)}...
          </p>
        )}
        
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{question.questionType || 'Unknown Type'}</span>
          <span className={`px-2 py-1 rounded ${
            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            question.difficulty === 'Hard' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {question.difficulty || 'Medium'}
          </span>
        </div>
      </div>
    );
  }, [selectedQuestions, onQuestionSelect]);
  
  return (
    <VirtualizedList
      items={sortedQuestions}
      itemHeight={120}
      containerHeight={600}
      renderItem={renderQuestion}
      searchTerm={searchTerm}
      filterFunction={filterFunction}
      className={className}
      emptyComponent={
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p className="text-lg mb-2">No questions found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      }
    />
  );
};

export default VirtualizedList; 