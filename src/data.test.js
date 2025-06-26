import { 
  SAT_SECTIONS, 
  getDomainOptions, 
  getQuestionTypeOptions, 
  getQuestionTypeOptionsByDomain,
  READING_WRITING_QUESTION_TYPES_BY_DOMAIN,
  MATH_QUESTION_TYPES_BY_DOMAIN
} from './data.js';

// Test the domain-based question type filtering
console.log('🧪 Testing domain-based question type filtering...\n');

// Test Reading & Writing domains
console.log('📚 Reading & Writing Section:');
Object.entries(READING_WRITING_QUESTION_TYPES_BY_DOMAIN).forEach(([domain, questionTypes]) => {
  console.log(`  🔹 ${domain}:`);
  questionTypes.forEach(type => console.log(`    - ${type}`));
  console.log('');
});

// Test Math domains
console.log('🧮 Math Section:');
Object.entries(MATH_QUESTION_TYPES_BY_DOMAIN).forEach(([domain, questionTypes]) => {
  console.log(`  🔹 ${domain}:`);
  questionTypes.forEach(type => console.log(`    - ${type}`));
  console.log('');
});

// Test the helper functions
console.log('🔧 Testing helper functions:');

// Test getQuestionTypeOptionsByDomain for Reading & Writing
console.log('\n📚 Reading & Writing - Information and Ideas:');
const rwInfoIdeas = getQuestionTypeOptionsByDomain(SAT_SECTIONS.READING_WRITING, 'Information and Ideas');
console.log(rwInfoIdeas);

console.log('\n📚 Reading & Writing - Craft and Structure:');
const rwCraftStructure = getQuestionTypeOptionsByDomain(SAT_SECTIONS.READING_WRITING, 'Craft and Structure');
console.log(rwCraftStructure);

console.log('\n📚 Reading & Writing - Expression of Ideas:');
const rwExpression = getQuestionTypeOptionsByDomain(SAT_SECTIONS.READING_WRITING, 'Expression of Ideas');
console.log(rwExpression);

console.log('\n📚 Reading & Writing - Standard English Conventions:');
const rwConventions = getQuestionTypeOptionsByDomain(SAT_SECTIONS.READING_WRITING, 'Standard English Conventions');
console.log(rwConventions);

// Test getQuestionTypeOptionsByDomain for Math
console.log('\n🧮 Math - Algebra:');
const mathAlgebra = getQuestionTypeOptionsByDomain(SAT_SECTIONS.MATH, 'Algebra');
console.log(mathAlgebra);

console.log('\n🧮 Math - Advanced Math:');
const mathAdvanced = getQuestionTypeOptionsByDomain(SAT_SECTIONS.MATH, 'Advanced Math');
console.log(mathAdvanced);

console.log('\n🧮 Math - Problem Solving and Data Analysis:');
const mathProblemSolving = getQuestionTypeOptionsByDomain(SAT_SECTIONS.MATH, 'Problem Solving and Data Analysis');
console.log(mathProblemSolving);

console.log('\n🧮 Math - Geometry and Trigonometry:');
const mathGeometry = getQuestionTypeOptionsByDomain(SAT_SECTIONS.MATH, 'Geometry and Trigonometry');
console.log(mathGeometry);

// Test fallback behavior (no domain selected)
console.log('\n🔄 Test fallback behavior (no domain):');
const fallbackRW = getQuestionTypeOptionsByDomain(SAT_SECTIONS.READING_WRITING, '');
const fallbackMath = getQuestionTypeOptionsByDomain(SAT_SECTIONS.MATH, '');
console.log('Reading & Writing (no domain):', fallbackRW.length, 'types');
console.log('Math (no domain):', fallbackMath.length, 'types');

console.log('\n✅ Domain-based question type filtering test completed!'); 