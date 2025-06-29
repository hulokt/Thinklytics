import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement, Filler } from 'chart.js';
import { useQuestionAnswers } from '../hooks/useUserData';
import { useQuizManager } from './QuizManager';
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

  // Ensure all data is properly formatted as arrays
  const completedQuizzesArray = Array.isArray(completedQuizzes) ? completedQuizzes : [];
  const inProgressQuizzesArray = Array.isArray(inProgressQuizzes) ? inProgressQuizzes : [];
  const questionsArray = Array.isArray(questions) ? questions : [];
  const questionAnswersObj = questionAnswers && typeof questionAnswers === 'object' ? questionAnswers : {};

  const generateAnalytics = useCallback(() => {
    console.log('🔄 Generating analytics with data:', {
      completedQuizzes: completedQuizzesArray.length,
      inProgressQuizzes: inProgressQuizzesArray.length,
      totalQuestions: questionsArray.length,
      questionAnswersKeys: Object.keys(questionAnswersObj).length
    });

    // Basic stats
    const totalQuizzes = completedQuizzesArray.length + inProgressQuizzesArray.length;
    const totalQuestions = questionsArray.length;
    
    // Calculate answered questions based on completed quizzes only
    const answeredQuestions = Object.keys(questionAnswersObj).filter(questionId => {
      const answers = questionAnswersObj[questionId];
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

    console.log('⏱️ Study time calculation:', {
      totalStudyTime,
      completedQuizzesWithTime: completedQuizzesArray.filter(q => q.timeSpent && q.timeSpent > 0).length,
      totalTimeSpent: completedQuizzesArray.reduce((sum, quiz) => sum + (quiz.timeSpent || 0), 0),
      completedQuizzes: completedQuizzesArray.map(q => ({ 
        id: q.id, 
        timeSpent: q.timeSpent, 
        score: q.score,
        status: q.status,
        hasEndTime: !!q.endTime
      }))
    });

    // Performance by section - calculate based on completed quiz results only
    const sectionStats = {};
    questionsArray.forEach(question => {
      const section = question.section || 'Unknown';
      if (!sectionStats[section]) {
        sectionStats[section] = { total: 0, correct: 0, attempted: 0 };
      }
      sectionStats[section].total++;
      
      // Check if this question has been answered in any completed quiz
      if (questionAnswersObj[question.id]) {
        const answers = questionAnswersObj[question.id];
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

    // Domain statistics - calculate based on completed quiz results only
    const domainStats = {};
    questionsArray.forEach(question => {
      const domain = question.domain || 'Unknown';
      if (!domainStats[domain]) {
        domainStats[domain] = { total: 0, attempted: 0, correct: 0, wrong: 0 };
      }
      domainStats[domain].total++;
      
      // Check if this question has been answered in completed quizzes
      if (questionAnswersObj[question.id]) {
        const answers = questionAnswersObj[question.id];
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

    // Question type statistics - calculate based on completed quiz results only
    const questionTypeStats = {};
    
    // Debug: Log all questions to see their types
    console.log('🔍 Question Type Analysis - All Questions:', {
      totalQuestions: questionsArray.length,
      questionTypes: questionsArray.map(q => ({
        id: q.id,
        section: q.section,
        domain: q.domain,
        questionType: q.questionType,
        difficulty: q.difficulty
      }))
    });
    
    questionsArray.forEach(question => {
      const type = question.questionType || 'Unknown';
      if (!questionTypeStats[type]) {
        questionTypeStats[type] = { total: 0, attempted: 0, correct: 0, wrong: 0 };
      }
      questionTypeStats[type].total++;
      
      // Check if this question has been answered in completed quizzes only
      if (questionAnswersObj[question.id]) {
        const answers = questionAnswersObj[question.id];
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
    console.log('🔍 Question Type Statistics Final:', {
      questionTypeStats: Object.entries(questionTypeStats).map(([type, stats]) => ({
        type,
        total: stats.total,
        attempted: stats.attempted,
        correct: stats.correct,
        wrong: stats.wrong
      }))
    });

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

    console.log('📊 Recent quizzes data:', {
      completedQuizzesArray: completedQuizzesArray.map(q => ({
        id: q.id,
        quizNumber: q.quizNumber,
        score: q.score,
        date: q.date,
        lastUpdated: q.lastUpdated
      })),
      recentQuizzes: recentQuizzes,
      averageScore
    });

    // Question difficulty analysis - calculate based on completed quiz results only
    const difficultyStats = {
      'Easy': { total: 0, correct: 0 },
      'Medium': { total: 0, correct: 0 },
      'Hard': { total: 0, correct: 0 }
    };

    questionsArray.forEach(question => {
      const difficulty = question.difficulty || 'Medium';
      if (difficultyStats[difficulty]) {
        difficultyStats[difficulty].total++;
        
        // Check if this question has been answered correctly in completed quizzes
        if (questionAnswersObj[question.id]) {
          const answers = questionAnswersObj[question.id];
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

    console.log('📊 Analytics generated:', {
      totalQuizzes,
      completedQuizzes: completedQuizzesArray.length,
      averageScore,
      totalStudyTime,
      answeredQuestions,
      totalQuestions,
      recentQuizzes: recentQuizzes.length,
      strugglingDomains: strugglingDomains.length,
      strugglingTypes: strugglingTypes.length,
      difficultyStats,
      sectionStats,
      domainStats: Object.keys(domainStats).length,
      questionTypeStats: Object.keys(questionTypeStats).length
    });

    // Debug struggling domains calculation
    console.log('🔍 Struggling domains calculation:', {
      allDomains: Object.entries(domainStats).map(([domain, stats]) => ({
        domain,
        attempted: stats.attempted,
        correct: stats.correct,
        wrong: stats.wrong,
        incorrectPercentage: stats.attempted > 0 ? Math.round((stats.wrong / stats.attempted) * 100) : 0
      })),
      filteredDomains: Object.entries(domainStats)
        .filter(([_, stats]) => stats.wrong >= 2)
        .map(([domain, stats]) => ({
          domain,
          attempted: stats.attempted,
          correct: stats.correct,
          wrong: stats.wrong,
          incorrectPercentage: stats.attempted > 0 ? Math.round((stats.wrong / stats.attempted) * 100) : 0
        })),
      finalStrugglingDomains: strugglingDomains,
      completedQuizzesForValidation: completedQuizzesArray.map(q => ({
        id: q.id,
        score: q.score,
        status: q.status,
        hasEndTime: !!q.endTime
      }))
    });

    // Debug section performance calculation
    console.log('🔍 Section performance calculation:', {
      sectionStats: Object.entries(sectionStats).map(([section, stats]) => ({
        section,
        total: stats.total,
        attempted: stats.attempted,
        correct: stats.correct,
        accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0
      })),
      completedQuizzesCount: completedQuizzesArray.length,
      questionAnswersSample: Object.keys(questionAnswersObj).slice(0, 3).map(qId => ({
        questionId: qId,
        answers: questionAnswersObj[qId]?.length || 0,
        completedAnswers: questionAnswersObj[qId]?.filter(answer => 
          completedQuizzesArray.some(quiz => 
            quiz.id === answer.quizId && 
            ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
             quiz.status === 'completed')
          )
        ).length || 0
      }))
    });

    // Debug question type performance calculation
    console.log('🔍 Question type performance calculation:', {
      allQuestionTypes: Object.entries(questionTypeStats).map(([type, stats]) => ({
        type,
        attempted: stats.attempted,
        correct: stats.correct,
        wrong: stats.wrong,
        incorrectPercentage: stats.attempted > 0 ? Math.round((stats.wrong / stats.attempted) * 100) : 0
      })),
      filteredQuestionTypes: Object.entries(questionTypeStats)
        .filter(([_, stats]) => stats.wrong >= 2)
        .map(([type, stats]) => ({
          type,
          attempted: stats.attempted,
          correct: stats.correct,
          wrong: stats.wrong,
          incorrectPercentage: stats.attempted > 0 ? Math.round((stats.wrong / stats.attempted) * 100) : 0
        })),
      finalStrugglingTypes: strugglingTypes,
      completedQuizzesForValidation: completedQuizzesArray.map(q => ({
        id: q.id,
        score: q.score,
        status: q.status,
        hasEndTime: !!q.endTime
      })),
      questionAnswersValidation: Object.keys(questionAnswersObj).slice(0, 3).map(qId => ({
        questionId: qId,
        totalAnswers: questionAnswersObj[qId]?.length || 0,
        completedAnswers: questionAnswersObj[qId]?.filter(answer => 
          completedQuizzesArray.some(quiz => 
            quiz.id === answer.quizId && 
            ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
             quiz.status === 'completed')
          )
        ).length || 0,
        correctAnswers: questionAnswersObj[qId]?.filter(answer => 
          answer.isCorrect === true && 
          completedQuizzesArray.some(quiz => 
            quiz.id === answer.quizId && 
            ((quiz.score !== undefined && quiz.score !== null && quiz.endTime !== undefined && quiz.endTime !== null) || 
             quiz.status === 'completed')
          )
        ).length || 0
      }))
    });

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
  }, [completedQuizzesArray, inProgressQuizzesArray, questionsArray, questionAnswersObj]);

  // Call generateAnalytics when data changes
  useEffect(() => {
    console.log('🔄 Analytics useEffect triggered:', {
      completedQuizzesLength: completedQuizzesArray.length,
      questionAnswersKeys: Object.keys(questionAnswersObj).length,
      questionsLength: questionsArray.length,
      inProgressQuizzesLength: inProgressQuizzesArray.length
    });
    
    if (completedQuizzesArray !== undefined && questionAnswersObj !== undefined && inProgressQuizzesArray !== undefined) {
      generateAnalytics();
    }
  }, [completedQuizzesArray.length, Object.keys(questionAnswersObj).length, questionsArray.length, inProgressQuizzesArray.length, generateAnalytics]);

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
    <div className="h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header - Modern Design */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Analytics Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">
              Track your performance and progress with advanced insights
            </p>
          </div>
          {/* If you add controls/buttons here in the future, wrap them in a flex-col md:flex-row group with w-full md:w-auto */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full px-3 sm:px-6 py-4 sm:py-6 pb-20 sm:pb-6">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
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
                    <CountUp from={0} to={questions.length} duration={0.8} />
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

          {/* Question Type Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Question Type Distribution (Math) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Question Type Distribution (Math)</h3>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/30 to-transparent pointer-events-none rounded-lg"></div>
                {Object.keys(questionTypeStatsMath).length > 0 ? (
                  <Bar data={questionTypeOccurrenceDataMath} options={occurrenceChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔧</div>
                      <p>No question type data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Question Type Distribution (Reading & Writing) */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Question Type Distribution (Reading & Writing)</h3>
              </div>
              <div className="h-64 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/30 to-transparent pointer-events-none rounded-lg"></div>
                {Object.keys(questionTypeStatsRW).length > 0 ? (
                  <Bar data={questionTypeOccurrenceDataRW} options={occurrenceChartOptions} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔧</div>
                      <p>No question type data available</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

                      {/* Struggling Areas - Modern Design */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Most Challenging Domains</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">How We Determine Most Challenging Domains:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Accuracy:</strong> Correct ÷ Attempted × 100</li>
                        <li>• <strong>Minimum:</strong> 2+ attempted questions</li>
                        <li>• <strong>Ranking:</strong> Lowest accuracy first</li>
                        <li>• <strong>Max Shown:</strong> Top 3 domains only</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="space-y-3">
                {analytics.strugglingDomains.length > 0 ? (
                  analytics.strugglingDomains.map((item, index) => (
                    <div key={item.domain} className="group relative bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.domain}</p>
                            <p className="text-xs text-gray-600">{item.attempted} questions attempted</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-red-600">{item.incorrectPercentage}%</p>
                          <p className="text-xs text-red-500 font-medium">{item.wrong} wrong</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl">🎉</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {analytics.completedQuizzes > 0 ? 'Great job!' : 'No challenging domains yet'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {analytics.completedQuizzes > 0 
                        ? 'You\'re performing well across all domains!' 
                        : 'Complete quizzes to see your challenging areas'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full shadow-sm"></div>
                <h3 className="text-lg font-semibold text-gray-900">Most Challenging Question Types</h3>
                <InfoTooltip
                  content={
                    <div>
                      <div className="font-semibold mb-2">How We Determine Most Challenging Question Types:</div>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Accuracy:</strong> Correct ÷ Attempted × 100</li>
                        <li>• <strong>Minimum:</strong> 2+ attempted questions</li>
                        <li>• <strong>Ranking:</strong> Lowest accuracy first</li>
                        <li>• <strong>Max Shown:</strong> Top 3 types only</li>
                      </ul>
                    </div>
                  }
                />
              </div>
              <div className="space-y-3">
                {analytics.strugglingTypes.length > 0 ? (
                  analytics.strugglingTypes.map((item, index) => (
                    <div key={item.type} className="group relative bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.type}</p>
                            <p className="text-xs text-gray-600">{item.attempted} questions attempted</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-orange-600">{item.incorrectPercentage}%</p>
                          <p className="text-xs text-orange-500 font-medium">{item.wrong} wrong</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <div className="text-2xl">🎉</div>
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      {analytics.completedQuizzes > 0 ? 'Excellent work!' : 'No challenging types yet'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {analytics.completedQuizzes > 0 
                        ? 'You\'re mastering all question types!' 
                        : 'Complete quizzes to see your challenging question types'}
                    </p>
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
                        
                        console.log('📈 Score trend calculation:', {
                          recentQuizzes: recentQuizzes.map(q => q.score),
                          recentAvg,
                          comparisonValue,
                          trend,
                          totalQuizzes: analytics.recentQuizzes.length
                        });
                        
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