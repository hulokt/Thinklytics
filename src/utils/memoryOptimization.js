// Memory optimization utilities for React app
import React from 'react';

// Cleanup timers and intervals
export const cleanupManager = {
  timers: new Set(),
  intervals: new Set(),
  
  addTimer(id) {
    this.timers.add(id);
    return id;
  },
  
  addInterval(id) {
    this.intervals.add(id);
    return id;
  },
  
  clearAll() {
    this.timers.forEach(id => clearTimeout(id));
    this.intervals.forEach(id => clearInterval(id));
    this.timers.clear();
    this.intervals.clear();
  }
};

// Optimized setState for large objects
export const useOptimizedState = (initialState) => {
  const [state, setState] = React.useState(initialState);
  
  const setStateOptimized = React.useCallback((updates) => {
    setState(prevState => {
      // Only update if there are actual changes
      const newState = { ...prevState, ...updates };
      const hasChanges = Object.keys(updates).some(
        key => newState[key] !== prevState[key]
      );
      return hasChanges ? newState : prevState;
    });
  }, []);
  
  return [state, setStateOptimized];
};

// Virtual list hook for large datasets
export const useVirtualList = (items, itemHeight = 50, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop
  };
};

// Debounced search hook
export const useDebouncedSearch = (searchTerm, delay = 300) => {
  const [debouncedTerm, setDebouncedTerm] = React.useState(searchTerm);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);
    
    cleanupManager.addTimer(timer);
    
    return () => clearTimeout(timer);
  }, [searchTerm, delay]);
  
  return debouncedTerm;
};

// Memory monitoring (development only)
export const memoryMonitor = {
  log() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = performance.memory;
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1048576)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1048576)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1048576)} MB`
      });
    }
  },
  
  startMonitoring(interval = 30000) {
    if (process.env.NODE_ENV === 'development') {
      const id = setInterval(() => this.log(), interval);
      cleanupManager.addInterval(id);
      return id;
    }
  }
};

// Cleanup on unmount hook
export const useCleanup = (cleanupFn) => {
  React.useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};

// Optimized localStorage for large data
export const optimizedStorage = {
  setItem(key, value) {
    try {
      // Compress large objects
      const serialized = JSON.stringify(value);
      if (serialized.length > 100000) { // > 100KB
        console.warn(`Large data stored in localStorage: ${key} (${Math.round(serialized.length / 1024)}KB)`);
      }
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('localStorage error:', error);
      // Fallback: try to free up space by removing old items
      this.cleanup();
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryError) {
        console.error('localStorage retry failed:', retryError);
      }
    }
  },
  
  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('localStorage parse error:', error);
      localStorage.removeItem(key);
      return null;
    }
  },
  
  cleanup() {
    // Remove items older than 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.includes('timestamp')) {
        const timestamp = parseInt(localStorage.getItem(key));
        if (timestamp < thirtyDaysAgo) {
          localStorage.removeItem(key);
          localStorage.removeItem(key.replace('_timestamp', ''));
        }
      }
    }
  }
};

// Data chunking for large arrays
export const chunkData = (array, chunkSize = 100) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Memoized filtering for large datasets
export const useMemoizedFilter = (data, filterFn, dependencies) => {
  return React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(filterFn);
  }, [data, ...dependencies]);
};

// Image optimization
export const optimizeImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupManager.clearAll();
  });
} 