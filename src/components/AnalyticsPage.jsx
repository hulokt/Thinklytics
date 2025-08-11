import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Filler } from 'chart.js';
import { useQuestionAnswers } from '../hooks/useUserData';
import { useQuizManager } from './QuizManager';
import { useDarkMode } from '../contexts/DarkModeContext';
import CountUp from './ui/CountUp';
import InfoTooltip from './ui/tooltip';
import { SAT_SECTIONS, MATH_DOMAINS, READING_WRITING_DOMAINS, getQuestionTypeOptions } from '../data';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage = ({ questions }) => {
  const { isDarkMode } = useDarkMode();
  // Add CSS to hide number input spinners
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      input[type="number"]::-webkit-outer-spin-button,
      input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
        background: transparent;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
      input[type="number"]::-webkit-outer-spin-button:hover,
      input[type="number"]::-webkit-inner-spin-button:hover {
        background: transparent;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  const [analytics, setAnalytics] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    inProgressQuizzes: 0,
    totalQuestions: 0,
    answeredQuestions: 0,
    averageScore: 0,
    totalStudyTime: 0,
    sectionStats: {},
    domainStats: {},
    questionTypeStats: {},
    strugglingDomains: [],
    strugglingTypes: [],
    recentQuizzes: [],
    difficultyStats: {},
  });

  const { completedQuizzes, inProgressQuizzes } = useQuizManager();
  const { data: questionAnswers } = useQuestionAnswers();

  // Time-range selector state ("all" | "custom")
  const [timeRange, setTimeRange] = useState('all');
  const [customDays, setCustomDays] = useState(7); // Can be number or empty string during editing

  // Ensure all data is properly formatted as arrays (store *all* data)
  const allCompletedQuizzesArray = Array.isArray(completedQuizzes) ? completedQuizzes : [];
  const allInProgressQuizzesArray = Array.isArray(inProgressQuizzes) ? inProgressQuizzes : [];
  const questionsArray = Array.isArray(questions) ? questions : [];
  const questionAnswersObj = questionAnswers && typeof questionAnswers === 'object' ? questionAnswers : {};

  // Helper: derive questions within current range (custom days vs all-time)
  const nowTs = Date.now();
  const validCustomDays = customDays === '' ? 1 : parseInt(customDays) || 1;
  const customAgoTs = nowTs - validCustomDays * 24 * 60 * 60 * 1000;
  const questionsInRange = timeRange === 'custom'
    ? questionsArray.filter(q => {
        const questionDate = new Date(q.date || q.lastUpdated || q.createdAt || 0).getTime();
        return questionDate >= customAgoTs && questionDate > 0; // Exclude questions without proper timestamps
      })
    : questionsArray;

  const generateAnalytics = useCallback(() => {
    // 🔎 Determine active data set based on selected time-range
    const now = Date.now();
    const validCustomDays = customDays === '' ? 1 : parseInt(customDays) || 1;
    const customAgo = now - validCustomDays * 24 * 60 * 60 * 1000; // custom-day window

    const completedQuizzesArray =
      timeRange === 'custom'
        ? allCompletedQuizzesArray.filter(q => {
            const quizDate = new Date(q.date || q.lastUpdated || q.endTime || 0).getTime();
            return quizDate >= customAgo && quizDate > 0; // Exclude quizzes without proper timestamps
          })
        : allCompletedQuizzesArray;

    const inProgressQuizzesArray =
      timeRange === 'custom'
        ? allInProgressQuizzesArray.filter(q => {
            const quizDate = new Date(q.date || q.lastUpdated || q.startTime || 0).getTime();
            return quizDate >= customAgo && quizDate > 0; // Exclude quizzes without proper timestamps
          })
        : allInProgressQuizzesArray;

    // Questions scoped to range (reuse questionsInRange but computed here to have local weekAgo)
    const questionsRangeArray = questionsInRange;

    // Helper to filter answers map by date (only keep answers whose parent quiz is within selected range)
    const questionAnswersObjFiltered = {};
    Object.entries(questionAnswersObj).forEach(([qId, answers]) => {
      questionAnswersObjFiltered[qId] = answers.filter(ans => {
        // Find the parent quiz (could be completed or in-progress depending on status)
        const parentQuiz = [...completedQuizzesArray, ...inProgressQuizzesArray].find(q => q.id === ans.quizId);
        if (!parentQuiz) return false;
        if (timeRange === 'custom') {
          const quizDate = new Date(parentQuiz.date || parentQuiz.lastUpdated || parentQuiz.endTime || parentQuiz.startTime || 0).getTime();
          return quizDate >= customAgo && quizDate > 0; // Exclude quizzes without proper timestamps
        }
        return true;
      });
    });



    // Basic stats
    const totalQuizzes = completedQuizzesArray.length + inProgressQuizzesArray.length;
    const totalQuestions = questionsRangeArray.length;
    
    // Calculate answered questions based on completed quizzes only
    const answeredQuestions = Object.keys(questionAnswersObjFiltered).filter(questionId => {
      const answers = questionAnswersObjFiltered[questionId];
      if (!answers || !Array.isArray(answers)) return false;
      
      // Check if any answer is from a completed quiz
      return answers.some(answer => {
        return completedQuizzesArray.some(quiz => 
          quiz.id === answer.quizId && 
          ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
           quiz.status === 'completed')
        );
      });
    }).length;
    
    // Calculate average score (only for completed quizzes)
    const averageScore = completedQuizzesArray.length > 0 
      ? Math.round(completedQuizzesArray.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / completedQuizzesArray.length)
      : 0;

    // Calculate total study time (in minutes) - only for completed quizzes
    const totalStudyTime = Math.round(
      completedQuizzesArray.reduce((sum, quiz) => sum + (quiz.timeSpent || 0), 0) / 60
    );



    // Performance by section - calculate based on completed quiz results only
    const sectionStats = {};
    questionsRangeArray.forEach(question => {
      const section = question.section || 'Unknown';
      if (!sectionStats[section]) {
        sectionStats[section] = { total: 0, correct: 0, attempted: 0 };
      }
      sectionStats[section].total++;
      
      // Check if this question has been answered in any completed quiz
      if (questionAnswersObjFiltered[question.id]) {
        const answers = questionAnswersObjFiltered[question.id];
        // Only count answers from completed quizzes
        const completedAnswers = answers.filter(answer => {
          return completedQuizzesArray.some(quiz => 
            quiz.id === answer.quizId && 
            ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
             quiz.status === 'completed')
          );
        });
        
        if (completedAnswers.length > 0) {
          sectionStats[section].attempted++;
          // Count how many times this question was answered correctly in completed quizzes
          const correctAnswers = completedAnswers.filter(a => a.isCorrect === true).length;
          if (correctAnswers > 0) {
            sectionStats[section].correct++;
          }
        }
      }
    });

    // Domain statistics - include all questions in wrong log, not just answered ones
    const domainStats = {};
    questionsRangeArray.forEach(question => {
      const domain = question.domain || 'Unknown';
      if (!domainStats[domain]) {
        domainStats[domain] = { total: 0, attempted: 0, correct: 0, wrong: 0 };
      }
      domainStats[domain].total++;
      
      // Check if this question has been answered in completed quizzes
      if (questionAnswersObjFiltered[question.id]) {
        const answers = questionAnswersObjFiltered[question.id];
        // Only count answers from completed quizzes
        const completedAnswers = answers.filter(answer => {
          return completedQuizzesArray.some(quiz => 
            quiz.id === answer.quizId && 
            ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
             quiz.status === 'completed')
          );
        });
        
        if (completedAnswers.length > 0) {
          domainStats[domain].attempted++;
          
          // Count correct vs incorrect answers from completed quizzes only
          const correctAnswers = completedAnswers.filter(a => a.isCorrect === true).length;
          const incorrectAnswers = completedAnswers.filter(a => a.isCorrect === false).length;
          
          // Track correct and wrong answers separately
          if (correctAnswers > 0) {
            domainStats[domain].correct++;
          }
          if (incorrectAnswers > 0) {
            domainStats[domain].wrong++;
          }
        }
      }
    });

    // Question type statistics - include all questions in wrong log, not just answered ones
    const questionTypeStats = {};
    
    questionsRangeArray.forEach(question => {
      const type = question.questionType || 'Unknown';
      if (!questionTypeStats[type]) {
        questionTypeStats[type] = { total: 0, attempted: 0, correct: 0, wrong: 0 };
      }
      questionTypeStats[type].total++;
      
      // Check if this question has been answered in completed quizzes
      if (questionAnswersObjFiltered[question.id]) {
        const answers = questionAnswersObjFiltered[question.id];
        // Only count answers from completed quizzes
        const completedAnswers = answers.filter(answer => {
          return completedQuizzesArray.some(quiz => 
            quiz.id === answer.quizId && 
            ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
             quiz.status === 'completed')
          );
        });
        
        if (completedAnswers.length > 0) {
          questionTypeStats[type].attempted++;
          
          // Count correct vs incorrect answers from completed quizzes only
          const correctAnswers = completedAnswers.filter(a => a.isCorrect === true).length;
          const incorrectAnswers = completedAnswers.filter(a => a.isCorrect === false).length;
          
          // Track correct and wrong answers separately
          if (correctAnswers > 0) {
            questionTypeStats[type].correct++;
          }
          if (incorrectAnswers > 0) {
            questionTypeStats[type].wrong++;
          }
        }
      }
    });
    
    // Debug: Log the final question type stats

    // Find most struggling areas (max 3 each) - only for domains/types with 2+ wrong answers
    const strugglingDomains = Object.entries(domainStats)
      .filter(([_, stats]) => stats.wrong >= 2) // Only consider domains with at least 2 wrong answers
      .map(([domain, stats]) => ({
        domain,
        incorrectPercentage: stats.attempted > 0 ? Math.round((stats.wrong / stats.attempted) * 100) : 0,
        attempted: stats.attempted,
        wrong: stats.wrong
      }))
      .sort((a, b) => b.incorrectPercentage - a.incorrectPercentage || b.wrong - a.wrong) // Sort by highest incorrect percentage first
      .slice(0, 3);

    const strugglingTypes = Object.entries(questionTypeStats)
      .filter(([_, stats]) => stats.wrong >= 2) // Only consider types with at least 2 wrong answers
      .map(([type, stats]) => ({
        type,
        incorrectPercentage: stats.attempted > 0 ? Math.round((stats.wrong / stats.attempted) * 100) : 0,
        attempted: stats.attempted,
        wrong: stats.wrong
      }))
      .sort((a, b) => b.incorrectPercentage - a.incorrectPercentage || b.wrong - a.wrong) // Sort by highest incorrect percentage first
      .slice(0, 3);

    // Performance over time (last 10 completed quizzes) - only show real data
    const recentQuizzes = completedQuizzesArray
      .sort((a, b) => new Date(a.date || a.lastUpdated) - new Date(b.date || b.lastUpdated))
      .slice(-10)
      .map((quiz, index) => ({
        quiz: quiz.quizNumber || index + 1,
        score: quiz.score || 0,
        date: new Date(quiz.date || quiz.lastUpdated).toLocaleDateString()
      }));

    // Recent quizzes data

    // Question difficulty analysis - calculate based on completed quiz results only
    const difficultyStats = {
      'Easy': { total: 0, correct: 0 },
      'Medium': { total: 0, correct: 0 },
      'Hard': { total: 0, correct: 0 }
    };

    // Only consider non-hidden questions in difficulty analysis
    const visibleQuestions = questionsRangeArray.filter(q => !q.hidden);

    visibleQuestions.forEach(question => {
      const difficulty = question.difficulty || 'Medium';
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total++;
        
        // Check if this question has been answered correctly in completed quizzes
        if (questionAnswersObjFiltered[question.id]) {
          const answers = questionAnswersObjFiltered[question.id];
          // Only count answers from completed quizzes
          const completedAnswers = answers.filter(answer => {
            return completedQuizzesArray.some(quiz => 
              quiz.id === answer.quizId && 
              ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
               quiz.status === 'completed')
            );
          });
          
          const correctAnswers = completedAnswers.filter(a => a.isCorrect === true).length;
          if (correctAnswers > 0) {
            difficultyStats[difficulty].correct++;
          }
        }
      }
    });

    // Analytics generated

    // Debug struggling domains calculation

    // Debug section performance calculation

    // Debug question type performance calculation

    setAnalytics({
      totalQuizzes,
      completedQuizzes: completedQuizzesArray.length,
      inProgressQuizzes: inProgressQuizzesArray.length,
      totalQuestions,
      answeredQuestions,
      averageScore,
      totalStudyTime,
      sectionStats,
      domainStats,
      questionTypeStats,
      strugglingDomains,
      strugglingTypes,
      recentQuizzes,
      difficultyStats,
      totalDomains: Object.keys(domainStats).length,
      totalQuestionTypes: Object.keys(questionTypeStats).length
    });
  }, [allCompletedQuizzesArray, allInProgressQuizzesArray, questionsArray, questionAnswersObj, timeRange, questionsInRange.length]);

  // Call generateAnalytics when data changes
  useEffect(() => {
    
    if (allCompletedQuizzesArray !== undefined && questionAnswersObj !== undefined && allInProgressQuizzesArray !== undefined) {
      generateAnalytics();
    }
  }, [
    allCompletedQuizzesArray.length,
    allInProgressQuizzesArray.length,
    questionsInRange.length,
    Object.keys(questionAnswersObj).length,
    timeRange,
    customDays
  ]);

  // PDF Report Generation
  const generatePDFReport = useCallback(async () => {
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      let yPosition = margin;

      // Helper function to add new page if needed (kept for compatibility)
      const checkNewPage = (requiredHeight = 20) => {
        if (yPosition + requiredHeight > pageHeight - margin - 20) { // Account for footer
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function for rounded rectangles (fallback for older jsPDF versions)
      const safeRoundedRect = (x, y, w, h, r1, r2, style) => {
        try {
          if (typeof doc.roundedRect === 'function') {
            doc.roundedRect(x, y, w, h, r1, r2, style);
          } else {
            doc.rect(x, y, w, h, style);
          }
        } catch (e) {
          doc.rect(x, y, w, h, style);
        }
      };

      // Helper function to add section header with modern styling
      const addSectionHeader = (title, gradientColors = [[59, 130, 246], [37, 99, 235]], isFirstSection = false) => {
        // Start new page for each section (except the first one)
        if (!isFirstSection) {
          doc.addPage();
          yPosition = margin;
        }
        
        // Create gradient-like effect with multiple rectangles
        const [color1, color2] = gradientColors;
        for (let i = 0; i < 8; i++) {
          const ratio = i / 7;
          const r = Math.round(color1[0] * (1 - ratio) + color2[0] * ratio);
          const g = Math.round(color1[1] * (1 - ratio) + color2[1] * ratio);
          const b = Math.round(color1[2] * (1 - ratio) + color2[2] * ratio);
          doc.setFillColor(r, g, b);
          doc.rect(margin, yPosition + i, pageWidth - 2 * margin, 1, 'F');
        }
        
        // Add subtle shadow
        doc.setFillColor(0, 0, 0, 0.1);
        doc.rect(margin + 2, yPosition + 8, pageWidth - 2 * margin, 1, 'F');
        
        // Add header text
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 8, yPosition + 6);
        
        yPosition += 18;
        doc.setTextColor(55, 65, 81); // Gray-700 for body text
      };

      // Helper function to add subsection header
      const addSubsectionHeader = (title, iconColor = [59, 130, 246]) => {
        // Add colored left border
        doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
        doc.rect(margin, yPosition, 3, 12, 'F');
        
        // Add light background
        doc.setFillColor(249, 250, 251); // Gray-50
        doc.rect(margin + 5, yPosition, pageWidth - 2 * margin - 5, 12, 'F');
        
        // Add border
        doc.setDrawColor(229, 231, 235); // Gray-200
        doc.setLineWidth(0.5);
        doc.rect(margin + 5, yPosition, pageWidth - 2 * margin - 5, 12, 'S');
        
        doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin + 10, yPosition + 8);
        
        yPosition += 16;
        doc.setTextColor(55, 65, 81);
      };

      // Modern Title Page with analytics page styling
      // Add top gradient banner
      for (let i = 0; i < 8; i++) {
        const ratio = i / 7;
        const r = Math.round(59 * (1 - ratio) + 37 * ratio);
        const g = Math.round(130 * (1 - ratio) + 99 * ratio);
        const b = Math.round(246 * (1 - ratio) + 235 * ratio);
        doc.setFillColor(r, g, b);
        doc.rect(0, i, pageWidth, 1, 'F');
      }
      
      // Main title with modern styling
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text('SAT Analytics Report', pageWidth / 2, 35, { align: 'center' });
      
      // Subtitle with gradient effect
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(99, 102, 241); // Indigo-500
      doc.text('Performance Insights & Question Type Analysis', pageWidth / 2, 50, { align: 'center' });
      
      // Generated date with styling
      doc.setFontSize(11);
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 62, { align: 'center' });
      
      // Add decorative elements
      doc.setFillColor(59, 130, 246);
      doc.circle(pageWidth / 2 - 30, 70, 2, 'F');
      doc.circle(pageWidth / 2, 70, 2, 'F');
      doc.circle(pageWidth / 2 + 30, 70, 2, 'F');
      
              // Add professional note
        doc.setFillColor(243, 244, 246); // Gray-100
        safeRoundedRect(margin + 10, 75, pageWidth - 2 * margin - 20, 8, 2, 2, 'F');
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('This report provides comprehensive analytics of your SAT preparation progress', pageWidth / 2, 80, { align: 'center' });
        
        yPosition = 90;

      // Summary Statistics with modern card design
      addSectionHeader('Summary Statistics', [[34, 197, 94], [16, 185, 129]], true);
      
      const summaryStats = [
        ['Total Questions', analytics.totalQuestions.toString(), [59, 130, 246]],
        ['Completed Quizzes', analytics.completedQuizzes.toString(), [34, 197, 94]],
        ['Average Score', `${analytics.averageScore}%`, [168, 85, 247]],
        ['Total Study Time', `${analytics.totalStudyTime} minutes`, [245, 101, 101]],
        ['Questions Attempted', analytics.answeredQuestions.toString(), [251, 191, 36]]
      ];

      // Create modern stat cards
      summaryStats.forEach(([label, value, color], index) => {
        const cardY = yPosition + (index * 18);
        const cardWidth = pageWidth - 2 * margin - 10;
        
        // Card background
        doc.setFillColor(249, 250, 251); // Gray-50
        safeRoundedRect(margin + 5, cardY - 2, cardWidth, 15, 2, 2, 'F');
        
        // Colored left border
        doc.setFillColor(color[0], color[1], color[2]);
        safeRoundedRect(margin + 5, cardY - 2, 4, 15, 2, 2, 'F');
        
        // Label
        doc.setTextColor(75, 85, 99); // Gray-600
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${label}:`, margin + 15, cardY + 7);
        
        // Value with color - right aligned at card's right edge
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(value, margin + 5 + cardWidth - 5, cardY + 7, { align: 'right' });
      });

      yPosition += summaryStats.length * 18 + 15;

      // Helper function to organize questions by weeks
      const organizeQuestionsByWeeks = () => {
        const weeks = [];
        const questionsWithDates = questionsArray.filter(q => {
          const date = new Date(q.date || q.lastUpdated || q.createdAt || 0).getTime();
          return date > 0; // Only include questions with valid dates
        });

        if (questionsWithDates.length === 0) return weeks;

        // Sort questions by date
        questionsWithDates.sort((a, b) => {
          const dateA = new Date(a.date || a.lastUpdated || a.createdAt).getTime();
          const dateB = new Date(b.date || b.lastUpdated || b.createdAt).getTime();
          return dateA - dateB;
        });

        const firstQuestionDate = new Date(questionsWithDates[0].date || questionsWithDates[0].lastUpdated || questionsWithDates[0].createdAt);
        const lastQuestionDate = new Date(questionsWithDates[questionsWithDates.length - 1].date || questionsWithDates[questionsWithDates.length - 1].lastUpdated || questionsWithDates[questionsWithDates.length - 1].createdAt);

        // Create weekly buckets
        let currentWeekStart = new Date(firstQuestionDate);
        currentWeekStart.setHours(0, 0, 0, 0);
        
        let weekNumber = 1;
        while (currentWeekStart <= lastQuestionDate) {
          const weekEnd = new Date(currentWeekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          weekEnd.setHours(23, 59, 59, 999);

          const weekQuestions = questionsWithDates.filter(q => {
            const questionDate = new Date(q.date || q.lastUpdated || q.createdAt);
            return questionDate >= currentWeekStart && questionDate <= weekEnd;
          });

          if (weekQuestions.length > 0) {
            weeks.push({
              weekNumber,
              startDate: new Date(currentWeekStart),
              endDate: new Date(weekEnd),
              questions: weekQuestions
            });
          }

          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
          weekNumber++;
        }

        return weeks;
      };

      const weeks = organizeQuestionsByWeeks();

             // Helper function to calculate question type distribution for a set of questions
       const calculateQuestionTypeDistribution = (questions, section) => {
         const stats = {};

         questions.forEach(question => {
           if (section === 'Math' && question.section !== 'Math') return;
           if (section === 'Reading & Writing' && question.section === 'Math') return;

           const type = question.questionType || 'Unknown';
           if (!stats[type]) {
             stats[type] = { total: 0 };
           }
           stats[type].total++;
         });

         // Convert to array and sort by count (highest to lowest)
         return Object.entries(stats)
           .filter(([_, s]) => s.total > 0)
           .map(([type, s]) => ({
             type,
             total: s.total
           }))
           .sort((a, b) => b.total - a.total);
       };

             // Weekly Reports
       if (weeks.length > 0) {
         weeks.forEach((week, index) => {
           // Each week gets its own page
           addSectionHeader(`Week ${week.weekNumber}: ${week.startDate.toLocaleDateString()} - ${week.endDate.toLocaleDateString()}`, [[107, 114, 128], [75, 85, 99]]);
           
           // Reading & Writing Question Types for this week (FIRST)
           const rwDistribution = calculateQuestionTypeDistribution(week.questions, 'Reading & Writing');
           if (rwDistribution.length > 0) {
             addSubsectionHeader('Reading & Writing Question Types', [99, 102, 241]);
             
             // Limit to top 8 items to fit on one page
             rwDistribution.slice(0, 8).forEach((item, i) => {
               const itemY = yPosition;
               
               // Item background with alternating colors - aligned with header
               const bgColor = i % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
               doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
               safeRoundedRect(margin + 5, itemY - 2, pageWidth - 2 * margin - 10, 10, 1, 1, 'F');
               
               // Rank circle
               doc.setFillColor(99, 102, 241);
               doc.circle(margin + 13, itemY + 3, 3, 'F');
               doc.setTextColor(255, 255, 255);
               doc.setFontSize(8);
               doc.setFont('helvetica', 'bold');
               doc.text((i + 1).toString(), margin + 13, itemY + 4, { align: 'center' });
               
               // Question type - truncate if too long
               doc.setTextColor(55, 65, 81);
               doc.setFontSize(9);
               doc.setFont('helvetica', 'normal');
               const truncatedType = item.type.length > 25 ? item.type.substring(0, 22) + '...' : item.type;
               doc.text(truncatedType, margin + 20, itemY + 4);
               
               // Count with badge - positioned a bit left from right edge
               doc.setFillColor(99, 102, 241);
               safeRoundedRect(pageWidth - margin - 23, itemY - 0.5, 12, 6, 2, 2, 'F');
               doc.setTextColor(255, 255, 255);
               doc.setFontSize(7);
               doc.setFont('helvetica', 'bold');
               doc.text(`${item.total}`, pageWidth - margin - 17, itemY + 3, { align: 'center' });
               
               yPosition += 11;
             });
             yPosition += 8;
           }

           // Math Question Types for this week (SECOND)
           const mathDistribution = calculateQuestionTypeDistribution(week.questions, 'Math');
           if (mathDistribution.length > 0) {
             addSubsectionHeader('Math Question Types', [168, 85, 247]);
             
             // Limit to top 8 items to fit on one page
             mathDistribution.slice(0, 8).forEach((item, i) => {
               const itemY = yPosition;
               
               // Item background with alternating colors - aligned with header
               const bgColor = i % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
               doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
               safeRoundedRect(margin + 5, itemY - 2, pageWidth - 2 * margin - 10, 10, 1, 1, 'F');
               
               // Rank circle
               doc.setFillColor(168, 85, 247);
               doc.circle(margin + 13, itemY + 3, 3, 'F');
               doc.setTextColor(255, 255, 255);
               doc.setFontSize(8);
               doc.setFont('helvetica', 'bold');
               doc.text((i + 1).toString(), margin + 13, itemY + 4, { align: 'center' });
               
               // Question type - truncate if too long
               doc.setTextColor(55, 65, 81);
               doc.setFontSize(9);
               doc.setFont('helvetica', 'normal');
               const truncatedType = item.type.length > 25 ? item.type.substring(0, 22) + '...' : item.type;
               doc.text(truncatedType, margin + 20, itemY + 4);
               
               // Count with badge - positioned a bit left from right edge
               doc.setFillColor(168, 85, 247);
               safeRoundedRect(pageWidth - margin - 23, itemY - 0.5, 12, 6, 2, 2, 'F');
               doc.setTextColor(255, 255, 255);
               doc.setFontSize(7);
               doc.setFont('helvetica', 'bold');
               doc.text(`${item.total}`, pageWidth - margin - 17, itemY + 3, { align: 'center' });
               
               yPosition += 11;
             });
           }
         });
       }

                          // All-Time Report - Start on new page
      addSectionHeader('All-Time Question Type Distribution', [[107, 114, 128], [75, 85, 99]]);
      
      // All-time Reading & Writing Distribution (FIRST)
      const allTimeRWDistribution = calculateQuestionTypeDistribution(questionsArray, 'Reading & Writing');
      if (allTimeRWDistribution.length > 0) {
        addSubsectionHeader('Reading & Writing Question Types - All Time', [59, 130, 246]);
        
        // Show up to 30 items with compact spacing to fit on one page
        allTimeRWDistribution.slice(0, 30).forEach((item, i) => {
          const itemY = yPosition;
          
          // Item background with alternating colors - aligned with header
          const bgColor = i % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          safeRoundedRect(margin + 5, itemY - 1, pageWidth - 2 * margin - 10, 8, 1, 1, 'F');
          
          // Rank circle - smaller and closer to left
          doc.setFillColor(99, 102, 241);
          doc.circle(margin + 11, itemY + 2, 2.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text((i + 1).toString(), margin + 11, itemY + 3, { align: 'center' });
          
          // Question type - truncate if too long
          doc.setTextColor(55, 65, 81);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          const truncatedType = item.type.length > 30 ? item.type.substring(0, 27) + '...' : item.type;
          doc.text(truncatedType, margin + 17, itemY + 3);
          
          // Count with badge - positioned a bit left from right edge
          doc.setFillColor(99, 102, 241);
          safeRoundedRect(pageWidth - margin - 23, itemY - 0.5, 12, 6, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text(`${item.total}`, pageWidth - margin - 17, itemY + 3, { align: 'center' });
          
          yPosition += 8;
        });
        yPosition += 10;
      }

      // All-time Math Distribution (SECOND)
      const allTimeMathDistribution = calculateQuestionTypeDistribution(questionsArray, 'Math');
      if (allTimeMathDistribution.length > 0) {
        addSubsectionHeader('Math Question Types - All Time', [168, 85, 247]);
        
        // Show up to 30 items with compact spacing to fit on one page
        allTimeMathDistribution.slice(0, 30).forEach((item, i) => {
          const itemY = yPosition;
          
          // Item background with alternating colors - aligned with header
          const bgColor = i % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
          doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          safeRoundedRect(margin + 5, itemY - 1, pageWidth - 2 * margin - 10, 8, 1, 1, 'F');
          
          // Rank circle - smaller and closer to left
          doc.setFillColor(168, 85, 247);
          doc.circle(margin + 11, itemY + 2, 2.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text((i + 1).toString(), margin + 11, itemY + 3, { align: 'center' });
          
          // Question type - truncate if too long
          doc.setTextColor(55, 65, 81);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          const truncatedType = item.type.length > 30 ? item.type.substring(0, 27) + '...' : item.type;
          doc.text(truncatedType, margin + 17, itemY + 3);
          
          // Count with badge - positioned a bit left from right edge
          doc.setFillColor(168, 85, 247);
          safeRoundedRect(pageWidth - margin - 23, itemY - 0.5, 12, 6, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text(`${item.total}`, pageWidth - margin - 17, itemY + 3, { align: 'center' });
          
          yPosition += 8;
        });
      }

      

      // Add footer to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer background
        doc.setFillColor(249, 250, 251); // Gray-50
        doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
        
        // Footer gradient line
        for (let j = 0; j < 2; j++) {
          const ratio = j / 1;
          const r = Math.round(59 * (1 - ratio) + 37 * ratio);
          const g = Math.round(130 * (1 - ratio) + 99 * ratio);
          const b = Math.round(246 * (1 - ratio) + 235 * ratio);
          doc.setFillColor(r, g, b);
          doc.rect(0, pageHeight - 15 + j, pageWidth, 1, 'F');
        }
        
        // Page number
        doc.setTextColor(107, 114, 128); // Gray-500
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
        
        // Report branding
        doc.text('SAT Analytics Report', margin, pageHeight - 6);
        
        // Generated timestamp
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 6, { align: 'center' });
      }

      // Save the PDF
      const fileName = `SAT_Analytics_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      
      
    } catch (error) {
     
      alert('Error generating PDF report. Please make sure you have an internet connection and try again.');
    }
  }, [analytics, questionsArray, questionAnswersObj, allCompletedQuizzesArray]);

  // Chart configurations with modern styling
  const sectionChartData = {
    labels: Object.keys(analytics.sectionStats),
    datasets: [
      {
        label: 'Accuracy %',
        data: Object.values(analytics.sectionStats).map(stat => 
          stat.attempted > 0 ? Math.round((stat.correct / stat.attempted) * 100) : 0
        ),
        backgroundColor: [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(245, 87, 108, 1)',
          'rgba(79, 172, 254, 1)',
          'rgba(67, 233, 123, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
        ],
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
      },
    ],
  };

  const progressChartData = {
    labels: analytics.recentQuizzes.map(quiz => `Quiz ${quiz.quiz}`),
    datasets: [
      {
        label: 'Score %',
        data: analytics.recentQuizzes.map(quiz => quiz.score),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'linear-gradient(180deg, rgba(34, 197, 94, 0.4) 0%, rgba(34, 197, 94, 0.05) 100%)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 4,
        borderWidth: 3,
        shadowColor: 'rgba(34, 197, 94, 0.3)',
        shadowBlur: 15,
        shadowOffsetX: 0,
        shadowOffsetY: 8,
      },
    ],
  };

  const difficultyChartData = {
    labels: Object.keys(analytics.difficultyStats),
    datasets: [
      {
        data: (() => {
          const totalQuestions = Object.values(analytics.difficultyStats).reduce((sum, stat) => sum + stat.total, 0);
          return Object.values(analytics.difficultyStats).map(stat => 
            totalQuestions > 0 ? Math.round((stat.total / totalQuestions) * 100) : 0
          );
        })(),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Color palette for consistent mapping
  const colorPalette = [
    { bg: 'rgba(102, 126, 234, 0.8)', border: 'rgba(102, 126, 234, 1)', hover: 'rgba(102, 126, 234, 0.9)' },
    { bg: 'rgba(245, 87, 108, 0.8)', border: 'rgba(245, 87, 108, 1)', hover: 'rgba(245, 87, 108, 0.9)' },
    { bg: 'rgba(79, 172, 254, 0.8)', border: 'rgba(79, 172, 254, 1)', hover: 'rgba(79, 172, 254, 0.9)' },
    { bg: 'rgba(67, 233, 123, 0.8)', border: 'rgba(67, 233, 123, 1)', hover: 'rgba(67, 233, 123, 0.9)' },
    { bg: 'rgba(250, 112, 154, 0.8)', border: 'rgba(250, 112, 154, 1)', hover: 'rgba(250, 112, 154, 0.9)' },
    { bg: 'rgba(168, 237, 234, 0.8)', border: 'rgba(168, 237, 234, 1)', hover: 'rgba(168, 237, 234, 0.9)' },
    { bg: 'rgba(253, 187, 45, 0.8)', border: 'rgba(253, 187, 45, 1)', hover: 'rgba(253, 187, 45, 0.9)' },
    { bg: 'rgba(150, 251, 196, 0.8)', border: 'rgba(150, 251, 196, 1)', hover: 'rgba(150, 251, 196, 0.9)' }
  ];

  // New helper to create occurrence data for a stats map
  const createOccurrenceData = (statsMap) => {
    const labels = Object.keys(statsMap).slice(0, 8);
    const dataArr = Object.values(statsMap).slice(0, 8);
    return {
      labels,
      datasets: [
        {
          label: 'Total Questions',
          data: dataArr.map(stat => stat.total),
          backgroundColor: dataArr.map((_, index) => colorPalette[index % colorPalette.length].bg),
          borderColor: dataArr.map((_, index) => colorPalette[index % colorPalette.length].border),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: dataArr.map((_, index) => colorPalette[index % colorPalette.length].hover),
        },
        {
          label: 'Attempted Questions',
          data: dataArr.map(stat => stat.attempted || 0),
          backgroundColor: 'rgba(255, 193, 7, 0.7)',
          borderColor: 'rgba(255, 193, 7, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  };

  // Split stats by section
  const mathDomainSet = new Set(Object.values(MATH_DOMAINS));
  const rwDomainSet = new Set(Object.values(READING_WRITING_DOMAINS));
  const domainStatsMath = Object.fromEntries(Object.entries(analytics.domainStats).filter(([d]) => mathDomainSet.has(d)));
  const domainStatsRW = Object.fromEntries(Object.entries(analytics.domainStats).filter(([d]) => rwDomainSet.has(d)));

  const mathTypeSet = new Set(getQuestionTypeOptions(SAT_SECTIONS.MATH));
  const rwTypeSet = new Set(getQuestionTypeOptions(SAT_SECTIONS.READING_WRITING));
  const questionTypeStatsMath = Object.fromEntries(Object.entries(analytics.questionTypeStats).filter(([t]) => mathTypeSet.has(t)));
  const questionTypeStatsRW = Object.fromEntries(Object.entries(analytics.questionTypeStats).filter(([t]) => rwTypeSet.has(t)));

  const domainOccurrenceDataMath = createOccurrenceData(domainStatsMath);
  const domainOccurrenceDataRW = createOccurrenceData(domainStatsRW);
  const questionTypeOccurrenceDataMath = createOccurrenceData(questionTypeStatsMath);
  const questionTypeOccurrenceDataRW = createOccurrenceData(questionTypeStatsRW);

  const domainOccurrenceData = {
    labels: Object.keys(analytics.domainStats).slice(0, 8),
    datasets: [
      {
        label: 'Total Questions',
        data: Object.values(analytics.domainStats).slice(0, 8).map(stat => stat.total),
        backgroundColor: Object.values(analytics.domainStats).slice(0, 8).map((_, index) => colorPalette[index % colorPalette.length].bg),
        borderColor: Object.values(analytics.domainStats).slice(0, 8).map((_, index) => colorPalette[index % colorPalette.length].border),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: Object.values(analytics.domainStats).slice(0, 8).map((_, index) => colorPalette[index % colorPalette.length].hover),
      },
      {
        label: 'Attempted Questions',
        data: Object.values(analytics.domainStats).slice(0, 8).map(stat => stat.attempted || 0),
        backgroundColor: 'rgba(255, 193, 7, 0.7)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const questionTypeOccurrenceData = {
    labels: Object.keys(analytics.questionTypeStats).slice(0, 8),
    datasets: [
      {
        label: 'Total Questions',
        data: Object.values(analytics.questionTypeStats).slice(0, 8).map(stat => stat.total),
        backgroundColor: Object.values(analytics.questionTypeStats).slice(0, 8).map((_, index) => colorPalette[index % colorPalette.length].bg),
        borderColor: Object.values(analytics.questionTypeStats).slice(0, 8).map((_, index) => colorPalette[index % colorPalette.length].border),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: Object.values(analytics.questionTypeStats).slice(0, 8).map((_, index) => colorPalette[index % colorPalette.length].hover),
      },
      {
        label: 'Attempted Questions',
        data: Object.values(analytics.questionTypeStats).slice(0, 8).map(stat => stat.attempted || 0),
        backgroundColor: 'rgba(168, 85, 247, 0.7)',
        borderColor: 'rgba(168, 85, 247, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 13,
            family: 'Inter, system-ui, sans-serif',
            weight: '500'
          },
          padding: 25,
          usePointStyle: true,
          pointStyle: 'roundRect',
          boxWidth: 12,
          boxHeight: 12
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 16,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        caretPadding: 10,
        caretSize: 8,
        titleMarginBottom: 8,
        bodySpacing: 6,
        usePointStyle: true,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}${context.dataset.label.includes('%') ? '%' : ''}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 8,
          callback: function(value) {
            return value + '%';
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 0
        },
        border: {
          display: false
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        backgroundColor: '#22c55e',
        borderColor: '#fff',
        borderWidth: 2
      },
      line: {
        tension: 0.4
      }
    }
  };

  // Specialized options for occurrence charts
  const occurrenceChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 8,
          callback: function(value) {
            return value; // No percentage for count data
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 8,
          maxRotation: 45,
          minRotation: 0,
          callback: function(value) {
            // Truncate long labels
            const label = this.getLabelForValue(value);
            if (label && label.length > 15) {
              return label.substring(0, 12) + '...';
            }
            return label;
          }
        },
        border: {
          display: false
        }
      }
    },
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        maxWidth: 300,
        callbacks: {
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y} questions`;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#374151',
          font: {
            size: 13,
            family: 'Inter, system-ui, sans-serif',
            weight: '500'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 15,
          boxHeight: 15
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        borderColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 16,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        caretPadding: 10,
        caretSize: 8,
        titleMarginBottom: 8,
        bodySpacing: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    },
    cutout: '65%',
    elements: {
      arc: {
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 4,
        hoverBorderColor: '#ffffff'
      }
    }
  };

  return (
    <div className="relative h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Enhanced Background with Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-950/20 via-indigo-950/10 to-purple-950/20' 
            : 'bg-gradient-to-br from-blue-100/60 via-indigo-100/40 to-purple-100/60'
        }`}></div>
        
        {/* Main Floating Orbs */}
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20' 
            : 'bg-gradient-to-r from-blue-500/15 to-cyan-500/15'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20' 
            : 'bg-gradient-to-r from-indigo-500/15 to-purple-500/15'
        }`}></div>
        
        {/* Additional Floating Elements */}
        <div className={`absolute top-1/3 right-1/3 w-64 h-64 rounded-full blur-3xl animate-pulse delay-500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-500/15 to-pink-500/15' 
            : 'bg-gradient-to-r from-purple-500/12 to-pink-500/12'
        }`}></div>
        <div className={`absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full blur-3xl animate-pulse delay-1500 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/15' 
            : 'bg-gradient-to-r from-cyan-500/12 to-blue-500/12'
        }`}></div>
        
        {/* Geometric Shapes */}
        <div className={`absolute top-20 left-10 w-32 h-32 border-2 rounded-2xl rotate-12 animate-float ${
          isDarkMode 
            ? 'border-blue-400/30 bg-transparent' 
            : 'border-blue-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        <div className={`absolute top-40 right-20 w-24 h-24 rounded-full animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20' 
            : 'bg-gradient-to-br from-blue-500/15 to-indigo-500/15'
        }`}></div>
        <div className={`absolute bottom-32 left-20 w-20 h-20 border-2 rounded-lg rotate-45 animate-float-slow ${
          isDarkMode 
            ? 'border-purple-400/30 bg-transparent' 
            : 'border-purple-400/25 bg-white/10'
        } backdrop-blur-sm`}></div>
        
        {/* Modern Abstract Shapes */}
        <div className={`absolute top-1/3 left-16 w-24 h-32 rounded-tl-3xl rounded-br-3xl animate-float delay-800 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20' 
            : 'bg-gradient-to-r from-blue-400/15 to-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-1/3 right-16 w-32 h-24 rounded-tr-3xl rounded-bl-3xl animate-float-delayed ${
          isDarkMode 
            ? 'bg-gradient-to-r from-purple-400/20 to-indigo-400/20' 
            : 'bg-gradient-to-r from-purple-400/15 to-indigo-400/15'
        }`}></div>
        
        {/* Star-like Shapes */}
        <div className={`absolute top-1/3 right-1/6 w-8 h-8 transform rotate-45 animate-float delay-900 ${
          isDarkMode 
            ? 'bg-amber-400/25' 
            : 'bg-amber-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        <div className={`absolute bottom-2/5 left-1/8 w-6 h-6 transform -rotate-15 animate-float-slow delay-1100 ${
          isDarkMode 
            ? 'bg-lime-400/25' 
            : 'bg-lime-400/20'
        }`} style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
        
        {/* Triangle Accents */}
        <div className={`absolute top-1/4 right-1/4 w-8 h-8 transform rotate-45 animate-float delay-1000 ${
          isDarkMode 
            ? 'bg-cyan-400/20' 
            : 'bg-cyan-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-12 h-12 transform -rotate-30 animate-float-delayed ${
          isDarkMode 
            ? 'bg-rose-400/20' 
            : 'bg-rose-400/15'
        }`} style={{clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'}}></div>
        
        {/* Shining Light Effects */}
        <div className={`absolute top-1/5 right-1/4 w-2 h-2 rounded-full animate-ping delay-500 ${
          isDarkMode ? 'bg-white/60' : 'bg-blue-300/70'
        }`}></div>
        <div className={`absolute bottom-1/5 left-1/4 w-1 h-1 rounded-full animate-ping delay-1200 ${
          isDarkMode ? 'bg-yellow-300/80' : 'bg-yellow-300/70'
        }`}></div>
        <div className={`absolute top-2/5 left-3/4 w-1.5 h-1.5 rounded-full animate-ping delay-800 ${
          isDarkMode ? 'bg-cyan-300/70' : 'bg-cyan-300/60'
        }`}></div>
        <div className={`absolute bottom-2/5 right-3/4 w-2.5 h-2.5 rounded-full animate-ping delay-1800 ${
          isDarkMode ? 'bg-pink-300/60' : 'bg-pink-300/50'
        }`}></div>
        
        {/* Particle Effect */}
        <div className="absolute inset-0">
          {useMemo(() => 
            [...Array(15)].map((_, i) => {
              const left = Math.random() * 100;
              const top = Math.random() * 100;
              const delay = Math.random() * 3;
              const duration = 2 + Math.random() * 2;
              const size = Math.random() * 3 + 1;
              
              return (
                <div
                  key={`particle-${i}`}
                  className={`absolute rounded-full animate-ping ${
                    isDarkMode ? 'bg-blue-500/40' : 'bg-blue-500/30'
                  }`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`
                  }}
                ></div>
              );
            }), [isDarkMode]
          )}
        </div>
        
        {/* Subtle Grid Pattern */}
        <div className={`absolute inset-0 opacity-[0.03] dark:opacity-[0.05]`}>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px), 
                             radial-gradient(circle at 75% 75%, #6366f1 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            backgroundPosition: '0 0, 30px 30px'
          }}></div>
        </div>
        
        {/* Floating Lines */}
        <div className={`absolute top-1/4 left-0 w-32 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent transform rotate-45 animate-pulse delay-1000`}></div>
        <div className={`absolute bottom-1/3 right-0 w-40 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent transform -rotate-45 animate-pulse delay-2000`}></div>
        <div className={`absolute top-2/3 left-0 w-24 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent transform rotate-12 animate-pulse delay-500`}></div>
        
        {/* Corner Accents */}
        <div className={`absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 rounded-tl-3xl ${
          isDarkMode ? 'border-blue-400/20' : 'border-blue-400/15'
        }`}></div>
        <div className={`absolute top-0 right-0 w-20 h-20 border-r-2 border-t-2 rounded-tr-3xl ${
          isDarkMode ? 'border-purple-400/20' : 'border-purple-400/15'
        }`}></div>
        <div className={`absolute bottom-0 left-0 w-20 h-20 border-l-2 border-b-2 rounded-bl-3xl ${
          isDarkMode ? 'border-cyan-400/20' : 'border-cyan-400/15'
        }`}></div>
        <div className={`absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 rounded-br-3xl ${
          isDarkMode ? 'border-indigo-400/20' : 'border-indigo-400/15'
        }`}></div>
      </div>

      {/* Header - Modern Design */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300 z-10">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">
              Track your performance and progress with advanced insights
              {timeRange === 'custom' && customDays !== '' && (
                <span className="ml-2 text-blue-600 font-medium">
                  (Showing last {customDays} day{customDays !== 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
          {/* Time-range toggle */}
          <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Range:</span>
            <div className="flex items-center gap-2">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-200 ${timeRange==='all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
            >All Time</button>
              <div className={`flex items-center rounded-lg border transition-all duration-200 ${timeRange==='custom' ? 'bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-300' : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}>
                <button
                  onClick={() => setTimeRange('custom')}
                  className="px-2 min-w-0 py-1.5 text-xs font-medium transition-colors duration-200"
                >
                  Last
                </button>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string during editing
                    if (value === '') {
                      setCustomDays('');
                      return;
                    }
                    // Parse and constrain the value
                    const days = Math.max(1, Math.min(365, parseInt(value) || 1));
                    setCustomDays(days);
                  }}
                  onBlur={(e) => {
                    // Ensure we have a valid number when user leaves the field
                    const value = e.target.value;
                    if (value === '' || parseInt(value) < 1) {
                      setCustomDays(1);
                    }
                  }}
                  onFocus={() => setTimeRange('custom')}
                  className={`w-12 py-1.5 text-xs text-center bg-transparent border-0 outline-none ${timeRange==='custom' ? 'text-white placeholder-blue-200' : 'text-gray-700 dark:text-gray-300'}`}
                  style={{
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                />
                <span className="px-3 py-1.5 text-xs font-medium">
                  {customDays === 1 || customDays === '1' ? 'Day' : 'Days'}
                </span>
              </div>
                             {/* Download Report Button */}
               <button
                 onClick={() => generatePDFReport()}
                 className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
               >
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 Download Report
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="w-full px-3 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUp from={0} to={questionsInRange.filter(q => !q.hidden).length} duration={0.8} />
                  </p>
                  <p className="text-sm font-medium text-gray-600">Total Questions</p>
                  <p className="text-xs text-gray-500">Questions added to library</p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUp from={0} to={analytics.totalQuizzes} duration={0.8} delay={0.1} />
                  </p>
                  <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-xs text-gray-500">Practice sessions taken</p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUp from={0} to={analytics.completedQuizzes} duration={0.8} delay={0.15} />
                  </p>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-xs text-gray-500">Finished quiz sessions</p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUp from={0} to={analytics.averageScore} duration={0.8} delay={0.2} />
                    <span className="text-lg text-gray-600">%</span>
                  </p>
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-xs text-gray-500">Overall performance</p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-pink-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUp from={0} to={analytics.totalStudyTime} duration={0.8} delay={0.25} />
                  </p>
                  <p className="text-sm font-medium text-gray-600">Study Minutes</p>
                  <p className="text-xs text-gray-500">Time spent practicing</p>
                </div>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-gray-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  </div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    <CountUp from={0} to={questionsInRange.filter(q => q.hidden).length} duration={0.8} delay={0.3} />
                  </p>
                  <p className="text-sm font-medium text-gray-600">Hidden Questions</p>
                  <p className="text-xs text-gray-500">Draft/incomplete questions</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            
            {/* Performance by Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Performance by Section</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">Section Performance Analysis:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Calculation:</strong> (Correct answers ÷ Total questions) × 100</li>
                        <li>• <strong>Data Source:</strong> All questions you've added to each section</li>
                        <li>• <strong>Purpose:</strong> Shows which SAT sections you perform best/worst in</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50/50 to-transparent pointer-events-none rounded-lg"></div>
                {Object.keys(analytics.sectionStats).length > 0 ? (
                  <Bar data={sectionChartData} options={chartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-sm">No section data available</p>
                      <p className="text-xs text-gray-400">Complete quizzes to see section performance</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Over Time */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Quiz Progress</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">Quiz Progress Tracking:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Data Shown:</strong> Your last 10 completed quizzes</li>
                        <li>• <strong>Y-Axis:</strong> Quiz score percentage (0-100%)</li>
                        <li>• <strong>Trend Analysis:</strong> Shows improvement or decline over time</li>
                        <li>• <strong>Purpose:</strong> Track your overall learning progression</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-green-50/30 to-transparent pointer-events-none rounded-lg"></div>
                {analytics.recentQuizzes.length > 0 ? (
                  <Line data={progressChartData} options={lineChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📈</div>
                      <p>No quiz data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Domain and Question Type Occurrence Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Domain Distribution (Math) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Domain Distribution (Math)</h3>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/30 to-transparent pointer-events-none rounded-lg"></div>
                {Object.keys(domainStatsMath).length > 0 ? (
                  <Bar data={domainOccurrenceDataMath} options={occurrenceChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏷️</div>
                      <p>No domain data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Domain Distribution (Reading & Writing) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Domain Distribution (Reading & Writing)</h3>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-50/30 to-transparent pointer-events-none rounded-lg"></div>
                {Object.keys(domainStatsRW).length > 0 ? (
                  <Bar data={domainOccurrenceDataRW} options={occurrenceChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏷️</div>
                      <p>No domain data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Question Type Distribution Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Question Type Distribution (Math) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Question Types (Math)</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">Math Question Type Distribution:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Shows count of questions for each math question type</li>
                        <li>• <strong>Total:</strong> All questions in your library</li>
                        <li>• <strong>Attempted:</strong> Questions you've answered in completed quizzes</li>
                        <li>• Helps identify which types you practice most/least</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="space-y-2">
                {Object.keys(questionTypeStatsMath).length > 0 ? (
                  Object.entries(questionTypeStatsMath)
                    .filter(([, stats]) => stats.total >= 1)
                    .sort(([,a], [,b]) => b.total - a.total)
                    .slice(0, 5)
                    .map(([type, stats], index) => (
                      <div key={type} className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-200 hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate" title={type}>{type}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-emerald-600">{stats.total}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl">🔧</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">No math question types available</p>
                    <p className="text-xs text-gray-600">Add math questions to see type distribution</p>
                  </div>
                )}
              </div>
            </div>

            {/* Question Type Distribution (Reading & Writing) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-indigo-500 to-blue-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Question Types (Reading & Writing)</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">Reading & Writing Question Type Distribution:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• Shows count of questions for each R&W question type</li>
                        <li>• <strong>Total:</strong> All questions in your library</li>
                        <li>• <strong>Attempted:</strong> Questions you've answered in completed quizzes</li>
                        <li>• Helps identify which types you practice most/least</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="space-y-2">
                {Object.keys(questionTypeStatsRW).length > 0 ? (
                  Object.entries(questionTypeStatsRW)
                    .filter(([, stats]) => stats.total >= 1)
                    .sort(([,a], [,b]) => b.total - a.total)
                    .slice(0, 5)
                    .map(([type, stats], index) => (
                      <div key={type} className="group relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-2 border border-purple-200 hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-900 truncate" title={type}>{type}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-purple-600">{stats.total}</p>
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl">🔧</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">No R&W question types available</p>
                    <p className="text-xs text-gray-600">Add reading & writing questions to see type distribution</p>
                  </div>
                )}
              </div>
            </div>
          </div>



          {/* Additional Modern Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Difficulty Analysis - Modern Design */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Difficulty Analysis</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">Question Difficulty Performance:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Easy:</strong> Basic concepts and straightforward problems</li>
                        <li>• <strong>Medium:</strong> Intermediate complexity requiring analysis</li>
                        <li>• <strong>Hard:</strong> Advanced problems requiring multiple steps</li>
                        <li>• <strong>Calculation:</strong> (Correct answers ÷ Total questions) × 100</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="h-48 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-50/30 to-transparent pointer-events-none rounded-lg"></div>
                {Object.values(analytics.difficultyStats).some(stat => stat.total > 0) ? (
                  <Doughnut data={difficultyChartData} options={doughnutOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-sm">No difficulty data available</p>
                      <p className="text-xs text-gray-400">Complete quizzes to see performance by difficulty</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section Performance - Enhanced Design */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Section Performance Detail</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">SAT Section Performance:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Reading:</strong> Comprehension and analysis skills</li>
                        <li>• <strong>Writing:</strong> Grammar, style, and expression</li>
                        <li>• <strong>Math:</strong> Problem-solving and calculations</li>
                        <li>• <strong>Progress bars</strong> show accuracy percentage</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="space-y-4">
                {Object.entries(analytics.sectionStats).length > 0 ? (
                  Object.entries(analytics.sectionStats).map(([section, stats]) => {
                    const sectionAccuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
                    const getSectionColor = (section) => {
                      switch(section.toLowerCase()) {
                        case 'reading': return 'from-green-500 to-emerald-600';
                        case 'writing': return 'from-blue-500 to-cyan-600';
                        case 'math': return 'from-purple-500 to-violet-600';
                        default: return 'from-indigo-500 to-blue-600';
                      }
                    };
                    return (
                      <div key={section} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-gray-900">{section}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">{sectionAccuracy}%</span>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${getSectionColor(section)} h-3 rounded-full transition-all duration-1000 ease-out shadow-sm relative`}
                            style={{ width: `${sectionAccuracy}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span className="font-medium">{stats.correct} correct answers</span>
                          <span className="font-medium">{stats.attempted} attempted questions</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl">📚</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">No section data available</p>
                    <p className="text-xs text-gray-600">Complete quizzes to see section performance</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section Performance Cards */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 transition-all duration-300 relative overflow-hidden mb-6 sm:mb-8 hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500"></div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full shadow-sm"></div>
              <h3 className="text-lg font-semibold text-gray-900">Section Performance</h3>
              <InfoTooltip
                content={
                  <div>
                    <div className="font-semibold mb-2">Section Performance Breakdown:</div>
                    <ul className="space-y-1 text-xs">
                      <li>• <strong>Reading:</strong> Comprehension and analysis skills</li>
                      <li>• <strong>Writing:</strong> Grammar, style, and expression</li>
                      <li>• <strong>Math:</strong> Problem-solving and calculations</li>
                      <li>• <strong>Progress bars</strong> show accuracy percentage</li>
                    </ul>
                  </div>
                }
              />
            </div>
            <div className="space-y-4">
              {Object.entries(analytics.sectionStats).length > 0 ? (
                Object.entries(analytics.sectionStats).map(([section, stats]) => {
                  const sectionAccuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0;
                  const getSectionColor = (section) => {
                    switch(section.toLowerCase()) {
                      case 'reading': return 'from-green-500 to-emerald-600';
                      case 'writing': return 'from-blue-500 to-cyan-600';
                      case 'math': return 'from-purple-500 to-violet-600';
                      default: return 'from-indigo-500 to-blue-600';
                    }
                  };
                  return (
                    <div key={section} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                        <span className="text-sm font-semibold text-gray-900">{section}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{sectionAccuracy}%</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${getSectionColor(section)} h-3 rounded-full transition-all duration-1000 ease-out shadow-sm relative`}
                          style={{ width: `${sectionAccuracy}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-600 gap-1">
                        <span className="font-medium">{stats.correct} correct answers</span>
                        <span className="font-medium">{stats.attempted} attempted questions</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <div className="text-2xl">📚</div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No section data available</p>
                  <p className="text-xs text-gray-600">Complete quizzes to see section performance</p>
                </div>
              )}
            </div>
          </div>

          {/* New Advanced Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            
            {/* Recent Quiz Activity */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Quiz Activity</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">Quiz Activity Overview:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Last 7 Quizzes:</strong> Your recent quiz scores</li>
                        <li>• <strong>Trend:</strong> Shows improvement or decline</li>
                        <li>• <strong>Goal:</strong> Aim for consistent high scores</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="space-y-4 flex-1 flex flex-col">
                {analytics.recentQuizzes.length > 0 ? (
                  <div className="space-y-3 flex-1 flex flex-col justify-around">
                    {/* First row - quizzes 1-7 (oldest) */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
                      {analytics.recentQuizzes.slice(0, 7).map((quiz, i) => (
                        <div key={`first-${i}`} className="text-center">
                          <div className="text-xs text-gray-600 font-medium mb-1 sm:mb-2">
                            Q{quiz.quiz}
                          </div>
                          <div className={`h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                            quiz.score >= 80 
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                              : quiz.score >= 60 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                              : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                          }`}>
                            {quiz.score}%
                          </div>
                        </div>
                      ))}
                      {/* Fill remaining slots in first row if less than 7 quizzes */}
                      {Array.from({length: Math.max(0, 7 - Math.min(analytics.recentQuizzes.length, 7))}, (_, i) => (
                        <div key={`empty-first-${i}`} className="text-center">
                          <div className="text-xs text-gray-400 font-medium mb-1 sm:mb-2">-</div>
                          <div className="h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs bg-gray-100 text-gray-400">
                            --
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Second row - quizzes 8-14 */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
                      {analytics.recentQuizzes.slice(7, 14).map((quiz, i) => (
                        <div key={`second-${i}`} className="text-center">
                          <div className="text-xs text-gray-600 font-medium mb-1 sm:mb-2">
                            Q{quiz.quiz}
                          </div>
                          <div className={`h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                            quiz.score >= 80 
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                              : quiz.score >= 60 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                              : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                          }`}>
                            {quiz.score}%
                          </div>
                        </div>
                      ))}
                      {/* Fill remaining slots in second row if less than 7 quizzes */}
                      {Array.from({length: Math.max(0, 7 - Math.min(Math.max(0, analytics.recentQuizzes.length - 7), 7))}, (_, i) => (
                        <div key={`empty-second-${i}`} className="text-center">
                          <div className="text-xs text-gray-400 font-medium mb-1 sm:mb-2">-</div>
                          <div className="h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs bg-gray-100 text-gray-400">
                            --
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Third row - quizzes 15-21 */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
                      {analytics.recentQuizzes.slice(14, 21).map((quiz, i) => (
                        <div key={`third-${i}`} className="text-center">
                          <div className="text-xs text-gray-600 font-medium mb-1 sm:mb-2">
                            Q{quiz.quiz}
                          </div>
                          <div className={`h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                            quiz.score >= 80 
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                              : quiz.score >= 60 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                              : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                          }`}>
                            {quiz.score}%
                          </div>
                        </div>
                      ))}
                      {/* Fill remaining slots in third row if less than 7 quizzes */}
                      {Array.from({length: Math.max(0, 7 - Math.min(Math.max(0, analytics.recentQuizzes.length - 14), 7))}, (_, i) => (
                        <div key={`empty-third-${i}`} className="text-center">
                          <div className="text-xs text-gray-400 font-medium mb-1 sm:mb-2">-</div>
                          <div className="h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs bg-gray-100 text-gray-400">
                            --
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Fourth row - quizzes 22-28 (most recent) */}
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-2">
                      {analytics.recentQuizzes.slice(21, 28).map((quiz, i) => (
                        <div key={`fourth-${i}`} className="text-center">
                          <div className="text-xs text-gray-600 font-medium mb-1 sm:mb-2">
                            Q{quiz.quiz}
                          </div>
                          <div className={`h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                            quiz.score >= 80 
                              ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
                              : quiz.score >= 60 
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                              : 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                          }`}>
                            {quiz.score}%
                          </div>
                        </div>
                      ))}
                      {/* Fill remaining slots in fourth row if less than 7 quizzes */}
                      {Array.from({length: Math.max(0, 7 - Math.min(Math.max(0, analytics.recentQuizzes.length - 21), 7))}, (_, i) => (
                        <div key={`empty-fourth-${i}`} className="text-center">
                          <div className="text-xs text-gray-400 font-medium mb-1 sm:mb-2">-</div>
                          <div className="h-8 sm:h-12 rounded-lg flex items-center justify-center text-xs bg-gray-100 text-gray-400">
                            --
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="text-sm">No quiz activity yet</p>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-gray-600 mt-auto pt-4">
                  <span>Poor (0-59%)</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                    <div className="w-3 h-3 bg-green-400 rounded"></div>
                  </div>
                  <span>Excellent (80%+)</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">Performance Metrics:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Score Trend:</strong> Recent vs overall average</li>
                        <li>• <strong>Study Time:</strong> Total minutes practiced</li>
                        <li>• <strong>Question Coverage:</strong> % of questions attempted</li>
                        <li>• <strong>Domain Coverage:</strong> Number of domains practiced</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 flex-1">
                <div className="text-center p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 flex flex-col justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-700 mb-1">
                    {analytics.recentQuizzes.length > 0 ? (
                      (() => {
                        const recentQuizzes = analytics.recentQuizzes.slice(-3);
                        const recentAvg = recentQuizzes.length > 0 
                          ? Math.round(recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / recentQuizzes.length)
                          : 0;
                        
                        // If we have 3 or fewer quizzes total, compare recent vs first quiz
                        // If we have more than 3 quizzes, compare recent vs overall average
                        let comparisonValue;
                        if (analytics.recentQuizzes.length <= 3) {
                          // Compare recent average vs first quiz score
                          comparisonValue = analytics.recentQuizzes[0]?.score || 0;
                        } else {
                          // Compare recent average vs overall average (excluding recent 3)
                          const olderQuizzes = analytics.recentQuizzes.slice(0, -3);
                          comparisonValue = olderQuizzes.length > 0 
                            ? Math.round(olderQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / olderQuizzes.length)
                            : analytics.averageScore;
                        }
                        
                        const trend = recentAvg - comparisonValue;
                        return trend > 0 ? `+${trend}%` : `${trend}%`;
                      })()
                    ) : '0%'}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Score Trend</div>
                </div>
                
                <div className="text-center p-3 sm:p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 flex flex-col justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-green-700 mb-1">
                    {analytics.totalStudyTime}m
                  </div>
                  <div className="text-sm text-green-600 font-medium">Study Time</div>
                </div>
                
                <div className="text-center p-3 sm:p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 flex flex-col justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-2 sm:mb-3 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-purple-700 mb-1">
                    {analytics.totalQuestions > 0 ? Math.round((analytics.answeredQuestions / analytics.totalQuestions) * 100) : 0}%
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Questions Tried</div>
                </div>
                
                <div className="text-center p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-orange-700 mb-1">
                    {analytics.totalDomains}
                  </div>
                  <div className="text-sm text-orange-600 font-medium">Domains</div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage; 