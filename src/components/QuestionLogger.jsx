import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  SAT_SECTIONS, 
  MATH_DOMAINS,
  READING_WRITING_DOMAINS,
  getDomainOptions, 
  getQuestionTypeOptions, 
  getQuestionTypeOptionsByDomain, 
  DIFFICULTY_LEVELS, 
  ANSWER_CHOICES 
} from '../data';
import AnimatedList from './AnimatedList';
import AnimatedButton from './ui/animated-button';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { awardPoints, incrementEditCounter, handleHighScore, POINTS_CONFIG } from '../lib/userPoints';
import PointsAnimation from './PointsAnimation';
import Fuse from 'fuse.js/dist/fuse.esm.js';
import { formatRelativeTime } from '../lib/utils';
import { exportQuestionsAsPDF } from '../utils/pdfExport';
import ImageModal from './ImageModal';
import { useSoundSettings } from '../contexts/SoundSettingsContext';

// Import sound files
import addedOrEditedNewQuestionSound from '../assets/addedOrEditedNewQuestion.wav';
import deletedQuestionOrQuizSound from '../assets/deltedQuestionOrQuiz.wav';

// Helper: Levenshtein distance for fuzzy matching of question types
const levenshteinDistance = (a = "", b = "") => {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
};

// after Levenshtein helper add generic fuzzy chooser
const fuzzyChoose = (raw, candidates, threshold = 0.45) => {
  const clean = (raw || '').toLowerCase().replace(/[^a-z\s&+/]/g, '').trim();
  let best = null, bestScore = 0;
  for (const cand of candidates) {
    const dist = levenshteinDistance(clean, cand.toLowerCase());
    const sim = 1 - dist / Math.max(clean.length || 1, cand.length);
    if (sim > bestScore) {
      bestScore = sim;
      best = cand;
    }
  }
  return bestScore >= threshold ? best : null;
};

