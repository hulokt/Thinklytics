import { supabase } from './supabaseClient';

// Points configuration
export const POINTS_CONFIG = {
  ADD_QUESTION: 10,
  EDIT_QUESTION: 5,
  DELETE_QUESTION: -2,
  COMPLETE_QUIZ: 25,
  HIGH_SCORE_BONUS: 15,
  DAILY_LOGIN: 2,
  EDIT_ANSWER: 3,
  FIRST_QUIZ: 25,
  STREAK_BONUS: 5
};

// Local storage keys for counters
const EDIT_COUNTER_KEY = 'satlog_edit_counter';
const HIGH_SCORE_COUNTER_KEY = 'satlog_high_score_counter';

// Local counter management
export const getEditCounter = () => {
  try {
    return parseInt(localStorage.getItem(EDIT_COUNTER_KEY) || '0', 10);
  } catch {
    return 0;
  }
};

export const incrementEditCounter = () => {
  try {
    const current = getEditCounter();
    const newValue = current + 1;
    localStorage.setItem(EDIT_COUNTER_KEY, newValue.toString());
  
    return newValue;
  } catch (error) {

    return 0;
  }
};

export const getHighScoreCounter = () => {
  try {
    return parseInt(localStorage.getItem(HIGH_SCORE_COUNTER_KEY) || '0', 10);
  } catch {
    return 0;
  }
};

export const incrementHighScoreCounter = () => {
  try {
    const current = getHighScoreCounter();
    const newValue = current + 1;
    localStorage.setItem(HIGH_SCORE_COUNTER_KEY, newValue.toString());
  
    return newValue;
  } catch (error) {

    return 0;
  }
};

// Reset counters (for testing or user preference)
export const resetCounters = () => {
  try {
    localStorage.removeItem(EDIT_COUNTER_KEY);
    localStorage.removeItem(HIGH_SCORE_COUNTER_KEY);
  
  } catch (error) {

  }
};

// Calculate user stats in real-time from actual data
export async function getUserStats(userId) {

  
  if (!userId) {

    return null;
  }

  try {
  
    
    // Get all user data from Supabase
    const { data: allUserData, error: dataError } = await supabase
      .from('user_data')
      .select('data_type, data, created_at, updated_at')
      .eq('user_id', userId);

    if (dataError) {
  
      return null;
    }

  

    // Get user profile info
    const { data: profile } = await supabase.auth.getUser();
    const userName = profile?.user?.user_metadata?.name || 
                    profile?.user?.email?.split('@')[0] || 
                    'SAT User';

    // Wait for all stats calculations to complete
  
    const stats = await calculateRealTimeStats(allUserData || []);
    
    // Calculate rank based on total points
    const pointsBasedRank = Math.floor(stats.totalPoints / 100) + 1;
    const progressToNext = stats.totalPoints % 100;
    const nextRankPoints = Math.floor(stats.totalPoints / 100 + 1) * 100;

    const result = {
      name: userName,
      avatar: userName?.charAt(0).toUpperCase() || 'U',
      points: stats.totalPoints,
      rank: pointsBasedRank,
      rank_position: pointsBasedRank,
      questions_added: stats.questionsCount,
      quizzes_completed: stats.quizzesCompleted,
      edits: stats.editsCount,
      high_scores: stats.highScoresCount,
      daily_logins: stats.dailyLogins,
      streak_days: stats.streakDays,
      last_login: stats.lastLogin,
      progressToNext: progressToNext,
      nextRankPoints: nextRankPoints
    };

  
    return result;
  } catch (error) {

    return null;
  }
}

