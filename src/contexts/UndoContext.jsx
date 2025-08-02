import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const UndoContext = createContext();

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo must be used within an UndoProvider');
  }
  return context;
};

export const UndoProvider = ({ children }) => {
  const [undoStack, setUndoStack] = useState([]);
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [currentUndoAction, setCurrentUndoAction] = useState(null);
  const timeoutRefs = useRef(new Map());

  const addUndoAction = useCallback((action) => {
    const { id, type, data, onUndo, onConfirm } = action;
    
    // Clear any existing timeout for this action
    if (timeoutRefs.current.has(id)) {
      clearTimeout(timeoutRefs.current.get(id));
      timeoutRefs.current.delete(id);
    }

    // Add to undo stack
    setUndoStack(prev => [...prev, action]);
    setCurrentUndoAction(action);
    setShowUndoToast(true);

    // Set 5-second timeout for automatic confirmation
    const timeoutId = setTimeout(() => {
      confirmAction(id);
    }, 5000);

    timeoutRefs.current.set(id, timeoutId);
  }, []);

  const undoAction = useCallback((id) => {
    setUndoStack(prev => {
      const action = prev.find(item => item.id === id);
      if (!action) return prev;

      // Clear the timeout
      if (timeoutRefs.current.has(id)) {
        clearTimeout(timeoutRefs.current.get(id));
        timeoutRefs.current.delete(id);
      }

      // Execute undo function
      if (action.onUndo) {
        action.onUndo(action.data);
      }

      // Remove from undo stack and hide toast
      setShowUndoToast(false);
      setCurrentUndoAction(null);
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const confirmAction = useCallback((id) => {
    setUndoStack(prev => {
      const action = prev.find(item => item.id === id);
      if (!action) return prev;

      // Clear the timeout
      if (timeoutRefs.current.has(id)) {
        clearTimeout(timeoutRefs.current.get(id));
        timeoutRefs.current.delete(id);
      }

      // Execute confirm function
      if (action.onConfirm) {
        action.onConfirm(action.data);
      }

      // Remove from undo stack and hide toast
      setShowUndoToast(false);
      setCurrentUndoAction(null);
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const clearUndoStack = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    
    setUndoStack([]);
    setShowUndoToast(false);
    setCurrentUndoAction(null);
  }, []);

  const value = {
    undoStack,
    showUndoToast,
    currentUndoAction,
    addUndoAction,
    undoAction,
    confirmAction,
    clearUndoStack,
    setShowUndoToast
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
    </UndoContext.Provider>
  );
}; 