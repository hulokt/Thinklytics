import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useCalendarEvents } from '../hooks/useUserData';
import { useQuizManager } from './QuizManager';
import { Modal } from './ui/animated-modal';
import { CheckCircle, Clock, BarChart2, Plus, Play, Calendar as CalendarIcon, Target, BookOpen, Trash2, ChevronRight, CalendarDays, Activity } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkModeContext';

// Custom calendar styles
const calendarStyles = `
  .react-calendar {
    width: 100%;
    height: 100%;
    min-height: 500px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    font-family: 'Inter', system-ui, sans-serif;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    overflow: hidden;
  }

  .dark .react-calendar {
    background: #1f2937;
    border-color: #374151;
    color: #f9fafb;
  }

  .react-calendar__navigation {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .react-calendar__navigation button {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    font-weight: 600;
    padding: 10px 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .react-calendar__navigation button:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }

  .dark .react-calendar__navigation button:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }

  .react-calendar__navigation button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .react-calendar__month-view__weekdays {
    background: #f8fafc;
    padding: 12px 0;
    font-weight: 600;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #64748b;
  }

  .dark .react-calendar__month-view__weekdays {
    background: #374151;
    color: #9ca3af;
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 12px;
    text-align: center;
  }

  .react-calendar__month-view__days {
    padding: 12px;
    flex: 1;
  }

  .react-calendar__tile {
    background: none;
    border: none;
    padding: 16px 12px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    font-weight: 500;
    color: #374151;
    font-size: 16px;
    min-height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .dark .react-calendar__tile {
    color: #f9fafb;
  }

  .react-calendar__tile:hover {
    background: #f1f5f9;
    transform: translateY(-1px);
  }

  .dark .react-calendar__tile:hover {
    background: #374151;
  }

  .react-calendar__tile:disabled {
    color: #cbd5e1;
    cursor: not-allowed;
    background: none;
  }

  .dark .react-calendar__tile:disabled {
    color: #6b7280;
  }

  .react-calendar__tile--now {
    background: #dbeafe;
    color: #1e40af;
    font-weight: 600;
  }

  .dark .react-calendar__tile--now {
    background: #1e3a8a;
    color: #93c5fd;
  }

  .react-calendar__tile--active {
    background: #1e40af !important;
    color: white !important;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
  }

  .dark .react-calendar__tile--active {
    background: #3b82f6 !important;
    color: white !important;
  }

  .react-calendar__tile--hasEvents {
    position: relative;
  }

  .react-calendar__tile--hasEvents::after {
    content: '';
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background: #10b981;
    border-radius: 50%;
  }

  .dark .react-calendar__tile--hasEvents::after {
    background: #34d399;
  }

  /* Activity dots styles */
  .activity-dots-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    margin-top: 4px;
    flex-wrap: wrap;
    max-width: 100%;
  }

  .activity-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .activity-dot:hover {
    transform: scale(1.2);
  }

  .activity-dot.completed {
    background: linear-gradient(135deg, #10b981, #059669);
    box-shadow: 0 1px 3px rgba(16, 185, 129, 0.3);
  }

  .activity-dot.in-progress {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    box-shadow: 0 1px 3px rgba(245, 158, 11, 0.3);
  }

  .activity-dot.planned {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    box-shadow: 0 1px 3px rgba(59, 130, 246, 0.3);
  }

  .activity-dot.custom {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    box-shadow: 0 1px 3px rgba(139, 92, 246, 0.3);
  }

  /* Dark mode adjustments for dots */
  .dark .activity-dot.completed {
    background: linear-gradient(135deg, #34d399, #10b981);
    box-shadow: 0 1px 3px rgba(52, 211, 153, 0.4);
  }

  .dark .activity-dot.in-progress {
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    box-shadow: 0 1px 3px rgba(251, 191, 36, 0.4);
  }

  .dark .activity-dot.planned {
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    box-shadow: 0 1px 3px rgba(96, 165, 250, 0.4);
  }

  .dark .activity-dot.custom {
    background: linear-gradient(135deg, #a78bfa, #8b5cf6);
    box-shadow: 0 1px 3px rgba(167, 139, 250, 0.4);
  }
`;