// Calculate all stats from real data and local counters
async function calculateRealTimeStats(allUserData) {

  
  // Get direct counts from actual data
  const questionsCount = await getActualQuestionsCount(allUserData);
  const quizzesCompleted = await getActualCompletedQuizzesCount(allUserData);
  
  // Get local counters
  const editsCount = getEditCounter();
  const highScoresCount = getHighScoreCounter();
  
  // Calculate login statistics
  const loginData = calculateLoginStats(allUserData);
  const dailyLogins = loginData.dailyLogins;
  const streakDays = loginData.streakDays;
  const lastLogin = loginData.lastLogin;

  // Calculate total points
  const pointsFromQuestions = questionsCount * POINTS_CONFIG.ADD_QUESTION;
  const pointsFromQuizzes = quizzesCompleted * POINTS_CONFIG.COMPLETE_QUIZ;
  const pointsFromEdits = editsCount * POINTS_CONFIG.EDIT_QUESTION;
  const pointsFromHighScores = highScoresCount * POINTS_CONFIG.HIGH_SCORE_BONUS;
  const pointsFromLogins = dailyLogins * POINTS_CONFIG.DAILY_LOGIN;
  
  // Add streak bonuses (every 3 consecutive days)
  const streakBonuses = Math.floor(streakDays / 3) * POINTS_CONFIG.STREAK_BONUS;
  
  const totalPoints = pointsFromQuestions + pointsFromQuizzes + pointsFromEdits + 
                     pointsFromHighScores + pointsFromLogins + streakBonuses;


  return {
    questionsCount,
    quizzesCompleted,
    editsCount,
    highScoresCount,
    dailyLogins,
    streakDays,
    lastLogin,
    totalPoints
  };
}

// Get actual number of questions in question bank
async function getActualQuestionsCount(allUserData) {

  
  // Try multiple possible data type names
  const possibleQuestionTypes = [
    'sat_master_log_questions',
    'questions'
  ];
  
  let questionsData = null;
  for (const dataType of possibleQuestionTypes) {
    questionsData = allUserData.find(item => item.data_type === dataType);
    if (questionsData?.data) {
  
      break;
    }
  }
  
  if (!questionsData?.data) {
  
  
    return 0;
  }

  let count = 0;
  
  if (Array.isArray(questionsData.data)) {
    count = questionsData.data.length;

  } else if (typeof questionsData.data === 'object') {
    // Sometimes the data might be stored as an object
    count = Object.keys(questionsData.data).length;

  }
  
  return count;
}

// Get actual number of completed quizzes from quiz history
async function getActualCompletedQuizzesCount(allUserData) {

  
  // Try multiple possible data type names for quiz data
  const possibleQuizTypes = [
    'sat_master_log_all_quizzes',
    'all_quizzes',
    'sat_master_log_quiz_history', 
    'quiz_history'
  ];
  
  // Try all_quizzes first (unified storage)
  for (const dataType of ['sat_master_log_all_quizzes', 'all_quizzes']) {
    const allQuizzesData = allUserData.find(item => item.data_type === dataType);
    if (allQuizzesData?.data && Array.isArray(allQuizzesData.data)) {
      const completedQuizzes = allQuizzesData.data.filter(quiz => quiz.status === 'completed');
  
      return completedQuizzes.length;
    }
  }
  
  // Fallback to quiz_history
  for (const dataType of ['sat_master_log_quiz_history', 'quiz_history']) {
    const quizHistoryData = allUserData.find(item => item.data_type === dataType);
    if (quizHistoryData?.data && Array.isArray(quizHistoryData.data)) {
      const completedQuizzes = quizHistoryData.data.filter(quiz => !quiz.isInProgress);
  
      return completedQuizzes.length;
    }
  }
  


  return 0;
}

