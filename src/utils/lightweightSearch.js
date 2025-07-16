// Lightweight search utility to replace Fuse.js
import React from 'react';

export class LightweightSearch {
  constructor(list, options = {}) {
    this.list = Array.isArray(list) ? list : [];
    this.options = {
      keys: options.keys || [],
      threshold: options.threshold || 0.6,
      ignoreCase: options.ignoreCase !== false,
      minMatchCharLength: options.minMatchCharLength || 1,
      maxResults: options.maxResults || 50,
      ...options
    };
  }

  // Simple string distance calculation (Levenshtein distance approximation)
  getDistance(str1, str2) {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    // Character overlap scoring
    const chars1 = new Set(s1);
    const chars2 = new Set(s2);
    const intersection = new Set([...chars1].filter(x => chars2.has(x)));
    const union = new Set([...chars1, ...chars2]);
    
    return intersection.size / union.size;
  }

  // Extract text from object using keys
  extractText(item, keys) {
    if (typeof item === 'string') return [item];
    
    const texts = [];
    keys.forEach(key => {
      const value = this.getNestedValue(item, key);
      if (value && typeof value === 'string') {
        texts.push(value);
      }
    });
    return texts;
  }

  // Get nested object value (e.g., 'answerChoices.A')
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Score an item against the search pattern
  scoreItem(item, pattern) {
    const searchPattern = this.options.ignoreCase ? pattern.toLowerCase() : pattern;
    
    if (searchPattern.length < this.options.minMatchCharLength) {
      return { score: 0, matches: [] };
    }

    const texts = this.extractText(item, this.options.keys);
    let bestScore = 0;
    const matches = [];

    texts.forEach((text, textIndex) => {
      const searchText = this.options.ignoreCase ? text.toLowerCase() : text;
      
      // Exact match gets highest score
      if (searchText === searchPattern) {
        bestScore = Math.max(bestScore, 1.0);
        matches.push({ key: this.options.keys[textIndex], value: text, score: 1.0 });
        return;
      }

      // Contains match
      if (searchText.includes(searchPattern)) {
        const score = 0.8 - (Math.abs(searchText.length - searchPattern.length) / searchText.length) * 0.3;
        bestScore = Math.max(bestScore, score);
        matches.push({ key: this.options.keys[textIndex], value: text, score });
        return;
      }

      // Starts with match
      if (searchText.startsWith(searchPattern)) {
        const score = 0.7;
        bestScore = Math.max(bestScore, score);
        matches.push({ key: this.options.keys[textIndex], value: text, score });
        return;
      }

      // Word boundary match
      const words = searchText.split(/\s+/);
      for (const word of words) {
        if (word.startsWith(searchPattern)) {
          const score = 0.6;
          bestScore = Math.max(bestScore, score);
          matches.push({ key: this.options.keys[textIndex], value: text, score });
          break;
        }
      }

      // Fuzzy character match
      const distance = this.getDistance(searchText, searchPattern);
      if (distance > 0.3) {
        const score = distance * 0.5;
        bestScore = Math.max(bestScore, score);
        matches.push({ key: this.options.keys[textIndex], value: text, score });
      }
    });

    return { score: bestScore, matches };
  }

  // Search and return results
  search(pattern) {
    if (!pattern || pattern.length < this.options.minMatchCharLength) {
      return [];
    }

    const results = [];
    
    for (let i = 0; i < this.list.length; i++) {
      const item = this.list[i];
      const { score, matches } = this.scoreItem(item, pattern);
      
      if (score >= this.options.threshold) {
        results.push({
          item,
          score,
          matches,
          refIndex: i
        });
      }
    }

    // Sort by score (descending) and limit results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, this.options.maxResults);
  }

  // Update the search list
  setCollection(newList) {
    this.list = Array.isArray(newList) ? newList : [];
  }

  // Add items to the search list
  add(items) {
    if (Array.isArray(items)) {
      this.list.push(...items);
    } else {
      this.list.push(items);
    }
  }

  // Remove items from the search list
  remove(predicate) {
    this.list = this.list.filter(item => !predicate(item));
  }
}

// Utility functions for common search patterns
export const createQuestionSearch = (questions) => {
  return new LightweightSearch(questions, {
    keys: [
      'questionText',
      'passageText',
      'section',
      'domain',
      'questionType',
      'difficulty',
      'answerChoices.A',
      'answerChoices.B',
      'answerChoices.C',
      'answerChoices.D',
      'explanation'
    ],
    threshold: 0.3,
    maxResults: 100
  });
};

export const createQuizSearch = (quizzes) => {
  return new LightweightSearch(quizzes, {
    keys: [
      'quizNumber',
      'date',
      'score',
      'status'
    ],
    threshold: 0.4,
    maxResults: 50
  });
};

// Simple filter utility for basic filtering without search
export const simpleFilter = (items, filters) => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === 'All' || value === 'All Sections') return true;
      
      const itemValue = typeof item[key] === 'string' ? 
        item[key].toLowerCase() : 
        String(item[key]).toLowerCase();
      const filterValue = typeof value === 'string' ? 
        value.toLowerCase() : 
        String(value).toLowerCase();
      
      return itemValue.includes(filterValue);
    });
  });
};

// Debounced search hook
export const useSearch = (searchInstance, query, delay = 300) => {
  const [results, setResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const searchResults = searchInstance.search(query);
      setResults(searchResults);
      setIsSearching(false);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [searchInstance, query, delay]);

  return { results, isSearching };
}; 