// ========= Debug helper =========
// Silence noisy logs in this component and expose a focused logger instead.
const _origLog = console.log.bind(console);
console.log = () => {}; // suppress every stray console.log coming from this file
const dbg = (...args) => _origLog('[Calendar]', ...args);
// =================================

const CalendarPage = ({ onStartQuiz }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [notes, setNotes] = useState('');
  const { isDarkMode } = useDarkMode();
  
  const { data: calendarEvents, upsertData: upsertCalendarEvents } = useCalendarEvents();
  const { quizManager, completedQuizzes, inProgressQuizzes, allQuizzesLoading } = useQuizManager();

  // Force re-mount of <Calendar /> when underlying events change so that tile dots refresh
  const [calendarKey, setCalendarKey] = useState(0);

  // Helper functions for date handling
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toLocalDateString = (date) => {
    if (typeof date === 'string') return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getTodayString();

  // Notes handling functions
  const getNotesForDate = (dateStr) => {
    if (!calendarEvents || !Array.isArray(calendarEvents)) return '';
    
    const notesEvent = calendarEvents.find(event => 
      event.type === 'notes' && event.date === dateStr
    );
    
    return notesEvent ? notesEvent.content : '';
  };

  const saveNotesForDate = async (dateStr, content) => {
    try {
      const existingEvents = calendarEvents || [];
      const existingNotesIndex = existingEvents.findIndex(event => 
        event.type === 'notes' && event.date === dateStr
      );

      let updatedEvents;
      if (existingNotesIndex >= 0) {
        // Update existing notes
        updatedEvents = [...existingEvents];
        updatedEvents[existingNotesIndex] = {
          ...updatedEvents[existingNotesIndex],
          content,
          lastUpdated: new Date().toISOString()
        };
      } else {
        // Create new notes
        const newNotesEvent = {
          id: Date.now(),
          type: 'notes',
          date: dateStr,
          content,
          title: 'Daily Notes',
          status: 'notes',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        updatedEvents = [...existingEvents, newNotesEvent];
      }

      await mergeAndSaveCalendarEvents(updatedEvents);
    } catch (error) {
      console.error('Error saving notes:', error);
      setToastMessage('Failed to save notes');
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  // Load notes when date changes
  useEffect(() => {
    const dateStr = toLocalDateString(selectedDate);
    const currentNotes = getNotesForDate(dateStr);
    setNotes(currentNotes);
  }, [selectedDate, calendarEvents]);

  // Combine calendar events with quiz manager data
  const getAllEventsForDate = (dateStr) => {
    console.log(`🔍 Getting events for date: ${dateStr}`);
    
    // Create a map to track unique events by quizId
    const eventMap = new Map();
    
    // Helper function to add event to map with priority
    const addEventToMap = (event, priority) => {
      const key = event.quizId ? `quiz-${event.quizId}` : `event-${event.id}`;
      
      if (!eventMap.has(key) || priority > eventMap.get(key).priority) {
        eventMap.set(key, { ...event, priority });
      }
    };
    
    // Add calendar events (planned quizzes) - priority 1
    if (Array.isArray(calendarEvents)) {
      const calendarEventsForDate = calendarEvents.filter(event => event.date === dateStr);
      dbg('getAllEventsForDate', dateStr, 'calendarEventsForDate:', calendarEventsForDate, 'all:', calendarEvents);
      calendarEventsForDate.forEach(event => {
        addEventToMap(event, 1);
      });
    }
    
    // Add in-progress quizzes - priority 2
    if (inProgressQuizzes && Array.isArray(inProgressQuizzes)) {
      const inProgressQuizzesForDate = inProgressQuizzes.filter(quiz => {
        const quizDate = quiz.date || quiz.lastUpdated;
        if (!quizDate) return false;
        const quizDateStr = toLocalDateString(new Date(quizDate));
        return quizDateStr === dateStr;
      });
      
      console.log('🔄 In-progress quizzes for date:', inProgressQuizzesForDate);
      
      inProgressQuizzesForDate.forEach(quiz => {
        const event = {
          id: `inprogress-${quiz.id}`,
          title: `Quiz #${quiz.quizNumber || 'Unknown'}`,
          date: dateStr,
          type: 'quiz',
          status: 'in-progress',
          quizId: quiz.id,
          questions: quiz.questions || [],
          metadata: quiz
        };
        addEventToMap(event, 2);
      });
    }
    
    // Add completed quizzes - priority 3 (highest)
    if (completedQuizzes && Array.isArray(completedQuizzes)) {
      const completedQuizzesForDate = completedQuizzes.filter(quiz => {
        const quizDate = quiz.date || quiz.lastUpdated;
        if (!quizDate) return false;
        const quizDateStr = toLocalDateString(new Date(quizDate));
        return quizDateStr === dateStr;
      });
      
      console.log('✅ Completed quizzes for date:', completedQuizzesForDate);
      
      completedQuizzesForDate.forEach(quiz => {
        const event = {
          id: `completed-${quiz.id}`,
          title: `Quiz #${quiz.quizNumber || 'Unknown'}`,
          date: dateStr,
          type: 'quiz',
          status: 'completed',
          quizId: quiz.id,
          score: quiz.score,
          timeSpent: quiz.timeSpent,
          questions: quiz.questions || [],
          metadata: quiz
        };
        addEventToMap(event, 3);
      });
    }

    // Convert map to array and sort by priority
    const uniqueEvents = Array.from(eventMap.values())
      .sort((a, b) => b.priority - a.priority)
      .map(({ priority, ...event }) => event) // Remove priority from final events
      .filter(event => event.type !== 'notes'); // Exclude notes from activities list
    
    console.log(`📅 Final unique events for ${dateStr}:`, uniqueEvents);
    return uniqueEvents;
  };

  // Get all events for the selected date
  const selectedDateEvents = getAllEventsForDate(toLocalDateString(selectedDate));

  // When event sources change, bump key to trigger Calendar re-render so dot indicators update
  useEffect(() => {
    setCalendarKey(prev => prev + 1);
  }, [calendarEvents, inProgressQuizzes, completedQuizzes]);

  // Debug logging
  useEffect(() => {
    console.log('📅 Calendar Debug:', {
      calendarEvents: calendarEvents?.length || 0,
      completedQuizzes: completedQuizzes?.length || 0,
      inProgressQuizzes: inProgressQuizzes?.length || 0,
      selectedDate: toLocalDateString(selectedDate),
      selectedDateEvents: selectedDateEvents,
      eventsLength: selectedDateEvents.length
    });
  }, [calendarEvents, completedQuizzes, inProgressQuizzes, selectedDate, selectedDateEvents]);

  // === Global watcher: log whenever calendarEvents array changes ===
  useEffect(() => {
    if (!Array.isArray(calendarEvents)) {
      dbg('events → change detected but value is not array', calendarEvents);
      return;
    }
    dbg('events → change detected. Count:', calendarEvents.length, 'Snapshot:', calendarEvents.map(e => ({ id: e.id, status: e.status, date: e.date })));
  }, [calendarEvents]);

  // Calendar tile className for styling
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const dateStr = toLocalDateString(date);
    const selectedStr = selectedDate ? toLocalDateString(selectedDate) : null;
    const todayStr = today;
    
    let className = '';
    
    // Only highlight selected day in blue, not today unless selected
    if (selectedStr && dateStr === selectedStr) {
      className += 'react-calendar__tile--active';
    } else if (dateStr === todayStr) {
      className += 'react-calendar__tile--now';
    }
    
    return className;
  };

  // Calendar tile content for activity dots
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const dateStr = toLocalDateString(date);
    const eventsForDate = getAllEventsForDate(dateStr);
    
    if (eventsForDate.length === 0) return null;
    
    // Count events by status
    const eventCounts = {
      completed: 0,
      'in-progress': 0,
      planned: 0,
      custom: 0
    };
    
    eventsForDate.forEach(event => {
      if (event.type === 'custom') {
        eventCounts.custom++;
      } else if (event.status === 'completed') {
        eventCounts.completed++;
      } else if (event.status === 'in-progress') {
        eventCounts['in-progress']++;
      } else {
        eventCounts.planned++;
      }
    });
    
    // Create dots array with proper order (completed, in-progress, planned, custom)
    const dots = [];
    
    // Add completed dots (green)
    for (let i = 0; i < eventCounts.completed; i++) {
      dots.push({ status: 'completed', key: `completed-${i}` });
    }
    
    // Add in-progress dots (yellow)
    for (let i = 0; i < eventCounts['in-progress']; i++) {
      dots.push({ status: 'in-progress', key: `in-progress-${i}` });
    }
    
    // Add planned dots (blue)
    for (let i = 0; i < eventCounts.planned; i++) {
      dots.push({ status: 'planned', key: `planned-${i}` });
    }
    
    // Add custom dots (purple)
    for (let i = 0; i < eventCounts.custom; i++) {
      dots.push({ status: 'custom', key: `custom-${i}` });
    }
    
    // Limit to maximum 8 dots to avoid overcrowding
    const maxDots = 8;
    const displayDots = dots.slice(0, maxDots);
    
    return (
      <div className="activity-dots-container">
        {displayDots.map((dot) => (
          <div
            key={dot.key}
            className={`activity-dot ${dot.status}`}
            title={`${dot.status.charAt(0).toUpperCase() + dot.status.slice(1)} activity`}
          />
        ))}
        {dots.length > maxDots && (
          <div 
            className="text-xs text-gray-500 dark:text-gray-400 font-medium"
            title={`${dots.length - maxDots} more activities`}
          >
            +{dots.length - maxDots}
          </div>
        )}
      </div>
    );
  };

  const handleDayClick = (value) => {
    setSelectedDate(value);
  };

  const addPlannedEvent = (title) => {
    const newEvent = {
      id: Date.now(),
      title,
      date: toLocalDateString(selectedDate),
      type: 'custom',
      status: 'planned'
    };
    
    const updatedEvents = [...(calendarEvents || []), newEvent];
    mergeAndSaveCalendarEvents(updatedEvents);
  };

  const handleStartQuiz = async (quiz) => {
    if (!quiz) return;

    // If this is a planned quiz: update its calendar event to in-progress instead of deleting it
    if (quiz.status === 'planned') {
      const updatedEvents = (calendarEvents || []).map(ev =>
        ev.id === quiz.id ? { ...ev, status: 'in-progress' } : ev
      );
      dbg('handleStartQuiz → marking event', quiz.id, 'as in-progress. Total events after patch', updatedEvents.length, 'Snapshot:', updatedEvents.map(e=>({id:e.id,status:e.status,date:e.date})));
      mergeAndSaveCalendarEvents(updatedEvents);
    }

    // Delegate to parent (App) to actually start / resume the quiz
    if (onStartQuiz) {
      onStartQuiz(quiz);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    try {
      console.log('🗑️ Attempting to delete quiz:', quiz);
      
      // Always attempt to delete associated QuizManager record if quizId exists
      if (quizManager && quiz.quizId) {
        console.log('🗑️ Deleting corresponding quiz manager record with quizId:', quiz.quizId);
        await quizManager.deleteQuiz(quiz.quizId);
      }

      // Also remove any matching calendar event
      const updatedEvents = (calendarEvents || []).filter(event => event.id !== quiz.id);
      console.warn('🗑️ handleDeleteQuiz – removing calendar event id:', quiz.id, 'Remaining events count:', updatedEvents.length);
      mergeAndSaveCalendarEvents(updatedEvents);
      
      setToastMessage('Quiz deleted successfully');
      setToastType('success');
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('❌ Error deleting quiz:', error);
      setToastMessage(`Failed to delete quiz: ${error.message}`);
      setToastType('error');
      setShowToast(true);
      
      // Auto-hide error toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handleDeleteCustomEvent = async (event) => {
    try {
      console.log('🗑️ Attempting to delete custom event:', event);
      
      const updatedEvents = (calendarEvents || []).filter(e => e.id !== event.id);
      console.log('🗑️ Updated calendar events:', updatedEvents);
      mergeAndSaveCalendarEvents(updatedEvents);
      
      setToastMessage('Event deleted successfully');
      setToastType('success');
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('❌ Error deleting event:', error);
      setToastMessage(`Failed to delete event: ${error.message}`);
      setToastType('error');
      setShowToast(true);
      
      // Auto-hide error toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handleDeleteCompletedQuiz = async (quiz) => {
    try {
      console.log('🗑️ Attempting to delete completed quiz:', quiz);
      
      // Check if this is a calendar event or quiz manager event
      const quizId = String(quiz.id || '');
      if (quizId.startsWith('completed-') || quizId.startsWith('inprogress-')) {
        // This is from quiz manager, remove from quiz manager
        console.log('🗑️ Deleting completed quiz from quiz manager with quizId:', quiz.quizId);
        if (quizManager && quiz.quizId) {
          const deleteResult = await quizManager.deleteQuiz(quiz.quizId);
          console.log('🗑️ Quiz manager delete result:', deleteResult);
          if (!deleteResult) {
            throw new Error('Failed to delete from quiz manager');
          }
        } else {
          throw new Error('Quiz manager or quizId not available');
        }
      } else {
        // This is a calendar event, remove from calendar events
        console.log('🗑️ Deleting completed quiz calendar event with id:', quiz.id);
        const updatedEvents = (calendarEvents || []).filter(event => event.id !== quiz.id);
        console.warn('🗑️ handleDeleteCompletedQuiz – removing calendar event id:', quiz.id, 'Remaining events count:', updatedEvents.length);
        mergeAndSaveCalendarEvents(updatedEvents);
      }
      
      setToastMessage('Completed quiz deleted successfully');
      setToastType('success');
      setShowToast(true);
      
      // Auto-hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('❌ Error deleting completed quiz:', error);
      setToastMessage(`Failed to delete completed quiz: ${error.message}`);
      setToastType('error');
      setShowToast(true);
      
      // Auto-hide error toast after 5 seconds
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  // Helper: extract a numeric quiz number from event (metadata, field or title)
  const getEventQuizNumber = (evt) => {
    if (evt.metadata && typeof evt.metadata.quizNumber === 'number') return evt.metadata.quizNumber;
    if (typeof evt.quizNumber === 'number') return evt.quizNumber;
    const match = typeof evt.title === 'string' ? evt.title.match(/#(\d+)/) : null;
    return match ? parseInt(match[1], 10) : 0;
  };

  const groupedEvents = {
    quizzes: selectedDateEvents
      .filter(event => event.type === 'quiz' || event.type === 'planned')
      .sort((a, b) => getEventQuizNumber(a) - getEventQuizNumber(b)),
    custom: selectedDateEvents.filter(event => event.type === 'custom')
  };

  const getEventIcon = (event) => {
    if (event.type === 'quiz' || event.type === 'planned') {
      switch (event.status) {
        case 'completed':
          return <CheckCircle className="w-4 h-4 text-green-500" />;
        case 'in-progress':
          return <Clock className="w-4 h-4 text-yellow-500" />;
        default:
          return <Play className="w-4 h-4 text-blue-500" />;
      }
    }
    return <CalendarIcon className="w-4 h-4 text-purple-500" />;
  };

  const getEventStatusColor = (event) => {
    if (event.type === 'quiz' || event.type === 'planned') {
      switch (event.status) {
        case 'completed':
          return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
        case 'in-progress':
          return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
        default:
          return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      }
    }
    return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
  };

  const getEventStatusText = (event) => {
    if (event.type === 'quiz' || event.type === 'planned') {
      switch (event.status) {
        case 'completed':
          return 'Completed';
        case 'in-progress':
          return 'In Progress';
        default:
          return 'Planned';
      }
    }
    return 'Custom Event';
  };

  /* -------------------------------------------------------------
     🧹 Automatic cleanup: remove calendar events that reference
     a quizId that no longer exists in the QuizManager records.
     This prevents 'ghost' dots that remain after quizzes were
     deleted before the bug fix. Runs whenever either source
     changes and saves cleaned array back to DB if needed.
  ----------------------------------------------------------------*/
  useEffect(() => {
    if (!calendarEvents || !quizManager || allQuizzesLoading) return;

    dbg('cleanup → running with', calendarEvents.length, 'events');

    // First, ensure all calendar events that SHOULD have a quizId (i.e., are quiz-related) DO have one.
    // This patches old events that might have been created without it.
    const eventsArr = Array.isArray(calendarEvents) ? calendarEvents : [];
    const allQuizzes = quizManager.getAllQuizzes() || [];
    const patchedEvents = eventsArr.map(evt => {
        // If it's a planned quiz and is missing a quizId, let's try to find it.
        // This is a bit of a legacy patch; newer events should have this set correctly.
        if ((evt.type === 'planned' || evt.type === 'quiz') && !evt.quizId) {
            const potentialMatch = allQuizzes.find(q => 
                q.id == evt.id || // Match by the original event ID
                (q.metadata && q.metadata.calendarEventId === evt.id)
            );
            if (potentialMatch) {
                console.warn(`Patched event ${evt.id} with quizId ${potentialMatch.id}`);
                return { ...evt, quizId: potentialMatch.id };
            }
        }
        return evt;
    });

    const allQuizIds = new Set(allQuizzes.map(q => {
      const idNum = typeof q.id === 'string' ? parseInt(q.id, 10) : q.id;
      return idNum;
    }));

    const cleanedEvents = patchedEvents.filter(evt => {
      // Always keep non-quiz events (custom, notes, etc.)
      if (evt.type === 'custom' || evt.type === 'notes') {
          return true;
      }
      
      // Always keep planned and in-progress events - they should exist
      if (evt.status === 'planned' || evt.status === 'in-progress' || evt.type === 'planned') {
          return true;
      }
      
      // Always keep completed events - they represent historical data
      if (evt.status === 'completed') {
          return true;
      }
      
      // For any other quiz-related events, only remove if they're missing a quizId when they should have one
      if ((evt.type === 'quiz' || evt.type === 'planned') && !evt.quizId) {
          dbg('cleanup → removing quiz event without quizId:', evt);
          return false;
      }
      
      // Keep everything else by default
      return true;
    });

    // 🐞 Debug logging: which events would be removed
    if (cleanedEvents.length !== eventsArr.length) {
      const removedEvents = eventsArr.filter(evt => !cleanedEvents.find(c => c.id === evt.id));
      dbg('cleanup → removed events', removedEvents.map(e => ({ 
        id: e.id, 
        status: e.status, 
        date: e.date, 
        type: e.type,
        quizId: e.quizId,
        title: e.title 
      })));
      dbg('cleanup → allQuizzes from manager:', allQuizzes.map(q => ({ id: q.id, status: q.status, date: q.date })));
      dbg('cleanup → allQuizIds set:', Array.from(allQuizIds));
    }
    
    // Use deep equality check to see if patching or cleaning resulted in a change
    const hasChanged = JSON.stringify(cleanedEvents) !== JSON.stringify(calendarEvents);

    if (hasChanged) {
      dbg('cleanup → writing updated events array (before:', calendarEvents.length, 'after:', cleanedEvents.length, ') Snapshot after:', cleanedEvents.map(e => ({ id:e.id,status:e.status,date:e.date})));
      mergeAndSaveCalendarEvents(cleanedEvents);
    }
  }, [calendarEvents, quizManager, allQuizzesLoading]);

  // Helper to always merge and save calendar events safely
  const mergeAndSaveCalendarEvents = async (newOrUpdatedEvents) => {
    // Just save the provided array directly - it should already be the complete merged array
    await upsertCalendarEvents(newOrUpdatedEvents);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-3 sm:px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Calendar & Schedule
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mt-1 transition-colors duration-300">
                Manage your study sessions and track your progress
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm">
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Completed</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Planned</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Custom</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row pb-20 sm:pb-6 overflow-y-auto calendar-main-content">
          
          {/* Calendar Section - Larger Left Side */}
          <div className="lg:w-2/3 p-3 sm:p-6 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 flex-1 flex flex-col min-h-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5 text-blue-500" />
                  <span>Calendar</span>
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center min-h-0">
                <Calendar
                  key={calendarKey}
                  onChange={handleDayClick}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  tileContent={tileContent}
                  className="modern-calendar"
                />
              </div>
            </div>
          </div>

          {/* Activities Section - Smaller Right Side */}
          <div className="lg:w-1/3 p-3 sm:p-6 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 flex-1 overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  <span>Activities</span>
                </h2>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDateEvents.length} events
                </div>
              </div>

              {/* Activities Content */}
              <div className="flex-1 flex flex-col min-h-0">
                {/* Notes Section - Always Visible */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Daily Notes</span>
                    </h3>
                  </div>
                  
                  <div className="h-[8rem] sm:h-[12rem]">
                    <textarea
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        // Auto-save after a short delay
                        clearTimeout(window.notesSaveTimeout);
                        window.notesSaveTimeout = setTimeout(() => {
                          saveNotesForDate(toLocalDateString(selectedDate), e.target.value);
                        }, 1000);
                      }}
                      placeholder="Write your notes for today..."
                      className="w-full h-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base sm:text-sm resize-none overflow-hidden transition-colors duration-300"
                    />
                  </div>
                </div>

                {/* Activities Section */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Section Headers - Always Visible */}
                  {selectedDateEvents.length > 0 && (
                    <div className="space-y-3 sm:space-y-4 mb-4 flex-shrink-0">
                      {groupedEvents.quizzes.length > 0 && (
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mt-4">
                          Quizzes ({groupedEvents.quizzes.length})
                        </h3>
                      )}
                      {groupedEvents.custom.length > 0 && (
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          Custom Events ({groupedEvents.custom.length})
                        </h3>
                      )}
                    </div>
                  )}
                  
                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                    <div className="space-y-3 sm:space-y-4">
                      {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-6 sm:py-8">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                            <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            No activities scheduled
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Select a different date or add new activities
                          </p>
                          <div className="mt-4 text-xs text-gray-400 space-y-1">
                            <div>Debug: {toLocalDateString(selectedDate)}</div>
                            <div>Total Events: {calendarEvents?.length || 0}</div>
                            <div>Completed Quizzes: {completedQuizzes?.length || 0}</div>
                            <div>In Progress Quizzes: {inProgressQuizzes?.length || 0}</div>
                            <div>Selected Date Events: {selectedDateEvents.length}</div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Quizzes Section */}
                          {groupedEvents.quizzes.length > 0 && (
                            <div className="space-y-3">
                              <div className="space-y-3">
                                {groupedEvents.quizzes.map((event, idx) => (
                                  <div
                                    key={`${event.id}-${event.status}-${idx}`}
                                    className="group relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600 transition-all duration-200"
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {getEventIcon(event)}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {event.title}
                                          </h4>
                                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEventStatusColor(event)}`}>
                                              {getEventStatusText(event)}
                                            </span>
                                            {event.metadata && event.metadata.questions && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {event.metadata.questions.length} questions
                                              </span>
                                            )}
                                            {!event.metadata && event.questions && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {event.questions.length} questions
                                              </span>
                                            )}
                                            {event.score !== undefined && (
                                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                {event.score}% score
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex items-center space-x-2">
                                        {(event.status === 'planned' || event.type === 'planned') && (
                                          <button
                                            onClick={() => handleStartQuiz(event)}
                                            disabled={(() => {
                                              // Check if today is the planned date - disable if not today
                                              const plannedDate = event.plannedDate || event.metadata?.plannedDate || event.date;
                                              if (plannedDate) {
                                                const today = new Date().toISOString().split('T')[0];
                                                let plannedDateStr;
                                                
                                                // Handle different date formats
                                                if (plannedDate.includes('T')) {
                                                  // ISO string format
                                                  plannedDateStr = new Date(plannedDate).toISOString().split('T')[0];
                                                } else if (plannedDate.includes('-') && plannedDate.length === 10) {
                                                  // YYYY-MM-DD format
                                                  plannedDateStr = plannedDate;
                                                } else {
                                                  // Try to parse as date
                                                  plannedDateStr = new Date(plannedDate).toISOString().split('T')[0];
                                                }
                                                
                                                return today !== plannedDateStr;
                                              }
                                              return false; // Enable if no planned date found
                                            })()}
                                            className={`p-2 rounded-lg transition-colors duration-200 ${
                                              (() => {
                                                const plannedDate = event.plannedDate || event.metadata?.plannedDate || event.date;
                                                if (plannedDate) {
                                                  const today = new Date().toISOString().split('T')[0];
                                                  let plannedDateStr;
                                                  
                                                  if (plannedDate.includes('T')) {
                                                    plannedDateStr = new Date(plannedDate).toISOString().split('T')[0];
                                                  } else if (plannedDate.includes('-') && plannedDate.length === 10) {
                                                    plannedDateStr = plannedDate;
                                                  } else {
                                                    plannedDateStr = new Date(plannedDate).toISOString().split('T')[0];
                                                  }
                                                  
                                                  if (today !== plannedDateStr) {
                                                    return 'bg-gray-400 cursor-not-allowed text-white';
                                                  }
                                                }
                                                return 'bg-blue-500 hover:bg-blue-600 text-white';
                                              })()
                                            }`}
                                            title={(() => {
                                              // Check if today is the planned date
                                              const plannedDate = event.plannedDate || event.metadata?.plannedDate || event.date;
                                              if (plannedDate) {
                                                const today = new Date().toISOString().split('T')[0];
                                                let plannedDateStr;
                                                
                                                if (plannedDate.includes('T')) {
                                                  plannedDateStr = new Date(plannedDate).toISOString().split('T')[0];
                                                } else if (plannedDate.includes('-') && plannedDate.length === 10) {
                                                  plannedDateStr = plannedDate;
                                                } else {
                                                  plannedDateStr = new Date(plannedDate).toISOString().split('T')[0];
                                                }
                                                
                                                if (today !== plannedDateStr) {
                                                  return `This quiz is planned for ${new Date(plannedDateStr).toLocaleDateString()}. You can only start it on that date.`;
                                                }
                                              }
                                              return 'Start this quiz';
                                            })()}
                                          >
                                            <Play className="w-4 h-4" />
                                          </button>
                                        )}
                                        
                                        {(event.status === 'in-progress' || event.type === 'in-progress') && (
                                          <button
                                            onClick={() => handleStartQuiz(event)}
                                            className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                                            title="Resume this quiz"
                                          >
                                            <Play className="w-4 h-4" />
                                          </button>
                                        )}
                                        
                                        <button
                                          onClick={() => handleDeleteQuiz(event)}
                                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                                          title="Delete this quiz"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Custom Events Section */}
                          {groupedEvents.custom.length > 0 && (
                            <div className="space-y-3">
                              <div className="space-y-3">
                                {groupedEvents.custom.map((event, idx) => (
                                  <div
                                    key={`${event.id}-${idx}`}
                                    className="group relative bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700 transition-all duration-200"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                                        {getEventIcon(event)}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                            {event.title}
                                          </h4>
                                          <div className="flex items-center space-x-2 mt-1">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getEventStatusColor(event)}`}>
                                              {getEventStatusText(event)}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <button
                                        onClick={() => handleDeleteCustomEvent(event)}
                                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          toastType === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toastType === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Custom Calendar Styles */}
      <style>{calendarStyles}</style>
      
      {/* Custom responsive styles for 1018px breakpoint */}
      <style>{`
        @media (min-width: 1018px) {
          .calendar-main-content {
            overflow-y: hidden !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarPage; 