// Calculate login statistics from user data timestamps
function calculateLoginStats(allUserData) {
  const today = new Date();
  const loginDates = new Set();
  
  // Get all unique login dates from data creation/update timestamps
  allUserData.forEach(item => {
    if (item.created_at) {
      const date = new Date(item.created_at).toDateString();
      loginDates.add(date);
    }
    if (item.updated_at && item.updated_at !== item.created_at) {
      const date = new Date(item.updated_at).toDateString();
      loginDates.add(date);
    }
  });

  const dailyLogins = loginDates.size;
  
  // Calculate streak (consecutive days with activity)
  const sortedDates = Array.from(loginDates)
    .map(dateStr => new Date(dateStr))
    .sort((a, b) => b - a); // Most recent first

  let streakDays = 0;
  let currentDate = new Date(today.toDateString());
  
  for (const loginDate of sortedDates) {
    const loginDateStr = loginDate.toDateString();
    const currentDateStr = currentDate.toDateString();
    
    if (loginDateStr === currentDateStr) {
      streakDays++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  const lastLogin = sortedDates.length > 0 ? sortedDates[0].toISOString() : null;

  return {
    dailyLogins,
    streakDays,
    lastLogin
  };
}

// Award points and increment counters as needed
export async function awardPoints(userId, actionType, additionalData = {}) {
  if (!userId) {

    return { success: false, pointsAwarded: 0 };
  }



  try {
    const pointsToAward = POINTS_CONFIG[actionType] || 0;
    
    // Increment edit counter for edit actions
    if (actionType === 'EDIT_QUESTION') {
      incrementEditCounter();
    }
    
    // For high score bonus during quiz completion
    if (actionType === 'COMPLETE_QUIZ' && additionalData.score >= 90) {
      incrementHighScoreCounter();
      return {
        success: true,
        pointsAwarded: pointsToAward + POINTS_CONFIG.HIGH_SCORE_BONUS,
        actionType: 'HIGH_SCORE'
      };
    }
    
    // For delete actions, return negative points
    if (actionType === 'DELETE_QUESTION') {
      return {
        success: true,
        pointsAwarded: POINTS_CONFIG.DELETE_QUESTION, // This is already negative (-2)
        actionType: 'DELETE_QUESTION'
      };
    }

  
    return { 
      success: true, 
      pointsAwarded: pointsToAward,
      actionType
    };
  } catch (error) {

    return { success: false, pointsAwarded: 0 };
  }
}

// Function to handle quiz edits from quiz history
export function handleQuizEdit() {

  return incrementEditCounter();
}

// Function to handle high scores
export function handleHighScore() {

  return incrementHighScoreCounter();
}

// Get leaderboard - calculate from all users' data
export async function getLeaderboard(limit = 10) {
  try {
    // Get all users
    const { data: allUsers } = await supabase.auth.admin.listUsers();
    
    if (!allUsers?.users) {
      return [];
    }

    // Calculate stats for each user
    const userStats = await Promise.all(
      allUsers.users.slice(0, 50).map(async (user) => { // Limit to first 50 users for performance
        const stats = await getUserStats(user.id);
        return stats ? { user_id: user.id, ...stats } : null;
      })
    );

    // Filter out null results and sort by points
    const validStats = userStats.filter(stat => stat !== null);
    const sortedStats = validStats.sort((a, b) => b.points - a.points);

    return sortedStats.slice(0, limit);
  } catch (error) {

    return [];
  }
}

// Get user's rank position - calculate dynamically
export async function getUserRank(userId) {
  try {
    const userStats = await getUserStats(userId);
    return userStats?.rank || 1;
  } catch (error) {

    return 1;
  }
}

// Remove the sync function since we no longer need it
export async function syncExistingUserData(userId) {

  
  // Get current stats to show what we found
  const stats = await getUserStats(userId);
  
  if (stats) {
    return {
      success: true,
      syncedData: {
        questionsCount: stats.questions_added,
        quizzesCompleted: stats.quizzes_completed,
        editsCount: stats.edits,
        highScoresCount: stats.high_scores,
        totalPoints: stats.points,
        message: 'Real-time stats calculated from live data and local counters!'
      }
    };
  } else {
    return {
      success: false,
      error: 'Could not calculate stats from user data'
    };
  }
} 