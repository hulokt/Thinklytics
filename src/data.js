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

export const READING_WRITING_TYPES = {
  CENTRAL_IDEAS_AND_DETAILS: 'Central Ideas and Details',
  WORDS_IN_CONTEXT: 'Words in Context',
  STRUCTURE_AND_PURPOSE: 'Structure and Purpose',
  TRANSITIONS: 'Transitions',
  MODIFIER_PLACEMENT: 'Modifier Placement',
  PUNCTUATION_USAGE: 'Punctuation Usage',
  LOGICAL_COMPARISON: 'Logical Comparison'
};

export const MATH_DOMAINS = {
  ALGEBRA: 'Algebra',
  ADVANCED_MATH: 'Advanced Math',
  PROBLEM_SOLVING_AND_DATA_ANALYSIS: 'Problem Solving and Data Analysis',
  GEOMETRY_AND_TRIGONOMETRY: 'Geometry and Trigonometry'
};

export const MATH_TYPES = {
  LINEAR_QUADRATIC_EQUATIONS: 'Linear/Quadratic Equations',
  SYSTEMS: 'Systems',
  INEQUALITIES: 'Inequalities',
  FUNCTIONS: 'Functions',
  PERCENTAGES: 'Percentages',
  STATISTICS: 'Statistics',
  GEOMETRY: 'Geometry',
  TRIGONOMETRY: 'Trigonometry'
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

// Helper function to get question type options based on section
export const getQuestionTypeOptions = (section) => {
  if (section === SAT_SECTIONS.READING_WRITING) {
    return Object.values(READING_WRITING_TYPES);
  } else if (section === SAT_SECTIONS.MATH) {
    return Object.values(MATH_TYPES);
  }
  return [];
}; 