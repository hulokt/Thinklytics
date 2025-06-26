export const SAT_SECTIONS = {
  READING_WRITING: 'Reading & Writing',
  MATH: 'Math'
};

export const READING_WRITING_DOMAINS = {
  INFORMATION_AND_IDEAS: 'Information and Ideas',
  CRAFT_AND_STRUCTURE: 'Craft and Structure',
  EXPRESSION_OF_IDEAS: 'Expression of Ideas',
  STANDARD_ENGLISH_CONVENTIONS: 'Standard English Conventions'
};

// Question types organized by domain for Reading & Writing
export const READING_WRITING_QUESTION_TYPES_BY_DOMAIN = {
  'Information and Ideas': [
    'Main Idea',
    'Inference',
    'Supporting Evidence',
    'Detail'
  ],
  'Craft and Structure': [
    'Words in Context',
    'Text Structure',
    'Purpose',
    'Cross-Text Connections'
  ],
  'Expression of Ideas': [
    'Rhetorical Synthesis',
    'Transitions',
    'Conciseness',
    'Precision'
  ],
  'Standard English Conventions': [
    'Punctuation',
    'Sentence Boundaries',
    'Verb Tense and Agreement',
    'Pronouns and Modifiers'
  ]
};

export const MATH_DOMAINS = {
  ALGEBRA: 'Algebra',
  ADVANCED_MATH: 'Advanced Math',
  PROBLEM_SOLVING_AND_DATA_ANALYSIS: 'Problem Solving and Data Analysis',
  GEOMETRY_AND_TRIGONOMETRY: 'Geometry and Trigonometry'
};

// Question types organized by domain for Math
export const MATH_QUESTION_TYPES_BY_DOMAIN = {
  'Algebra': [
    'Linear Equations',
    'Inequalities',
    'Systems of Equations'
  ],
  'Advanced Math': [
    'Quadratics',
    'Rational Expressions',
    'Radical Equations',
    'Functions'
  ],
  'Problem Solving and Data Analysis': [
    'Ratios and Proportions',
    'Unit Conversions',
    'Data Interpretation',
    'Statistics'
  ],
  'Geometry and Trigonometry': [
    'Angles',
    'Circles',
    'Area/Volume',
    'Trigonometric Functions'
  ]
};

export const DIFFICULTY_LEVELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard'
};

export const ANSWER_CHOICES = ['A', 'B', 'C', 'D'];

// Helper function to get domain options based on section
export const getDomainOptions = (section) => {
  if (section === SAT_SECTIONS.READING_WRITING) {
    return Object.values(READING_WRITING_DOMAINS);
  } else if (section === SAT_SECTIONS.MATH) {
    return Object.values(MATH_DOMAINS);
  }
  return [];
};

// Helper function to get question type options based on section (all new types, no legacy)
export const getQuestionTypeOptions = (section) => {
  if (section === SAT_SECTIONS.READING_WRITING) {
    // Aggregate all unique types from all RW domains
    return Array.from(new Set(Object.values(READING_WRITING_QUESTION_TYPES_BY_DOMAIN).flat()));
  } else if (section === SAT_SECTIONS.MATH) {
    // Aggregate all unique types from all Math domains
    return Array.from(new Set(Object.values(MATH_QUESTION_TYPES_BY_DOMAIN).flat()));
  }
  return [];
};

// Helper function to get question type options based on section and domain
export const getQuestionTypeOptionsByDomain = (section, domain) => {
  if (!domain || domain === '' || domain === 'All') {
    // If no domain is selected, return all question types for the section
    return getQuestionTypeOptions(section);
  }
  
  if (section === SAT_SECTIONS.READING_WRITING) {
    return READING_WRITING_QUESTION_TYPES_BY_DOMAIN[domain] || [];
  } else if (section === SAT_SECTIONS.MATH) {
    return MATH_QUESTION_TYPES_BY_DOMAIN[domain] || [];
  }
  return [];
};

// Helper function to get all question types for a section (for backward compatibility)
export const getAllQuestionTypesForSection = (section) => {
  return getQuestionTypeOptions(section);
}; 