const QuestionLogger = ({ 
  questions, 
  loading = false, 
  onAddQuestion, 
  onUpdateQuestion, 
  onDeleteQuestion, 
  onBulkDeleteQuestions,
  onDeleteAllQuestions,
  headerTitle: headerTitleOverride,
  headerSubtitle: headerSubtitleOverride,
  listTitle: listTitleOverride,
  searchTerm = '',
  onSearchChange = null,
  hideSearchTips = false,
  enableCopyId = false,
}) => {
  // Ensure questions is always an array
  const questionsArray = Array.isArray(questions) ? questions : [];

  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const { soundEnabled } = useSoundSettings();
  const [pointsAnimation, setPointsAnimation] = useState({ show: false, points: 0, action: '' });
  const [addEditAudio, setAddEditAudio] = useState(null);
  const [deleteAudio, setDeleteAudio] = useState(null);

  const [formData, setFormData] = useState({
    section: SAT_SECTIONS.READING_WRITING,
    domain: '',
    questionType: '',
    passageText: '',
    passageImage: null,
    questionText: '',
    answerChoices: {
      A: '',
      B: '',
      C: '',
      D: ''
    },
    correctAnswer: 'A',
    explanation: '',
    explanationImage: null,
    difficulty: DIFFICULTY_LEVELS.MEDIUM
  });

  const [editingId, setEditingId] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [filterSection, setFilterSection] = useState('All Sections');
  const [searchQuery, setSearchQuery] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvInput, setCsvInput] = useState('');
  const [csvError, setCsvError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [csvCopied, setCsvCopied] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef(null);

  // Multi-question CSV import state
  const [csvQuestions, setCsvQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isImportMode, setIsImportMode] = useState(false);
  const [importProgress, setImportProgress] = useState({ total: 0, completed: 0 });
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [showCancelImportConfirm, setShowCancelImportConfirm] = useState(false);
  const [importedQuestions, setImportedQuestions] = useState([]);
  // Track edited questions during import to preserve user changes
  const [editedQuestions, setEditedQuestions] = useState({});
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());
  const [bulkSelectionMode, setBulkSelectionMode] = useState(false);
  // Prevent double-click on Finish Import
  const [isFinalizingImport, setIsFinalizingImport] = useState(false);
  // Bulk import state to prevent double submission
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  // Track the currently selected question for editing (not bulk selection)
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(-1);
  // Timer for updating relative timestamps every minute
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Image modal state
  const [imageModal, setImageModal] = useState({ isOpen: false, imageSrc: '', imageAlt: '' });

  // Debug useEffect to track importedQuestions state
  useEffect(() => {

  }, [importedQuestions]);

  // Update current time every minute for relative timestamp updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute (60,000 ms)

    return () => clearInterval(interval);
  }, []);

  // Initialize audio
  useEffect(() => {
    const addEditAudioInstance = new Audio(addedOrEditedNewQuestionSound);
    addEditAudioInstance.volume = 0.4;
    setAddEditAudio(addEditAudioInstance);
    
    const deleteAudioInstance = new Audio(deletedQuestionOrQuizSound);
    deleteAudioInstance.volume = 0.4;
    setDeleteAudio(deleteAudioInstance);
    
    return () => {
      if (addEditAudioInstance) {
        addEditAudioInstance.pause();
      }
      if (deleteAudioInstance) {
        deleteAudioInstance.pause();
      }
    };
  }, []);

  // Handle clicking outside the actions menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  // Award points and show animation
  const awardPointsAndAnimate = async (actionType, additionalData = {}) => {
    if (!user?.id) return;
    
    try {
      const result = await awardPoints(user.id, actionType, additionalData);
      if (result.success && result.pointsAwarded !== 0) {
        setPointsAnimation({
          show: true,
          points: result.pointsAwarded,
          action: actionType
        });
      }
    } catch (error) {
      // Error handling
    }
  };

  // Handle points animation completion
  const handlePointsAnimationComplete = () => {
    setPointsAnimation({ show: false, points: 0, action: '' });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [field]: value
      };
      
      // Reset question type when domain changes
      if (field === 'domain') {
        newFormData.questionType = '';
      }
      
      return newFormData;
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleAnswerChoiceChange = (choice, value) => {
    setFormData(prev => ({
      ...prev,
      answerChoices: {
        ...prev.answerChoices,
        [choice]: value
      }
    }));
    
    // Clear validation error for this answer choice when user starts typing
    const errorKey = `answerChoice_${choice}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Helper to detect if this is intended as a hidden question
    const isIntendedHiddenQuestion = () => {
      // Must have section, domain, and questionType
      if (!formData.section || !formData.domain || !formData.questionType) {
        return false;
      }
      
      // Check if all other fields are empty
      const passageTextEmpty = !formData.passageText || formData.passageText.trim() === '';
      const passageImageEmpty = !formData.passageImage;
      const questionTextEmpty = !formData.questionText || formData.questionText.trim() === '';
      const explanationEmpty = !formData.explanation || formData.explanation.trim() === '';
      
      // Check if all answer choices are empty
      const answerChoicesEmpty = !formData.answerChoices || 
        Object.values(formData.answerChoices).every(choice => !choice || choice.trim() === '');
      
      return passageTextEmpty && passageImageEmpty && questionTextEmpty && 
             explanationEmpty && answerChoicesEmpty;
    };

    // Check if this is intended as a hidden question
    const isHidden = isIntendedHiddenQuestion();
    
    // Validate form fields
    const errors = {};
    
    // Always validate section for all questions
    if (!formData.section) {
      errors.section = true;
    }
    
    // For Math section, domain and questionType are optional
    if (formData.section !== SAT_SECTIONS.MATH) {
      if (!formData.domain) {
        errors.domain = true;
      }
      if (!formData.questionType) {
        errors.questionType = true;
      }
    }
    
    // If not a hidden question, validate additional required fields
    if (!isHidden) {
      if (!formData.passageText.trim() && !formData.passageImage) {
        errors.passageText = true;
      }

      // For Math section, question text is optional
      if (formData.section !== SAT_SECTIONS.MATH && !formData.questionText.trim()) {
        errors.questionText = true;
      }

      // For Math section, auto-fill empty answer choices with A, B, C, D
      if (formData.section === SAT_SECTIONS.MATH) {
        const choices = ['A', 'B', 'C', 'D'];
        choices.forEach((choice, index) => {
          if (!formData.answerChoices[choice] || formData.answerChoices[choice].trim() === '') {
            formData.answerChoices[choice] = choice;
          }
        });
      } else {
        // For non-Math sections, check if any answer choice is empty
        const emptyChoices = Object.entries(formData.answerChoices)
          .filter(([key, value]) => !value.trim())
          .map(([key]) => key);
        
        if (emptyChoices.length > 0) {
          emptyChoices.forEach(choice => {
            errors[`answerChoice_${choice}`] = true;
          });
        }
      }
    }

    // If there are validation errors, set them and throw error
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Show validation error without toast
      throw new Error('Validation failed');
    }

    // Clear validation errors if validation passes
    setValidationErrors({});

    if (editingId) {
      // Perform the update operation immediately
      onUpdateQuestion(editingId, formData);
      incrementEditCounter();
      
      // Play add/edit sound immediately
      if (addEditAudio && soundEnabled) {
        addEditAudio.currentTime = 0;
        addEditAudio.play().catch(error => {
          console.log('Add/edit audio play failed:', error);
        });
      }
      
      // Show animation and award points in the background
      awardPointsAndAnimate('EDIT_QUESTION').catch(error => {
        // Error handling
      });
      
      setEditingId(null);
      setOriginalFormData(null);
      setSelectedQuestionIndex(-1);
    } else {
      // Perform the add operation immediately
      onAddQuestion(formData);
      
      // Play add/edit sound immediately
      if (addEditAudio && soundEnabled) {
        addEditAudio.currentTime = 0;
        addEditAudio.play().catch(error => {
          console.log('Add/edit audio play failed:', error);
        });
      }
      
      // Show animation and award points in the background
      awardPointsAndAnimate('ADD_QUESTION').catch(error => {
        // Error handling
      });
    }

    // Only reset form if not in import mode
    if (!isImportMode) {
      setFormData({
        section: formData.section, // Keep the current section instead of resetting to Reading and Writing
        domain: '',
        questionType: '',
        passageText: '',
        passageImage: null,
        questionText: '',
        answerChoices: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: '',
        explanationImage: null,
        difficulty: DIFFICULTY_LEVELS.MEDIUM
      });
    }
  };

  const handleEdit = (question, questionIndex = -1) => {
    setEditingId(question.id);
    setSelectedQuestionIndex(questionIndex);
    const questionData = {
      section: question.section,
      domain: question.domain,
      questionType: question.questionType,
      passageText: question.passageText,
      passageImage: question.passageImage || null,
      questionText: question.questionText,
      answerChoices: question.answerChoices,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      explanationImage: question.explanationImage || null,
      difficulty: question.difficulty
    };
    setFormData(questionData);
    setOriginalFormData(questionData);
  };

  // Function to detect if form has changes
  const hasFormChanges = () => {
    if (!editingId || !originalFormData) return false;
    
    // Compare all form fields
    const fieldsToCompare = ['section', 'domain', 'questionType', 'passageText', 'passageImage', 'questionText', 'correctAnswer', 'explanation', 'explanationImage', 'difficulty'];
    
    for (let field of fieldsToCompare) {
      if (formData[field] !== originalFormData[field]) {
        return true;
      }
    }
    
    // Compare answer choices
    for (let choice of ['A', 'B', 'C', 'D']) {
      if (formData.answerChoices[choice] !== originalFormData.answerChoices[choice]) {
        return true;
      }
    }
    
    return false;
  };

  const handleDelete = async (id) => {
    // Perform the delete operation immediately
    onDeleteQuestion(id);
    
    // Play delete sound immediately
    if (deleteAudio && soundEnabled) {
      deleteAudio.currentTime = 0;
      deleteAudio.play().catch(error => {
        console.log('Delete audio play failed:', error);
      });
    }
    
    // Show animation and award points in the background
    awardPointsAndAnimate('DELETE_QUESTION').catch(error => {
      console.error('Error awarding points:', error);
    });
  };

  const generateRandomQuestion = () => {
    const sections = Object.values(SAT_SECTIONS);
    const randomSection = sections[Math.floor(Math.random() * sections.length)];
    const domains = getDomainOptions(randomSection);
    const questionTypes = getQuestionTypeOptions(randomSection);
    const difficulties = Object.values(DIFFICULTY_LEVELS);

    const samplePassages = {
      [SAT_SECTIONS.READING_WRITING]: [
        "The concept of artificial intelligence has evolved significantly since its inception in the 1950s. Early researchers believed that machines could be programmed to think like humans within a few decades. However, the complexity of human cognition proved far greater than initially anticipated. Today, AI systems excel in specific domains but still lack the general intelligence that characterizes human thinking.",
        "Climate change represents one of the most pressing challenges of our time. Rising global temperatures have led to melting ice caps, rising sea levels, and increasingly frequent extreme weather events. Scientists worldwide are working to develop innovative solutions, from renewable energy technologies to carbon capture systems, to mitigate the effects of climate change.",
        "The Renaissance period marked a significant transformation in European art, science, and culture. Artists like Leonardo da Vinci and Michelangelo revolutionized artistic techniques, while scientists such as Galileo challenged long-held beliefs about the universe. This period of intellectual awakening laid the foundation for modern scientific inquiry and artistic expression."
      ],
      [SAT_SECTIONS.MATH]: [
        "A company manufactures rectangular boxes with a length that is 3 inches more than the width and a height that is 2 inches less than the width. If the volume of the box is 60 cubic inches, we need to find the dimensions.",
        "In a coordinate plane, a parabola opens upward with its vertex at (-2, -8). The parabola passes through the point (1, 1). We need to determine the equation of this parabola and find where it intersects the x-axis.",
        "A population of bacteria doubles every 4 hours. If there are initially 500 bacteria in a culture, we need to model the growth and determine how many bacteria will be present after 24 hours."
      ]
    };

    const sampleQuestions = {
      [SAT_SECTIONS.READING_WRITING]: [
        "Which choice completes the text with the most logical and precise word or phrase?",
        "Based on the passage, what can be inferred about the author's perspective?",
        "The author most likely includes the information about early researchers to:",
        "Which choice provides the best evidence for the answer to the previous question?"
      ],
      [SAT_SECTIONS.MATH]: [
        "What are the dimensions of the box?",
        "What is the equation of the parabola?",
        "How many bacteria will be present after 24 hours?",
        "If the pattern continues, at what time will the population first exceed 10,000?"
      ]
    };

    const sampleAnswers = {
      [SAT_SECTIONS.READING_WRITING]: [
        ["remarkable", "significant", "ordinary", "questionable"],
        ["optimistic", "skeptical", "neutral", "confused"],
        ["provide context", "criticize their methods", "support their findings", "question their motives"],
        ["Lines 5-7", "Lines 12-15", "Lines 20-23", "Lines 28-30"]
      ],
      [SAT_SECTIONS.MATH]: [
        ["Width: 3 in, Length: 6 in, Height: 1 in", "Width: 4 in, Length: 7 in, Height: 2 in", "Width: 5 in, Length: 8 in, Height: 3 in", "Width: 2 in, Length: 5 in, Height: 0 in"],
        ["y = (x + 2)² - 8", "y = (x - 2)² + 8", "y = x² + 4x + 4", "y = x² - 4x - 4"],
        ["8,000 bacteria", "4,000 bacteria", "32,000 bacteria", "16,000 bacteria"],
        ["28 hours", "32 hours", "36 hours", "40 hours"]
      ]
    };

    const sampleExplanations = {
      [SAT_SECTIONS.READING_WRITING]: [
        "The context suggests that the development was noteworthy and important, making 'significant' the most appropriate choice.",
        "The author's tone throughout the passage indicates a balanced perspective on the topic.",
        "The mention of early researchers serves to establish the historical context for the current discussion.",
        "This section of the text directly supports the inference made in the previous question."
      ],
      [SAT_SECTIONS.MATH]: [
        "Let w = width. Then length = w + 3 and height = w - 2. Volume = w(w + 3)(w - 2) = 60. Solving gives w = 4.",
        "Using vertex form y = a(x - h)² + k with vertex (-2, -8) and point (1, 1), we can solve for a = 1.",
        "Using the formula P(t) = 500 × 2^(t/4), after 24 hours: P(24) = 500 × 2^6 = 500 × 64 = 32,000.",
        "Setting 500 × 2^(t/4) > 10,000 and solving: 2^(t/4) > 20, so t > 4 × log₂(20) ≈ 17.6 hours."
      ]
    };

    const passageIndex = Math.floor(Math.random() * samplePassages[randomSection].length);
    const answerSet = sampleAnswers[randomSection][passageIndex];
    const correctAnswerIndex = Math.floor(Math.random() * 4);
    const correctAnswer = ANSWER_CHOICES[correctAnswerIndex];

    setFormData({
      section: randomSection,
      domain: domains[Math.floor(Math.random() * domains.length)],
      questionType: questionTypes[Math.floor(Math.random() * questionTypes.length)],
      passageText: samplePassages[randomSection][passageIndex],
      passageImage: null,
      questionText: sampleQuestions[randomSection][passageIndex],
      answerChoices: {
        A: answerSet[0],
        B: answerSet[1],
        C: answerSet[2],
        D: answerSet[3]
      },
      correctAnswer: correctAnswer,
      explanation: sampleExplanations[randomSection][passageIndex],
      difficulty: difficulties[Math.floor(Math.random() * difficulties.length)]
    });
  };

  // Setup Fuse.js for fuzzy searching across many fields
  const fuseOptions = {
    includeScore: true,
    shouldSort: false, // we will sort manually by score
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 2,
    keys: [
      { name: 'section', weight: 0.3 },
      { name: 'domain', weight: 0.3 },
      { name: 'questionType', weight: 0.3 },
      { name: 'difficulty', weight: 0.3 },
      { name: 'correctAnswer', weight: 0.4 },
      { name: 'questionText', weight: 0.2 },
      { name: 'passageText', weight: 0.15 },
      { name: 'answerChoices.A', weight: 0.05 },
      { name: 'answerChoices.B', weight: 0.05 },
      { name: 'answerChoices.C', weight: 0.05 },
      { name: 'answerChoices.D', weight: 0.05 },
      { name: 'explanation', weight: 0.05 }
    ]
  };

  const fuse = useMemo(() => new Fuse(questionsArray, fuseOptions), [questionsArray]);

  // Synonym map for common alternate spellings / phrases
  const synonymMap = {
    'english': SAT_SECTIONS.READING_WRITING,
    'reading writing': SAT_SECTIONS.READING_WRITING,
    'reading and writing': SAT_SECTIONS.READING_WRITING,
    'reading & writing': SAT_SECTIONS.READING_WRITING,
    'rw': SAT_SECTIONS.READING_WRITING,
    'r/w': SAT_SECTIONS.READING_WRITING,
    'maths': SAT_SECTIONS.MATH,
    'mathematics': SAT_SECTIONS.MATH,
    'mth': SAT_SECTIONS.MATH,
    'mths': SAT_SECTIONS.MATH
  };

  // Filter questions based on search query and other criteria
  const filteredQuestions = useMemo(() => {
    // Start with the complete list as received
    let filtered = [...questions];

    // Use external searchTerm if provided, otherwise use internal searchQuery
    const effectiveSearchTerm = searchTerm || searchQuery;

    // If the user has NOT typed "hidden", exclude hidden questions from the list
    const searchLower = effectiveSearchTerm.trim().toLowerCase();
    if (!searchLower.includes('hidden')) {
      filtered = filtered.filter(q => !q.hidden);
    }

    // Textual search across multiple fields (and "hidden" keyword for toggling)
    if (searchLower) {
      // Check for multiple ID search (comma or space separated)
      // If the search query looks like an ID (alphanumeric with possible separators), treat as ID search
      const cleanQuery = effectiveSearchTerm.trim().replace(/[,\s]/g, '');
      if (/^[a-zA-Z0-9\-]+$/.test(cleanQuery) && effectiveSearchTerm.trim().length >= 3) {
        const ids = effectiveSearchTerm.trim().split(/[,\s]+/).filter(id => id.trim());
        if (ids.length > 0) {
          filtered = filtered.filter(question => 
            ids.some(id => {
              const questionId = question.id ? question.id.toLowerCase() : '';
              const searchId = id.trim().toLowerCase();
              return questionId.includes(searchId);
            })
          );
        }
      } else {
        // Regular text search
        filtered = filtered.filter(question => {
          const searchableText = [
            question.section,
            question.domain,
            question.questionType,
            question.questionText,
            question.explanation,
            question.hidden ? 'hidden' : ''
          ].join(' ').toLowerCase();
          return searchableText.includes(searchLower);
        });
      }
    }

    // Helper to safely obtain a sortable timestamp
    const safeGetTime = (q) => {
      const val = q.createdAt || q.date || q.lastUpdated || 0;
      const t = new Date(val).getTime();
      return Number.isNaN(t) ? 0 : t;
    };

    // Sort newest → oldest with sensible fallbacks when no dates exist
    return filtered.sort((a, b) => {
      const diff = safeGetTime(b) - safeGetTime(a);
      if (diff !== 0) return diff;

      // Fallback to numeric id comparison if timestamps are identical / missing
      if (typeof b.id === 'number' && typeof a.id === 'number') {
        return b.id - a.id;
      }

      // Otherwise keep original relative order
      return 0;
    });
  }, [questions, searchQuery, searchTerm]);

  // Prepare questions for AnimatedList - use useMemo for performance and currentTime dependency
  const questionItems = useMemo(() => {
    return filteredQuestions.map(question => {
      // Get first 5 words from passage text
      const passageWords = (question.passageText || '').trim().split(/\s+/);
      const firstFiveWords = passageWords.slice(0, 5).join(' ');
      const passagePreview = firstFiveWords && firstFiveWords.length > 0 
        ? `${firstFiveWords}${passageWords.length > 5 ? '...' : ''}` 
        : 'No passage text';
      
      // Add hidden indicator for hidden questions
      const hiddenIndicator = question.hidden ? ' 🔒' : '';
      
      // Add timestamp (currentTime dependency ensures this updates every minute)
      const timeStamp = question.createdAt || question.lastUpdated 
        ? ` • ${formatRelativeTime(question.createdAt || question.lastUpdated)}` 
        : '';
      
      return {
        text: `${question.section} | ${passagePreview}${hiddenIndicator}${timeStamp}`,
        question: question
      };
    });
  }, [filteredQuestions, currentTime]);

  const handleCopyId = (questionId, event) => {
    event.stopPropagation();
    navigator.clipboard.writeText(questionId).then(() => {
      // Show a brief notification
      const notification = document.createElement('div');
      notification.textContent = 'ID copied to clipboard!';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `;
      document.body.appendChild(notification);
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy ID:', err);
    });
  };

  const handleQuestionSelect = (item, index) => {
    if (isImportMode) {
      setShowImportWarning(true);
      return;
    }
    
    const selectedQuestion = item.question || filteredQuestions[index];
    
    if (bulkSelectionMode) {
      // In bulk selection mode, toggle selection instead of editing
      handleQuestionSelection(selectedQuestion.id);
    } else {
      // Normal mode - edit the question
      handleEdit(selectedQuestion, index);
    }
  };

  // Custom render function for question items with copy ID button
  const renderQuestionItem = (item, index, { isSelected, isHovered, isBulkSelected, className }) => {
    const question = item.question;
    return (
      <div className={`item ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''} ${isBulkSelected ? 'bulk-selected' : ''} ${className} flex items-center justify-between group`}>
        <p className="item-text flex-1">{item.text}</p>
        {enableCopyId && (
          <button
            onClick={(e) => handleCopyId(question.id, e)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Copy Question ID"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    );
  };

  // Bulk selection handlers
  const handleBulkSelectionToggle = () => {
    setBulkSelectionMode(!bulkSelectionMode);
    if (bulkSelectionMode) {
      setSelectedQuestions(new Set());
    }
  };

  const handleQuestionSelection = (questionId) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleSelectAll = () => {
    const allIds = filteredQuestions.map(q => q.id);
    setSelectedQuestions(new Set(allIds));
  };

  const handleSelectNone = () => {
    setSelectedQuestions(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedQuestions.size} selected question${selectedQuestions.size > 1 ? 's' : ''}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      const deleteIds = Array.from(selectedQuestions);
      const deleteCount = deleteIds.length;

      // Play delete sound immediately
      if (deleteAudio && soundEnabled) {
        deleteAudio.currentTime = 0;
        deleteAudio.play().catch(error => {
          console.log('Delete audio play failed:', error);
        });
      }

      // Perform bulk deletion immediately
      if (onBulkDeleteQuestions) {
        onBulkDeleteQuestions(deleteIds);
      } else {
        // Fallback: delete sequentially
        for (const qid of deleteIds) {
          onDeleteQuestion(qid);
        }
      }

      // Clear selection state & exit bulk mode immediately
      setSelectedQuestions(new Set());
      setBulkSelectionMode(false);

      // Show animation and award points in the background
      const totalDeducted = POINTS_CONFIG.DELETE_QUESTION * deleteCount; // negative value
      setPointsAnimation({
        show: true,
        points: totalDeducted,
        action: 'DELETE_QUESTION'
      });

      // Deduct points in backend silently in the background
      if (user?.id) {
        for (let i = 0; i < deleteCount; i++) {
          try {
            awardPoints(user.id, 'DELETE_QUESTION').catch(err => {
              console.error('Failed to deduct points during bulk delete:', err);
            });
          } catch (err) {
            console.error('Failed to deduct points during bulk delete:', err);
          }
        }
      }
    } catch (error) {
      console.error('Error during bulk delete:', error);
      alert('Error deleting questions. Please try again.');
    }
  };

  // Advanced CSV cleaning and parsing
  const cleanCSV = (csvString) => {
    // First, parse the CSV respecting quotes
    const parseCSV = (csvString) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < csvString.length; i++) {
        const char = csvString[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      
      // Strip quotes from beginning and end of each field
      return result.map(field => {
        if (field.startsWith('"') && field.endsWith('"')) {
          return field.slice(1, -1);
        }
        return field;
      });
    };

    // Normalize section
    const normalizeSection = (input) => {
      const sectionOptions = Object.values(SAT_SECTIONS);
      const match = fuzzyChoose(input, sectionOptions, 0.3);
      return match || SAT_SECTIONS.READING_WRITING;
    };

    // Normalize domain
    const normalizeDomain = (input, section) => {
      const domainOptions = section === SAT_SECTIONS.MATH
        ? Object.values(MATH_DOMAINS)
        : [...Object.values(READING_WRITING_DOMAINS), ...Object.values(MATH_DOMAINS)];
      const match = fuzzyChoose(input, domainOptions, 0.35);
      return match || (section === SAT_SECTIONS.MATH ? 'Algebra' : 'Information and Ideas');
    };

    // Normalize question type
    const normalizeQuestionType = (input) => {
      console.log('🔍 normalizeQuestionType called with:', JSON.stringify(input));
      
      // Re-usable cleaner for stray control characters
      const scrub = (str = '') =>
        str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove all C0 / C1 control chars
           .replace(/\s+/g, ' ')                           // collapse whitespace
           .trim();

      // --- robust parsing logic for question type ---
      const typeMap = {
        // Reading and Writing question types - Information and Ideas
        'main idea': 'Main Idea',
        'inference': 'Inferences',  // Map to plural form as defined in data.js
        'inferences': 'Inferences', // Keep plural form
        'supporting evidence': 'Supporting Evidence',
        'detail': 'Detail',
        'central ideas and details': 'Central Ideas and Details',
        'command of evidence': 'Command of Evidence',
        
        // Reading and Writing question types - Craft and Structure
        'words in context': 'Words in Context',
        'text structure': 'Text Structure',
        'text structure and purpose': 'Text Structure and Purpose',
        'purpose': 'Purpose',
        'cross-text connections': 'Cross-Text Connections',
        'structure and purpose': 'Structure and Purpose',
        
        // Reading and Writing question types - Expression of Ideas
        'rhetorical synthesis': 'Rhetorical Synthesis',
        'transitions': 'Transitions',
        'conciseness': 'Conciseness',
        'precision': 'Precision',
        'modifier placement': 'Modifier Placement',
        'logical comparison': 'Logical Comparison',
        
        // Reading and Writing question types - Standard English Conventions
        'punctuation': 'Punctuation',
        'sentence boundaries': 'Sentence Boundaries',
        'verb tense and agreement': 'Verb Tense and Agreement',
        'pronouns and modifiers': 'Pronouns and Modifiers',
        'punctuation usage': 'Punctuation Usage',
        'boundaries': 'Boundaries',  // Match data.js exactly
        'form structure and sense': 'Form, Structure, and Sense',  // Match data.js exactly
        
        // Math question types - Algebra
        'linear equations': 'Linear equations in one variable',  // Match data.js exactly
        'linear functions': 'Linear functions',
        'linear equations in two variables': 'Linear equations in two variables',
        'systems of two linear equations in two variables': 'Systems of two linear equations in two variables',
        'linear inequalities in one or two variables': 'Linear inequalities in one or two variables',
        'inequalities': 'Linear inequalities in one or two variables',
        'systems of equations': 'Systems of two linear equations in two variables',
        'linear/quadratic equations': 'Linear equations in one variable',
        
        // Math question types - Advanced Math
        'quadratics': 'Nonlinear functions',
        'rational expressions': 'Equivalent expressions',
        'radical equations': 'Nonlinear equations in one variable and systems of equations in two variables',
        'functions': 'Nonlinear functions',
        'nonlinear functions': 'Nonlinear functions',
        'nonlinear equations': 'Nonlinear equations in one variable and systems of equations in two variables',
        'equivalent expressions': 'Equivalent expressions',
        
        // Math question types - Problem Solving and Data Analysis
        'ratios and proportions': 'Ratios, rates, proportional relationships, and units',
        'unit conversions': 'Ratios, rates, proportional relationships, and units',
        'data interpretation': 'One-variable data: Distributions and measures of center and spread',
        'statistics': 'One-variable data: Distributions and measures of center and spread',
        'percentages': 'Percentages',
        'probability': 'Probability and conditional probability',
        'scatterplots': 'Two-variable data: Models and scatterplots',
        'inference from sample statistics': 'Inference from sample statistics and margin of error',
        'evaluating statistical claims': 'Evaluating statistical claims: Observational studies and experiments',
        
        // Math question types - Geometry and Trigonometry
        'angles': 'Lines, angles, and triangles',
        'circles': 'Circles',
        'area/volume': 'Area and volume',
        'trigonometric functions': 'Right triangles and trigonometry',
        'geometry': 'Lines, angles, and triangles',
        'trigonometry': 'Right triangles and trigonometry',
        'right triangles': 'Right triangles and trigonometry',
        'lines angles and triangles': 'Lines, angles, and triangles',
        'area and volume': 'Area and volume',
        
        // Additional mappings for common variations
        'linear': 'Linear equations in one variable',
        'quadratic': 'Nonlinear functions',
        'ratio': 'Ratios, rates, proportional relationships, and units',
        'proportion': 'Ratios, rates, proportional relationships, and units',
        'data': 'One-variable data: Distributions and measures of center and spread',
        'statistical': 'One-variable data: Distributions and measures of center and spread',
        'geometric': 'Lines, angles, and triangles',
        'trig': 'Right triangles and trigonometry',
        'trigonometric': 'Right triangles and trigonometry',
        'word': 'Words in Context',
        'context': 'Words in Context',
        'sentence': 'Boundaries',
        'boundary': 'Boundaries',
        'verb': 'Form, Structure, and Sense',
        'agreement': 'Form, Structure, and Sense',
        'pronoun': 'Form, Structure, and Sense',
        'modifier': 'Form, Structure, and Sense',
        'transition': 'Transitions',
        'synthesis': 'Rhetorical Synthesis',
        'rhetorical': 'Rhetorical Synthesis',
        'main': 'Main Idea',
        'idea': 'Main Idea',
        'evidence': 'Supporting Evidence',
        'supporting': 'Supporting Evidence',
        'structure': 'Text Structure',
        'text': 'Text Structure',
        'cross': 'Cross-Text Connections',
        'connection': 'Cross-Text Connections',
        'command evidence': 'Command of Evidence',
      };
      
      // Prepare lower-cased, cleaned version once
      const clean = scrub(input).toLowerCase().replace(/[^a-z\s-]/g, '').trim();
      
      console.log('🔍 Cleaned input:', JSON.stringify(clean));
      console.log('🔍 Available keys:', Object.keys(typeMap).filter(k => k.includes('inference')));
      
      // First try exact match
      if (typeMap[clean]) {
        console.log('🔍 Exact match found:', typeMap[clean]);
        return typeMap[clean];
      }
      
      // Try plural stripping (e.g. "inferences" → "inference")
      if (clean.endsWith('s')) {
        const singular = clean.slice(0, -1);
        console.log('🔍 Trying singular:', JSON.stringify(singular));
        if (typeMap[singular]) {
          console.log('🔍 Plural match found:', typeMap[singular]);
          return typeMap[singular];
        }
      }
      
      // Try keyword matching for complex phrases
      if (clean.includes('command of evidence')) {
        console.log('🔍 Keyword match: Command of Evidence');
        return 'Command of Evidence';
      }
      
      if (clean.includes('text structure') && clean.includes('purpose')) {
        console.log('🔍 Keyword match: Text Structure and Purpose');
        return 'Text Structure and Purpose';
      }
      
      if (clean.includes('cross-text')) {
        console.log('🔍 Keyword match: Cross-Text Connections');
        return 'Cross-Text Connections';
      }
      
      if (clean.includes('central ideas')) {
        console.log('🔍 Keyword match: Central Ideas and Details');
        return 'Central Ideas and Details';
      }
      
      if (clean.includes('words in context')) {
        console.log('🔍 Keyword match: Words in Context');
        return 'Words in Context';
      }
      
      if (clean.includes('inference')) {
        console.log('🔍 Keyword match: Inference');
        return 'Inference';
      }
      
      // ------------------ Generic fuzzy matching (re-uses helper) ------------------
      const candidates = [...new Set(Object.values(typeMap))];
      const fuzzy = fuzzyChoose(clean, candidates, 0.3); // slightly more forgiving threshold
      if (fuzzy) {
        console.log('🔍 Fuzzy match (generic):', fuzzy);
        return fuzzy;
      }
      
      // Fallback
      console.log('🔍 No match found, using fallback: Words in Context');
      return 'Words in Context';
    };

    // Normalize difficulty
    const normalizeDifficulty = (input) => {
      const clean = (input || '').toLowerCase().replace(/[^a-z]/g, '').trim();
      
      const difficultyMap = {
        'easy': 'Easy',
        'ez': 'Easy',
        'eazy': 'Easy',
        'easyyy': 'Easy',
        'medium': 'Medium',
        'med': 'Medium',
        'meh': 'Medium',
        'hard': 'Hard',
        'hrd': 'Hard',
        'difficult': 'Hard'
      };
      
      return difficultyMap[clean] || 'Medium';
    };

    try {
      const rawValues = parseCSV(csvString);
      
      // Support both hidden questions (3 fields) and complete questions (11+ fields)
      if (rawValues.length < 3) {
        throw new Error(`CSV must have at least 3 fields for hidden questions or 11+ fields for complete questions. Found ${rawValues.length} fields.`);
      }

      // Extract required fields (always present)
      const rawSection = rawValues[0];
      const rawDomain = rawValues[1];
      const rawQuestionType = rawValues[2];
      
      console.log('🔍 CSV parsing - raw values:', {
        section: JSON.stringify(rawSection),
        domain: JSON.stringify(rawDomain), 
        questionType: JSON.stringify(rawQuestionType)
      });
      
      const normalizedSection = normalizeSection(rawSection);
      const normalizedDomain = normalizeDomain(rawDomain, normalizedSection);
      const normalizedQuestionType = normalizeQuestionType(rawQuestionType);
      
      console.log('🔍 CSV parsing - normalized values:', {
        section: normalizedSection,
        domain: normalizedDomain,
        questionType: normalizedQuestionType
      });

      // If only 3 fields provided, create hidden question
      if (rawValues.length === 3) {
        return {
          section: normalizedSection,
          domain: normalizedDomain,
          questionType: normalizedQuestionType,
          passageText: '',
          questionText: '',
          answerChoices: { A: '', B: '', C: '', D: '' },
          correctAnswer: 'A',
          explanation: '',
          explanationImage: null,
          difficulty: DIFFICULTY_LEVELS.MEDIUM
        };
      }

      // For complete questions, require at least 11 fields
      if (rawValues.length < 11) {
        throw new Error(`CSV must have at least 11 fields for complete questions. Found ${rawValues.length} fields.`);
      }

      // Extract remaining values for complete questions
      const [, , , rawPassage, rawQuestion, rawA, rawB, rawC, rawD, rawCorrect, rawExplanation, rawDifficulty] = rawValues;
      
      const normalizedDifficulty = normalizeDifficulty(rawDifficulty);
      
      // Validate correct answer
      const correct = (rawCorrect || 'A').toUpperCase().replace(/[^ABCD]/g, 'A');
      
      // Extract image data and text from passage content
      let passageText = rawPassage || '';
      let passageImage = null;
      
      // Check for image data markers
      const imageMarker = '[IMAGE_DATA]';
      const imageEndMarker = '[/IMAGE_DATA]';
      
      if (passageText.includes(imageMarker) && passageText.includes(imageEndMarker)) {
        const imageStartIndex = passageText.indexOf(imageMarker);
        const imageEndIndex = passageText.indexOf(imageEndMarker) + imageEndMarker.length;
        
        // Extract image data
        const imageDataWithMarkers = passageText.substring(imageStartIndex, imageEndIndex);
        const imageData = imageDataWithMarkers.replace(imageMarker, '').replace(imageEndMarker, '');
        
        // Validate that it's a proper data URL
        if (imageData.startsWith('data:image/')) {
          passageImage = imageData;
        }
        
        // Remove image data from passage text
        passageText = passageText.substring(0, imageStartIndex) + passageText.substring(imageEndIndex);
        passageText = passageText.trim();
      }

      // Extract image data and text from explanation content
      let explanationText = rawExplanation || '';
      let explanationImage = null;
      
      if (explanationText.includes(imageMarker) && explanationText.includes(imageEndMarker)) {
        const imageStartIndex = explanationText.indexOf(imageMarker);
        const imageEndIndex = explanationText.indexOf(imageEndMarker) + imageEndMarker.length;
        
        // Extract image data
        const imageDataWithMarkers = explanationText.substring(imageStartIndex, imageEndIndex);
        const imageData = imageDataWithMarkers.replace(imageMarker, '').replace(imageEndMarker, '');
        
        // Validate that it's a proper data URL
        if (imageData.startsWith('data:image/')) {
          explanationImage = imageData;
        }
        
        // Remove image data from explanation text
        explanationText = explanationText.substring(0, imageStartIndex) + explanationText.substring(imageEndIndex);
        explanationText = explanationText.trim();
      }
      
      return {
        section: normalizedSection,
        domain: normalizedDomain,
        questionType: normalizedQuestionType,
        passageText: passageText,
        passageImage: passageImage,
        questionText: rawQuestion || '',
        answerChoices: {
          A: rawA || '',
          B: rawB || '',
          C: rawC || '',
          D: rawD || ''
        },
        correctAnswer: correct,
        explanation: explanationText,
        explanationImage: explanationImage,
        difficulty: normalizedDifficulty
      };
      
    } catch (error) {
      throw new Error(`CSV parsing error: ${error.message}`);
    }
  };

  // CSV parsing and form filling
  const handleCsvFill = () => {
    setCsvError('');
    
    try {
      // Apply exclamation-to-comma conversion for single CSV entries
      const processedCsvInput = convertExclamationToComma(csvInput);
      const cleanedData = cleanCSV(processedCsvInput);
      
      setFormData(cleanedData);
      setShowCsvModal(false);
      setCsvInput('');
      
    } catch (error) {
      setCsvError(error.message);
    }
  };

  // Convert exclamation marks back to commas for display
  const convertExclamationToComma = (text) => {
    if (!text) return text;
    return text.replace(/!/g, ',');
  };

  // Validate CSV format before processing
  const validateCSVFormat = (csvString) => {
    const lines = csvString.trim().split('\n').filter(line => line.trim() !== '');
    const issues = [];
    
    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i].trim();
      
      if (!line) continue;
      
      // Count fields properly (respecting quotes)
      let fieldCount = 0;
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fieldCount++;
        }
      }
      fieldCount++; // Count the last field
      
      // Support both hidden questions (3 fields) and complete questions (11+ fields)
      if (fieldCount < 3) {
        const preview = line.length > 50 ? line.substring(0, 50) + '...' : line;
        issues.push(`Line ${lineNumber}: Insufficient fields (${fieldCount}). Expected 3 for hidden questions or 11+ for complete questions. Preview: "${preview}"`);
      } else if (fieldCount > 3 && fieldCount < 11) {
        const preview = line.length > 50 ? line.substring(0, 50) + '...' : line;
        issues.push(`Line ${lineNumber}: Incomplete fields (${fieldCount}). Expected either 3 for hidden questions or 11+ for complete questions. Preview: "${preview}"`);
      } else if (fieldCount > 12) {
        const preview = line.length > 50 ? line.substring(0, 50) + '...' : line;
        issues.push(`Line ${lineNumber}: Too many fields (${fieldCount}). Maximum 12 fields allowed. Preview: "${preview}"`);
      }
    }
    
    return issues;
  };

  // Parse multiple questions from CSV
  const parseMultipleQuestionsFromCSV = (csvString) => {
    // First convert exclamation marks to commas in the CSV string
    const processedCsvString = convertExclamationToComma(csvString);
    const lines = processedCsvString.trim().split('\n').filter(line => line.trim() !== '');
    const questions = [];
    
    // Helper function to count fields properly (respecting quotes)
    const countFields = (line) => {
      let count = 0;
      let inQuotes = false;
      let current = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          count++;
          current = '';
        } else {
          current += char;
        }
      }
      
      // Count the last field
      count++;
      return count;
    };
    
    for (let i = 0; i < lines.length; i++) {
      const lineNumber = i + 1;
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) continue;
      
      try {
        const questionData = cleanCSV(line);
        questions.push(questionData);
      } catch (error) {
        // Provide more detailed error information
        const fieldCount = countFields(line);
        
        // Support both hidden questions (3 fields) and complete questions (11+ fields)
        if (fieldCount < 3) {
          const preview = line.length > 100 ? line.substring(0, 100) + '...' : line;
          throw new Error(`Line ${lineNumber}: Insufficient question data. Found ${fieldCount} fields, expected 3 for hidden questions or 11+ for complete questions. Preview: "${preview}"`);
        } else if (fieldCount > 3 && fieldCount < 11) {
          const preview = line.length > 100 ? line.substring(0, 100) + '...' : line;
          throw new Error(`Line ${lineNumber}: Incomplete question data. Found ${fieldCount} fields, expected either 3 for hidden questions or 11+ for complete questions. Preview: "${preview}"`);
        } else {
          throw new Error(`Line ${lineNumber}: ${error.message}`);
        }
      }
    }
    
    if (questions.length === 0) {
      throw new Error('No valid questions found in CSV. Please check your format and ensure each line has all required fields.');
    }
    

    
    return questions;
  };

  // Handle multi-question CSV import
  const handleMultiQuestionCsvImport = () => {
    setCsvError('');
    
    try {
      // First validate the CSV format
      const validationIssues = validateCSVFormat(csvInput);
      if (validationIssues.length > 0) {
        setCsvError(`CSV Format Issues:\n${validationIssues.join('\n')}`);
        return;
      }
      
      const questions = parseMultipleQuestionsFromCSV(csvInput);
      
      if (questions.length === 1) {
        // Single question - use existing flow
        setFormData(questions[0]);
        setShowCsvModal(false);
        setCsvInput('');
      } else {
        // Multiple questions - start import mode
        setCsvQuestions(questions);
        setCurrentQuestionIndex(0);
        setFormData(questions[0]);
        setIsImportMode(true);
        setImportProgress({ total: questions.length, completed: 0 });
        setEditedQuestions({}); // Initialize edited questions state
        setShowCsvModal(false);
        setCsvInput('');
      }
      
    } catch (error) {
      setCsvError(error.message);
    }
  };

  // Handle next question in import mode
  const handleNextQuestion = async () => {
    // If we are already finalising, ignore subsequent clicks
    if (isFinalizingImport) return;

    try {
      // Helper to detect if this is intended as a hidden question
      const isIntendedHiddenQuestion = () => {
        // Must have section, domain, and questionType
        if (!formData.section || !formData.domain || !formData.questionType) {
          return false;
        }
        
        // Check if all other fields are empty
        const passageTextEmpty = !formData.passageText || formData.passageText.trim() === '';
        const passageImageEmpty = !formData.passageImage;
        const questionTextEmpty = !formData.questionText || formData.questionText.trim() === '';
        const explanationEmpty = !formData.explanation || formData.explanation.trim() === '';
        
        // Check if all answer choices are empty
        const allAnswerChoicesEmpty = Object.values(formData.answerChoices).every(choice => 
          !choice || choice.trim() === ''
        );
        
        return passageTextEmpty && passageImageEmpty && questionTextEmpty && explanationEmpty && allAnswerChoicesEmpty;
      };

      // Check if this is a hidden question
      const isHidden = isIntendedHiddenQuestion();
      
      // Validate the current question without adding it
      const errors = {};
      
      // Always validate section and domain for all questions
      if (!formData.section) {
        errors.section = true;
      }
      if (!formData.domain) {
        errors.domain = true;
      }
      
      // Validate questionType only for Reading & Writing questions
      console.log('Validation check:', {
        section: formData.section,
        expectedSection: SAT_SECTIONS.READING_WRITING,
        questionType: formData.questionType,
        isReadingWriting: formData.section === SAT_SECTIONS.READING_WRITING,
        hasQuestionType: formData.questionType && String(formData.questionType).trim() !== ''
      });
      
      if (formData.section === SAT_SECTIONS.READING_WRITING && (!formData.questionType || String(formData.questionType).trim() === '')) {
        errors.questionType = true;
        console.log('Setting questionType error - missing question type for Reading & Writing');
      }
      
      // If not a hidden question, validate additional required fields
      if (!isHidden) {
        if (!formData.passageText.trim() && !formData.passageImage) {
          errors.passageText = true;
        }

        // For Math section, question text is optional
        if (formData.section !== SAT_SECTIONS.MATH && !formData.questionText.trim()) {
          errors.questionText = true;
        }

        // For Math section, auto-fill empty answer choices with A, B, C, D
        if (formData.section === SAT_SECTIONS.MATH) {
          const choices = ['A', 'B', 'C', 'D'];
          choices.forEach((choice, index) => {
            if (!formData.answerChoices[choice] || formData.answerChoices[choice].trim() === '') {
              formData.answerChoices[choice] = choice;
            }
          });
        } else {
          // For non-Math sections, check if any answer choice is empty
          const emptyChoices = Object.entries(formData.answerChoices)
            .filter(([key, value]) => !value.trim())
            .map(([key]) => key);
          
          if (emptyChoices.length > 0) {
            emptyChoices.forEach(choice => {
              errors[`answerChoice_${choice}`] = true;
            });
          }
        }
      }

      // If there are validation errors, set them and return
      if (Object.keys(errors).length > 0) {
        console.log('Validation errors found:', errors);
        setValidationErrors(errors);
        console.warn('Validation failed: Please fill in all required fields');
        return;
      }

      // Clear validation errors if validation passes or if hidden question
      setValidationErrors({});

      // Save current question's edits before moving to next
      setEditedQuestions(prev => ({
        ...prev,
        [currentQuestionIndex]: { ...formData }
      }));

      // Then move to next question
      const nextIndex = currentQuestionIndex + 1;
      
      if (nextIndex < csvQuestions.length) {
        // Add the current question to the collection and move to next
        setImportedQuestions(prev => [...prev, { ...formData }]);
        setCurrentQuestionIndex(nextIndex);
        
        // Load the next question, using edited version if available
        const nextQuestion = editedQuestions[nextIndex] || csvQuestions[nextIndex];
        setFormData(nextQuestion);
        setImportProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
      } else {
        // Import complete - this is the last question
        console.log('Import complete - processing last question');
        console.log('Current formData:', formData);
        
        // 1) Validate: Check if current form data (last question) has required question type
        if (formData.section === SAT_SECTIONS.READING_WRITING && (!formData.questionType || String(formData.questionType).trim() === '')) {
          alert('Please set a Question Type for this Reading & Writing question before finishing.');
          return; // Stop here, don't proceed with import
        }
        
        // 2) Validate: Check all previously collected questions
        const currentImportedQuestions = importedQuestions || [];
        const missingEnglishTypeIndex = currentImportedQuestions.findIndex(q => 
          q && q.section === SAT_SECTIONS.READING_WRITING && (!q.questionType || String(q.questionType).trim() === '')
        );
        if (missingEnglishTypeIndex !== -1) {
          alert('Please set a Question Type for all Reading & Writing (English) questions before finishing.\nTaking you to the first one that needs it.');
          setCurrentQuestionIndex(missingEnglishTypeIndex);
          setFormData(currentImportedQuestions[missingEnglishTypeIndex]);
          return; // Stop here, don't proceed with import
        }
        
        // Prevent duplicate submissions while finalization is in progress
        setIsFinalizingImport(true);
        
        // Get the current imported questions and add the final one
        setImportedQuestions(prev => {
          const finalQuestions = [...prev, { ...formData }];
          console.log('Final questions to add:', finalQuestions.length);
          console.log('Questions:', finalQuestions);
          
          // Add all questions to the database
          onAddQuestion(finalQuestions);
          
          // Reset import state
          setIsImportMode(false);
          setCsvQuestions([]);
          setCurrentQuestionIndex(0);
          setImportProgress({ total: 0, completed: 0 });
          setEditedQuestions({}); // Clear edited questions state
          
          // Clear the form so last question info isn't left behind
          setFormData({
            section: SAT_SECTIONS.READING_WRITING,
            domain: '',
            questionType: '',
            passageText: '',
            passageImage: null,
            questionText: '',
            answerChoices: { A: '', B: '', C: '', D: '' },
            correctAnswer: 'A',
            explanation: '',
            explanationImage: null,
            difficulty: DIFFICULTY_LEVELS.MEDIUM
          });
          
          // Show completion message
          setPointsAnimation({
            show: true,
            points: finalQuestions.length * 10, // 10 points per question
            action: 'BULK_IMPORT'
          });
          
          // Reset the finalising flag after state updates flush
          setTimeout(() => setIsFinalizingImport(false), 3000);
          return []; // Clear the collection
        });
      }
    } catch (error) {
      console.error('Error during import:', error);
    }
  };

  // Move to previous question during import
  const handlePrevQuestion = () => {
    if (!isImportMode) return;
    
    // Save current question's edits before moving back
    setEditedQuestions(prev => ({
      ...prev,
      [currentQuestionIndex]: { ...formData }
    }));
    
    const prevIndex = currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      // Remove the current question from importedQuestions since we're going back to review it
      setImportedQuestions(prev => prev.slice(0, -1));
      
      // Decrement the completed count since we're going back
      setImportProgress(prev => ({ ...prev, completed: Math.max(0, prev.completed - 1) }));
      
      setCurrentQuestionIndex(prevIndex);
      
      // Load the previous question, using edited version if available
      const prevQuestion = editedQuestions[prevIndex] || csvQuestions[prevIndex];
      setFormData(prevQuestion);
    }
  };

  // Skip current question in import mode
  const handleSkipQuestion = () => {
    // Validate the current question before skipping
    const errors = {};
    
    // Always validate section and domain for all questions
    if (!formData.section) {
      errors.section = true;
    }
    if (!formData.domain) {
      errors.domain = true;
    }
    
    // Validate questionType only for Reading & Writing questions
    if (formData.section === SAT_SECTIONS.READING_WRITING && (!formData.questionType || String(formData.questionType).trim() === '')) {
      errors.questionType = true;
    }
    
    // If there are validation errors, set them and return
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      console.warn('Validation failed: Please fill in all required fields');
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors({});
    
    // Save current question's edits before skipping
    setEditedQuestions(prev => ({
      ...prev,
      [currentQuestionIndex]: { ...formData }
    }));
    
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < csvQuestions.length) {
      // Add the current question to the collection and move to next
      setImportedQuestions(prev => [...prev, { ...formData }]);
      setCurrentQuestionIndex(nextIndex);
      
      // Load the next question, using edited version if available
      const nextQuestion = editedQuestions[nextIndex] || csvQuestions[nextIndex];
      setFormData(nextQuestion);
      setImportProgress(prev => ({ ...prev, completed: prev.completed + 1 }));
          } else {
        // Import complete - this is the last question
        console.log('Skip - Import complete - processing last question');
        console.log('Current formData:', formData);
        
        // 1) Validate: Check if current form data (last question) has required question type
        if (formData.section === SAT_SECTIONS.READING_WRITING && (!formData.questionType || String(formData.questionType).trim() === '')) {
          alert('Please set a Question Type for this Reading & Writing question before finishing.');
          return; // Stop here, don't proceed with import
        }
        
        // 2) Validate: Check all previously collected questions
        const currentImportedQuestions = importedQuestions || [];
        const missingEnglishTypeIndex = currentImportedQuestions.findIndex(q => 
          q && q.section === SAT_SECTIONS.READING_WRITING && (!q.questionType || String(q.questionType).trim() === '')
        );
        if (missingEnglishTypeIndex !== -1) {
          alert('Please set a Question Type for all Reading & Writing (English) questions before finishing.\nTaking you to the first one that needs it.');
          setCurrentQuestionIndex(missingEnglishTypeIndex);
          setFormData(currentImportedQuestions[missingEnglishTypeIndex]);
          return; // Stop here, don't proceed with import
        }
        
        // Get the current imported questions and add the final one
        setImportedQuestions(prev => {
          const finalQuestions = [...prev, { ...formData }];
          console.log('Skip - Final questions to add:', finalQuestions.length);
          console.log('Skip - Questions:', finalQuestions);
        
        // Add all questions to the database
        onAddQuestion(finalQuestions);
        
        // Reset import state
        setIsImportMode(false);
        setCsvQuestions([]);
        setCurrentQuestionIndex(0);
        setImportProgress({ total: 0, completed: 0 });
        setEditedQuestions({}); // Clear edited questions state
        
        // Clear the form so last question info isn't left behind
        setFormData({
          section: SAT_SECTIONS.READING_WRITING,
          domain: '',
          questionType: '',
          passageText: '',
          passageImage: null,
          questionText: '',
          answerChoices: { A: '', B: '', C: '', D: '' },
          correctAnswer: 'A',
          explanation: '',
          explanationImage: null,
          difficulty: DIFFICULTY_LEVELS.MEDIUM
        });
        
        // Show completion message
        setPointsAnimation({
          show: true,
          points: finalQuestions.length * 10, // 10 points per question
          action: 'BULK_IMPORT'
        });
        
        return []; // Clear the collection
      });
    }
  };

  // Cancel import mode
  const handleCancelImport = () => {
    setShowCancelImportConfirm(true);
  };

  // Confirm cancel import and remove added questions
  const handleConfirmCancelImport = () => {
    // Since questions are collected but not added until import is complete,
    // we just need to clear the collection and reset state
    setIsImportMode(false);
    setCsvQuestions([]);
    setCurrentQuestionIndex(0);
    setImportProgress({ total: 0, completed: 0 });
    setImportedQuestions([]);
    setEditedQuestions({}); // Clear edited questions state
    setShowCancelImportConfirm(false);
    
    // Reset form
    setFormData({
      section: SAT_SECTIONS.READING_WRITING,
      domain: '',
      questionType: '',
      passageText: '',
      passageImage: null,
      questionText: '',
      answerChoices: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      explanationImage: null,
      difficulty: DIFFICULTY_LEVELS.MEDIUM
    });
  };

  // Import all parsed CSV questions at once without stepping through one by one
  const handleImportAllNow = async () => {
    if (!isImportMode || isBulkImporting) return;
    try {
      setIsBulkImporting(true);

      // Merge current form edits + any edited questions + original CSV
      const finalQuestions = (Array.isArray(csvQuestions) ? csvQuestions : []).map((original, index) => {
        if (index === currentQuestionIndex) {
          return { ...formData };
        }
        if (editedQuestions && editedQuestions[index]) {
          return { ...editedQuestions[index] };
        }
        return { ...original };
      });

      // Minimal autofill for RW questions missing questionType to avoid validation blockers
      const normalizedQuestions = finalQuestions.map(q => {
        const isEnglish = (q.section || '') === SAT_SECTIONS.READING_WRITING;
        const hasType = (q.questionType || '').trim().length > 0;
        return isEnglish && !hasType ? { ...q, questionType: 'General' } : q;
      });

      // Persist all questions in a single call
      await onAddQuestion(normalizedQuestions);

      // Reset import state
      setIsImportMode(false);
      setCsvQuestions([]);
      setCurrentQuestionIndex(0);
      setImportProgress({ total: 0, completed: 0 });
      setEditedQuestions({});
      setImportedQuestions([]);

      // Clear the form
      setFormData({
        section: SAT_SECTIONS.READING_WRITING,
        domain: '',
        questionType: '',
        passageText: '',
        passageImage: null,
        questionText: '',
        answerChoices: { A: '', B: '', C: '', D: '' },
        correctAnswer: 'A',
        explanation: '',
        explanationImage: null,
        difficulty: DIFFICULTY_LEVELS.MEDIUM
      });

      // Points animation
      setPointsAnimation({
        show: true,
        points: normalizedQuestions.length * 10,
        action: 'BULK_IMPORT'
      });
    } catch (error) {
      alert('Failed to import all questions at once. Please try again.');
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Handle image paste in passage
  const handlePassagePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            // Keep existing text and add image
            setFormData(prev => ({ 
              ...prev, 
              passageImage: event.target.result,
              // Don't clear passageText - allow both text and image
            }));
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          return;
        }
      }
    }
  };

  // Remove passage image
  const handleRemovePassageImage = () => {
    setFormData(prev => ({ ...prev, passageImage: null }));
  };

  // Handle image paste in explanation
  const handleExplanationPaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            // Keep existing text and add image
            setFormData(prev => ({ 
              ...prev, 
              explanationImage: event.target.result,
              // Don't clear explanation text - allow both text and image
            }));
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          return;
        }
      }
    }
  };

  // Remove explanation image
  const handleRemoveExplanationImage = () => {
    setFormData(prev => ({ ...prev, explanationImage: null }));
  };

  // Image modal handlers
  const handleImageClick = (imageSrc, imageAlt) => {
    setImageModal({ isOpen: true, imageSrc, imageAlt });
  };

  const handleCloseImageModal = () => {
    setImageModal({ isOpen: false, imageSrc: '', imageAlt: '' });
  };

  // Clean up duplicate questions by content signature (keeps newest per signature)
  const handleCleanupDuplicates = async () => {
    if (!questionsArray || questionsArray.length === 0) return;

    const normalize = (v) => (v ?? '').toString().trim().replace(/\s+/g, ' ');
    const getTime = (q) => {
      const val = q.lastUpdated || q.createdAt || q.date || 0;
      const t = new Date(val).getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    const signatureFor = (q) => JSON.stringify({
      section: normalize(q.section),
      domain: normalize(q.domain),
      questionType: normalize(q.questionType),
      passageText: normalize(q.passageText),
      questionText: normalize(q.questionText),
      explanation: normalize(q.explanation),
      difficulty: normalize(q.difficulty),
      correctAnswer: normalize(q.correctAnswer),
      A: normalize(q.answerChoices?.A),
      B: normalize(q.answerChoices?.B),
      C: normalize(q.answerChoices?.C),
      D: normalize(q.answerChoices?.D),
    });

    const keepIdBySig = new Map();
    const dropIds = [];

    // Decide which question to keep per signature (newest wins)
    for (const q of questionsArray) {
      const sig = signatureFor(q);
      if (!keepIdBySig.has(sig)) {
        keepIdBySig.set(sig, q.id);
      } else {
        const currentKeepId = keepIdBySig.get(sig);
        const currentKeep = questionsArray.find(x => x.id === currentKeepId) || q;
        const candidateIsNewer = getTime(q) > getTime(currentKeep);
        if (candidateIsNewer) {
          // Replace keep, drop old keep
          keepIdBySig.set(sig, q.id);
          dropIds.push(currentKeep.id);
        } else {
          // Drop candidate
          dropIds.push(q.id);
        }
      }
    }

    if (dropIds.length === 0) {
      alert('No duplicate questions found!');
      return;
    }

    const confirmed = window.confirm(
      `Found ${dropIds.length} duplicate question${dropIds.length > 1 ? 's' : ''}. Remove them? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      onBulkDeleteQuestions(dropIds);
      alert(`Successfully removed ${dropIds.length} duplicate question${dropIds.length > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error('Duplicate cleanup failed', err);
      alert('Failed to remove duplicates. Please try again.');
    }
  };

  // Delete all questions
  const handleDeleteAllQuestions = async () => {
    if (!questionsArray || questionsArray.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ALL ${questionsArray.length} questions? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      if (onDeleteAllQuestions) {
        await onDeleteAllQuestions();
      } else {
        // Fallback to bulk delete if onDeleteAllQuestions is not provided
        const allQuestionIds = questionsArray.map(q => q.id);
        await onBulkDeleteQuestions(allQuestionIds);
      }
      alert(`Successfully deleted all ${questionsArray.length} questions.`);
    } catch (err) {
      console.error('Delete all questions failed', err);
      alert('Failed to delete all questions. Please try again.');
    }
  };

  // Export questions as PDF
  const handleExportQuestionsAsPDF = async () => {
    // Filter out hidden questions from export
    const exportableQuestions = filteredQuestions.filter(q => !q.hidden);

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const result = await exportQuestionsAsPDF(exportableQuestions, 'Thinklytics_SAT_Question_Bank');
      
      if (result.success) {
        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      alert(`Error generating PDF: ${error.message}`);
      setIsExporting(false);
      setExportSuccess(false);
    }
  };

  // Helper: Async image loader that resolves to an Image element
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  // Copy questions as CSV to clipboard
  const copyQuestionsAsCSV = async () => {
    // Filter out hidden questions from export
    const exportableQuestions = filteredQuestions.filter(q => !q.hidden);
    
    if (exportableQuestions.length === 0) {
      alert('No visible questions to copy!');
      return;
    }

    // Helper function to convert commas to exclamation marks and escape CSV values
    const convertAndEscapeCSVValue = (value) => {
      if (value === null || value === undefined) return '';
      
      // First convert to string and replace ALL commas with exclamation marks
      let str = String(value).replace(/,/g, '!');
      
      // Also replace newlines with spaces to prevent CSV line breaks
      str = str.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Always wrap in quotes to ensure proper CSV formatting
      // Escape existing quotes by doubling them
      str = str.replace(/"/g, '""');
      // Wrap in quotes
      str = `"${str}"`;
      
      return str;
    };

    // Convert questions to CSV format in the specified order
    const csvRows = exportableQuestions.map(question => {
      // Combine passage text and image into a single field
      let passageContent = question.passageText || '';
      
      // If there's an image, add it to the passage content with a special marker
      if (question.passageImage) {
        const imageMarker = '[IMAGE_DATA]';
        const imageEndMarker = '[/IMAGE_DATA]';
        // Add image data after text (or as standalone if no text)
        if (passageContent.trim()) {
          passageContent = `${passageContent} ${imageMarker}${question.passageImage}${imageEndMarker}`;
        } else {
          passageContent = `${imageMarker}${question.passageImage}${imageEndMarker}`;
        }
      }

      // Combine explanation text and image into a single field
      let explanationContent = question.explanation || '';
      
      // If there's an explanation image, add it to the explanation content with a special marker
      if (question.explanationImage) {
        const imageMarker = '[IMAGE_DATA]';
        const imageEndMarker = '[/IMAGE_DATA]';
        // Add image data after text (or as standalone if no text)
        if (explanationContent.trim()) {
          explanationContent = `${explanationContent} ${imageMarker}${question.explanationImage}${imageEndMarker}`;
        } else {
          explanationContent = `${imageMarker}${question.explanationImage}${imageEndMarker}`;
        }
      }
      
      const row = [
        convertAndEscapeCSVValue(question.section),
        convertAndEscapeCSVValue(question.domain),
        convertAndEscapeCSVValue(question.questionType),
        convertAndEscapeCSVValue(passageContent),
        convertAndEscapeCSVValue(question.questionText || ''),
        convertAndEscapeCSVValue(question.answerChoices?.A || ''),
        convertAndEscapeCSVValue(question.answerChoices?.B || ''),
        convertAndEscapeCSVValue(question.answerChoices?.C || ''),
        convertAndEscapeCSVValue(question.answerChoices?.D || ''),
        convertAndEscapeCSVValue(question.correctAnswer || 'A'),
        convertAndEscapeCSVValue(explanationContent),
        convertAndEscapeCSVValue(question.difficulty || 'Medium')
      ];
      return row.join(',');
    });

    // Create CSV content (no header for paste-friendly format)
    const csvContent = csvRows.join('\n');

    try {
      // Copy to clipboard
      await navigator.clipboard.writeText(csvContent);
      
      // Show success state and auto-close modal
      setCsvCopied(true);
      setTimeout(() => {
        setCsvCopied(false);
        setShowExportModal(false);
      }, 1500);
      
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = csvContent;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        setCsvCopied(true);
        setTimeout(() => {
          setCsvCopied(false);
          setShowExportModal(false);
        }, 1500);
      } catch (err) {
        console.error('Failed to copy CSV to clipboard:', err);
        alert('Failed to copy CSV to clipboard. Please try again.');
      }
      
      document.body.removeChild(textArea);
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

        
        {/* Responsive header and button group */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {headerTitleOverride 
                ? headerTitleOverride 
                : (isImportMode 
                    ? `Importing Questions (${currentQuestionIndex + 1}/${importProgress.total})`
                    : editingId ? 'Edit Question' : 'Create New Question')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1 transition-colors duration-300">
              {headerSubtitleOverride 
                ? headerSubtitleOverride 
                : (isImportMode 
                    ? `Question ${currentQuestionIndex + 1} of ${importProgress.total} - ${importProgress.completed} completed`
                    : editingId ? 'Update the question details below with modern tools' : 'Add a new question to your question bank with advanced features')}
            </p>
            {isImportMode && (
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / importProgress.total) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
          <div className="flex flex-col md:flex-row w-full md:w-auto items-stretch md:items-center gap-2 md:gap-3">


            {/* Cancel Import Button */}
            {isImportMode && (
              <button
                onClick={handleCancelImport}
                className="group relative bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 text-sm font-medium overflow-hidden w-full md:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel Import</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSV Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Paste CSV to Fill Questions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>Complete questions:</strong> Section, Domain, Question Type, Passage Text, Question Text, A, B, C, D, Correct (A/B/C/D), Explanation (optional), Difficulty
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
              <strong>Hidden questions:</strong> Section, Domain, Question Type (only 3 fields) - auto-detected as drafts
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
              💡 <strong>Multi-question support:</strong> Paste multiple questions by putting each question on a new line. You can import unlimited questions at once!
            </p>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 mb-2 text-base sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={6}
              value={csvInput}
              onChange={e => setCsvInput(e.target.value)}
              placeholder={`Example complete question:
Math,Algebra,Linear/Quadratic Equations,"A company manufactures boxes with length 3 inches more than width! height 2 inches less than width.","What are the dimensions?","Width: 3 in! Length: 6 in! Height: 1 in","Width: 4 in! Length: 7 in! Height: 2 in","Width: 5 in! Length: 8 in! Height: 3 in","Width: 2 in! Length: 5 in! Height: 0 in",B,"Let w = width. Then length = w + 3! height = w - 2.",Medium

Example hidden questions (only 3 fields):
Math,Algebra,Linear/Quadratic Equations
Reading and Writing,Information and Ideas,Words in Context
Math,Geometry and Trigonometry,Circles

Mixed import (complete + hidden questions):
Math,Algebra,Linear/Quadratic Equations,"Full passage text","Full question?","Choice A","Choice B","Choice C","Choice D",A,"Full explanation",Easy
Math,Problem Solving and Data Analysis,Statistics
Reading and Writing,Standard English Conventions,Boundaries`}
            />
            {csvError && (
              <div className="text-red-600 text-xs mb-2 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800 whitespace-pre-line">
                {csvError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm w-full sm:w-auto"
              >Cancel</button>
              <button
                onClick={handleMultiQuestionCsvImport}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium w-full sm:w-auto"
              >Import Questions</button>
            </div>
          </div>
        </div>
      )}

      {/* Import Warning Modal */}
      {showImportWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Import in Progress</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                You're currently importing questions. Please finish importing all questions before editing existing questions in your question bank.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                You can continue with the import or cancel it to return to normal editing mode.
              </p>
              <button
                onClick={() => setShowImportWarning(false)}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium w-full sm:w-auto"
              >
                Continue Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Import Confirmation Modal */}
      {showCancelImportConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Cancel Import?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to cancel the import? All questions you've reviewed ({importProgress.completed} questions) will be discarded and not added to your question bank.
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 mb-4">
                This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowCancelImportConfirm(false)}
                  className="px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 text-sm font-medium w-full sm:w-auto"
                >
                  Continue Import
                </button>
                <button
                  onClick={handleConfirmCancelImport}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium w-full sm:w-auto"
                >
                  Cancel Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-md relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Export Questions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Choose your preferred export format for {filteredQuestions.filter(q => !q.hidden).length} visible questions.
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">
                Hidden questions will not be included in the export.
              </p>
              <p className="text-xs text-green-600 dark:text-green-400 mb-6">
                💡 CSV format: Section, Domain, Question Type, Passage Text, Question Text, A, B, C, D, Correct (A/B/C/D), Explanation, Difficulty. Images are embedded in passage text with special markers. Commas automatically converted to exclamation marks.
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={async () => {
                    setShowExportModal(false);
                    await handleExportQuestionsAsPDF();
                  }}
                  disabled={isExporting}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 hover:shadow-lg font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Export as PDF</span>
                </button>
                
                <button
                  onClick={() => {
                    copyQuestionsAsCSV();
                  }}
                  disabled={isExporting || csvCopied}
                  className={`w-full px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg font-medium flex items-center justify-center space-x-2 ${
                    csvCopied 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  }`}
                >
                  {csvCopied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy CSV</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full px-6 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto relative z-10">
        <div className="w-full px-3 sm:px-6 py-4 lg:h-full pb-20 sm:pb-6">
          <div className="max-w-7xl mx-auto lg:h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:h-full">
          {/* Form Section - Modern Design */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex flex-col lg:h-full overflow-hidden hover:shadow-xl transition-all duration-300 relative min-h-[400px] md:min-h-[500px]">

            
            <div className="p-4 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 transition-colors duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Question Details</h2>
                {isImportMode && (
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Question {currentQuestionIndex + 1} of {importProgress.total}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {importProgress.completed} completed
                    </div>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col lg:h-full overflow-hidden">
              <div className="p-3 sm:p-4 space-y-3 flex-1 lg:overflow-y-auto">
              {/* Section Tabs - Modern Design with Sliding Gradient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Section <span className="text-red-500">*</span></label>
                <div className={`relative flex flex-wrap gap-2 p-2 rounded-xl shadow-inner transition-colors duration-300 ${
                  validationErrors.section 
                    ? 'bg-gradient-to-r from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 border-2 border-red-300 dark:border-red-600' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600'
                }`}>
                  {Object.values(SAT_SECTIONS).map((section) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => handleInputChange('section', section)}
                      className={`relative px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 overflow-hidden ${
                        formData.section === section
                          ? 'text-white shadow-lg transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 hover:shadow-md'
                      }`}
                    >
                      {/* Gradient background that slides */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-r from-[#22adff] to-[#3ab6ff] rounded-lg transition-all duration-500 ease-out ${
                          formData.section === section ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <span className="relative z-10">{section}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain and Question Type Row - Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Domain <span className="text-red-500">*</span></label>
                  <select
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-base sm:text-sm transition-colors duration-300 ${
                      validationErrors.domain 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <option value="">Select Domain</option>
                    {getDomainOptions(formData.section).map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Question Type <span className="text-red-500">*</span></label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => handleInputChange('questionType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 text-base sm:text-sm transition-colors duration-300 ${
                      validationErrors.questionType 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <option value="">Select Question Type</option>
                    {(formData.domain
                      ? getQuestionTypeOptionsByDomain(formData.section, formData.domain)
                      : getQuestionTypeOptions(formData.section)
                    ).map((type) => {
                      const words = type.split(' ');
                      const displayLabel =
                        formData.section === SAT_SECTIONS.MATH && words.length > 5
                          ? `${words.slice(0, 5).join(' ')} ...`
                          : type;
                      return (
                        <option key={type} value={type}>{displayLabel}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Passage Text - Compact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Passage Text <span className="text-red-500">*</span>
                </label>
                
                {/* Show image if present */}
                {formData.passageImage && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Passage Image</span>
                      <button 
                        type="button" 
                        onClick={handleRemovePassageImage} 
                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                    <img 
                      src={formData.passageImage} 
                      alt="Passage" 
                      className="max-h-48 w-auto rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity duration-200" 
                      onClick={() => handleImageClick(formData.passageImage, 'Passage')}
                    />
                  </div>
                )}
                
                {/* Text input - always show, even with image */}
                <textarea
                  value={formData.passageText}
                  onChange={(e) => handleInputChange('passageText', e.target.value)}
                  onPaste={handlePassagePaste}
                  placeholder={formData.passageImage 
                    ? "Add text to accompany the image above... (or paste another image)" 
                    : "Enter the reading passage or problem context... (or paste an image)"
                  }
                  rows={formData.passageImage ? 2 : 3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 resize-vertical text-base sm:text-sm transition-colors duration-300 ${
                    validationErrors.passageText 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                />
                
                {/* Help text */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  💡 You can paste images (Ctrl+V) and add text to create rich passages with both visual and textual content.
                </p>
              </div>

              {/* Question Text - Compact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => handleInputChange('questionText', e.target.value)}
                  placeholder="Enter the specific question being asked..."
                  rows={2}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 resize-vertical text-base sm:text-sm transition-colors duration-300 ${
                    validationErrors.questionText 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                />
              </div>

              {/* Answer Choices - Compact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                  Answer Choices <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ANSWER_CHOICES.map((choice) => (
                    <div key={choice} className="relative">
                      <div className={`border-2 rounded-lg p-4 transition-colors ${
                        validationErrors[`answerChoice_${choice}`]
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : formData.correctAnswer === choice 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                      }`}>
                        <div className="flex items-center mb-1">
                          <input
                            type="radio"
                            id={`correct-${choice}`}
                            name="correctAnswer"
                            value={choice}
                            checked={formData.correctAnswer === choice}
                            onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                            className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 focus:ring-green-500 dark:bg-gray-700"
                          />
                          <label 
                            htmlFor={`correct-${choice}`}
                            className="ml-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300 cursor-pointer hover:text-green-600 dark:hover:text-green-400"
                          >
                            Choice {choice} {formData.correctAnswer === choice && (
                              <span className="text-green-600 text-xs">(Correct)</span>
                            )}
                          </label>
                        </div>
                        <input
                          type="text"
                          value={formData.answerChoices[choice]}
                          onChange={(e) => handleAnswerChoiceChange(choice, e.target.value)}
                          placeholder={`Enter answer choice ${choice}...`}
                          className={`w-full px-3 py-2.5 border rounded-md focus:ring-2 text-base transition-colors duration-300 ${
                            validationErrors[`answerChoice_${choice}`]
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation and Settings Row - Compact */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {/* Explanation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Explanation (Optional)</label>
                  
                  {/* Show image if present */}
                  {formData.explanationImage && (
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Explanation Image</span>
                        <button 
                          type="button" 
                          onClick={handleRemoveExplanationImage} 
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:underline"
                        >
                          Remove Image
                        </button>
                      </div>
                      <img 
                        src={formData.explanationImage} 
                        alt="Explanation" 
                        className="max-h-48 w-auto rounded shadow-sm border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-90 transition-opacity duration-200" 
                        onClick={() => handleImageClick(formData.explanationImage, 'Explanation')}
                      />
                    </div>
                  )}
                  
                  {/* Text input - always show, even with image */}
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => handleInputChange('explanation', e.target.value)}
                    onPaste={handleExplanationPaste}
                    placeholder={formData.explanationImage 
                      ? "Add text to accompany the explanation image above... (or paste another image)" 
                      : "Provide an explanation for the correct answer... (or paste an image)"
                    }
                    rows={formData.explanationImage ? 2 : 3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-base sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                  />
                  
                  {/* Help text */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    💡 You can paste images (Ctrl+V) and add text to create rich explanations with both visual and textual content.
                  </p>
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Difficulty Level</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-base sm:text-sm transition-colors duration-300"
                    >
                      {Object.values(DIFFICULTY_LEVELS).map((level) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>


                </div>
              </div>
              </div>

              {/* Submit Button - Compact - Always visible at bottom */}
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                {/* Left side - Cancel button when editing or Skip button in import mode */}
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setOriginalFormData(null);
                      setSelectedQuestionIndex(-1);
                      setFormData({
                        section: SAT_SECTIONS.READING_WRITING,
                        domain: '',
                        questionType: '',
                        passageText: '',
                        passageImage: null,
                        questionText: '',
                        answerChoices: { A: '', B: '', C: '', D: '' },
                        correctAnswer: 'A',
                        explanation: '',
                        explanationImage: null,
                        difficulty: DIFFICULTY_LEVELS.MEDIUM
                      });
                    }}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
                {isImportMode && (
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center space-x-2 ${currentQuestionIndex===0?'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed':'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-blue-200 hover:bg-blue-300 dark:hover:bg-blue-600'}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>
                )}

                {/* Right side - Delete/Update/Add/Next button */}
                <div className={editingId || isImportMode ? '' : 'sm:ml-auto'}>
                  {editingId && !hasFormChanges() ? (
                    // Show Delete button when editing but no changes
                    <AnimatedButton
                      type="button"
                      variant="danger"
                      successMessage="Question Deleted!"
                      onClick={async () => {
                        await handleDelete(editingId);
                        setEditingId(null);
                        setOriginalFormData(null);
                        setSelectedQuestionIndex(-1);
                        setFormData({
                          section: SAT_SECTIONS.READING_WRITING,
                          domain: '',
                          questionType: '',
                          passageText: '',
                          passageImage: null,
                          questionText: '',
                          answerChoices: { A: '', B: '', C: '', D: '' },
                          correctAnswer: 'A',
                          explanation: '',
                          explanationImage: null,
                          difficulty: DIFFICULTY_LEVELS.MEDIUM
                        });
                      }}
                      className="text-sm w-full sm:w-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Question</span>
                    </AnimatedButton>
                  ) : isImportMode ? (
                    // Show Finish or Next buttons during import
                    currentQuestionIndex === csvQuestions.length - 1 ? (
                      <AnimatedButton
                        type="button"
                        variant="success"
                        successMessage="Import Complete!"
                        onClick={handleNextQuestion}
                        className="text-sm flex items-center space-x-2 w-full sm:w-auto"
                      >
                        <span>Finish Import</span>
                      </AnimatedButton>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleImportAllNow}
                        disabled={isBulkImporting}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2 w-full sm:w-auto"
                      >
                        <span>{isBulkImporting ? 'Importing All...' : 'Import All'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextQuestion}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-2 w-full sm:w-auto"
                      >
                        <span>Next Question</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )
                  ) : (
                    // Show Update/Add button
                    <AnimatedButton
                      type="button"
                      variant={editingId ? "primary" : "success"}
                      successMessage={() => editingId ? "Updated!" : "Added!"}
                      onClick={handleSubmit}
                      className="text-sm w-full sm:w-auto"
                    >
                      <span>{editingId ? 'Update Question' : 'Add Question'}</span>
                    </AnimatedButton>
                  )}
                </div>
              </div>
              </div>
            </form>
          </div>

          {/* Questions List Section with AnimatedList */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col lg:h-full overflow-hidden transition-colors duration-300 min-h-[400px] md:min-h-[500px]">
            <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-300">
              <div className="flex flex-col gap-3">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Wrong Log</h2>
                    <div className="flex items-center gap-3 text-sm transition-colors duration-300">
                      <p className="text-gray-600 dark:text-gray-400">
                        {isImportMode ? 'Import in progress - editing disabled' : (() => {
                          const visibleQuestions = filteredQuestions.filter(q => !q.hidden);
                          const hiddenQuestions = filteredQuestions.filter(q => q.hidden);
                          return `${visibleQuestions.length} questions`;
                        })()}
                      </p>
                      {!isImportMode && (() => {
                        const hiddenQuestions = filteredQuestions.filter(q => q.hidden);
                        return hiddenQuestions.length > 0 ? (
                          <p className="text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                            {hiddenQuestions.length} hidden
                          </p>
                        ) : null;
                      })()}
                    </div>
                  </div>
                  
                  {/* Bulk Selection Toggle */}
                  {!isImportMode && filteredQuestions.length > 0 && (
                    <button
                      onClick={handleBulkSelectionToggle}
                      disabled={isImportMode}
                      className={`px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
                        bulkSelectionMode
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40 border border-purple-200 dark:border-purple-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      } ${isImportMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {bulkSelectionMode ? 'Exit Selection' : 'Select Multiple'}
                    </button>
                  )}
                </div>
                
                {/* Bulk Selection Controls Row */}
                {!isImportMode && bulkSelectionMode && filteredQuestions.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Bulk Selection Mode
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleSelectAll}
                        className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={handleSelectNone}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                      >
                        Clear All
                      </button>
                      {selectedQuestions.size > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors font-medium"
                        >
                          Delete Selected ({selectedQuestions.size})
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Advanced Search Bar - Only show if search props are provided */}
                {onSearchChange && (
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search anything: keywords, typos, 'con:a', 'con:b', etc. (fuzzy matching enabled)"
                        className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-300"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      {searchTerm && (
                        <button
                          onClick={() => onSearchChange('')}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {!hideSearchTips && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Search tips:</span> 
                        • Type any keyword, even with typos • Use "con:a" to find questions ending with "con:a" • 
                        Searches across all fields: section, domain, question text, choices, explanations
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Animated Questions List - Takes up remaining space */}
            <div className="p-3 sm:p-4 flex-1 lg:overflow-hidden">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 transition-colors duration-300">Loading questions...</h3>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 transition-colors duration-300">No questions found</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300 mb-4">Create your first question using the form or import from CSV.</p>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setShowCsvModal(true)}
                      className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
                    >
                      Paste CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="lg:h-full relative">
                  <AnimatedList
                    items={questionItems}
                    onItemSelect={handleQuestionSelect}
                    showGradients={true}
                    enableArrowNavigation={!isImportMode}
                    displayScrollbar={true}
                    disabled={isImportMode}
                    initialSelectedIndex={selectedQuestionIndex}
                    selectedItems={bulkSelectionMode ? new Set(
                      filteredQuestions
                        .map((question, index) => selectedQuestions.has(question.id) ? index : -1)
                        .filter(index => index !== -1)
                    ) : new Set()}
                    renderItem={renderQuestionItem}
                  />
                  {isImportMode && (
                    <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center rounded-lg z-10 border-2 border-yellow-300 dark:border-yellow-600">
                      <div className="text-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-yellow-200 dark:border-yellow-700">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          Import in Progress
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Question bank editing disabled
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {filteredQuestions.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0 transition-colors duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300 text-xs sm:text-sm">
                    {bulkSelectionMode 
                      ? `Click questions to select/deselect (${selectedQuestions.size} selected)`
                      : 'Click any question to edit'
                    }
                  </span>
                  
                  {/* Modern 3-dots menu - positioned on the right */}
                  {!bulkSelectionMode && !editingId && !isImportMode && (
                    <div className="relative self-end sm:self-auto" ref={actionsMenuRef}>
                      <button
                        onClick={() => setShowActionsMenu(!showActionsMenu)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        title="More actions"
                      >
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                      </button>
                      
                      {/* Dropdown menu - positioned at top right */}
                      {showActionsMenu && (
                        <div className="absolute bottom-full right-0 mb-1 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                          <button
                            onClick={() => {
                              setShowCsvModal(true);
                              setCsvInput('');
                              setCsvError('');
                              setShowActionsMenu(false);
                            }}
                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 sm:gap-3"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="truncate">Paste CSV</span>
                          </button>
                          <button
                            onClick={() => {
                              handleCleanupDuplicates();
                              setShowActionsMenu(false);
                            }}
                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 sm:gap-3"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="truncate">Clean Duplicates</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteAllQuestions();
                              setShowActionsMenu(false);
                            }}
                            className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 flex items-center gap-2 sm:gap-3"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="truncate">Delete All Questions</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Points Animation */}
      {pointsAnimation.show && (
        <PointsAnimation
          pointsAwarded={pointsAnimation.points}
          actionType={pointsAnimation.action}
          onComplete={handlePointsAnimationComplete}
        />
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        imageSrc={imageModal.imageSrc}
        imageAlt={imageModal.imageAlt}
        onClose={handleCloseImageModal}
      />
    </div>
  );
};

export default QuestionLogger; 