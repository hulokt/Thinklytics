import React, { useState } from 'react';
import { 
  SAT_SECTIONS, 
  getDomainOptions, 
  getQuestionTypeOptions, 
  DIFFICULTY_LEVELS, 
  ANSWER_CHOICES 
} from '../data';
import AnimatedList from './AnimatedList';
import AnimatedButton from './ui/animated-button';
import Toast from './ui/toast';

const QuestionLogger = ({ questions, onAddQuestion, onUpdateQuestion, onDeleteQuestion }) => {
  // Ensure questions is always an array
  const questionsArray = Array.isArray(questions) ? questions : [];

  const [formData, setFormData] = useState({
    section: SAT_SECTIONS.READING_WRITING,
    domain: '',
    questionType: '',
    passageText: '',
    questionText: '',
    answerChoices: {
      A: '',
      B: '',
      C: '',
      D: ''
    },
    correctAnswer: 'A',
    explanation: '',
    difficulty: DIFFICULTY_LEVELS.MEDIUM
  });

  const [editingId, setEditingId] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [filterSection, setFilterSection] = useState('All Sections');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
    
    // Validate form fields
    const errors = {};
    
    if (!formData.passageText.trim()) {
      errors.passageText = true;
    }

    if (!formData.questionText.trim()) {
      errors.questionText = true;
    }

    // Check if any answer choice is empty
    const emptyChoices = Object.entries(formData.answerChoices)
      .filter(([key, value]) => !value.trim())
      .map(([key]) => key);
    
    if (emptyChoices.length > 0) {
      emptyChoices.forEach(choice => {
        errors[`answerChoice_${choice}`] = true;
      });
    }

    // If there are validation errors, set them and throw error
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setToast({ 
        isVisible: true, 
        message: 'Please fill in all required fields', 
        type: 'delete' 
      });
      throw new Error('Validation failed');
    }

    // Clear validation errors if validation passes
    setValidationErrors({});

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (editingId) {
      onUpdateQuestion(editingId, formData);
      setEditingId(null);
      setOriginalFormData(null);
      setToast({ 
        isVisible: true, 
        message: 'Question updated successfully!', 
        type: 'update' 
      });
    } else {
      onAddQuestion(formData);
      setToast({ 
        isVisible: true, 
        message: 'Question saved successfully!', 
        type: 'success' 
      });
    }

    // Reset form
    setFormData({
      section: SAT_SECTIONS.READING_WRITING,
      domain: '',
      questionType: '',
      passageText: '',
      questionText: '',
      answerChoices: { A: '', B: '', C: '', D: '' },
      correctAnswer: 'A',
      explanation: '',
      difficulty: DIFFICULTY_LEVELS.MEDIUM
    });
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    const questionData = {
      section: question.section,
      domain: question.domain,
      questionType: question.questionType,
      passageText: question.passageText,
      questionText: question.questionText,
      answerChoices: question.answerChoices,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      difficulty: question.difficulty
    };
    setFormData(questionData);
    setOriginalFormData(questionData);
  };

  // Function to detect if form has changes
  const hasFormChanges = () => {
    if (!editingId || !originalFormData) return false;
    
    // Compare all form fields
    const fieldsToCompare = ['section', 'domain', 'questionType', 'passageText', 'questionText', 'correctAnswer', 'explanation', 'difficulty'];
    
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onDeleteQuestion(id);
    setToast({ 
      isVisible: true, 
      message: 'Question deleted successfully!', 
      type: 'delete' 
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

  const filteredQuestions = questionsArray
    .filter(q => filterSection === 'All Sections' || q.section === filterSection)
    .sort((a, b) => {
      // Sort by creation date (newest first)
      const dateA = new Date(a.createdAt || a.id || 0);
      const dateB = new Date(b.createdAt || b.id || 0);
      return dateB - dateA;
    });

  // Prepare questions for AnimatedList
  const questionItems = filteredQuestions.map(question => {
    const preview = question.questionText ? 
      `${question.questionText.substring(0, 80)}${question.questionText.length > 80 ? '...' : ''}` :
      'No question text';
    return `${question.section} - ${question.domain} | ${preview}`;
  });

  const handleQuestionSelect = (questionText, index) => {
    const selectedQuestion = filteredQuestions[index];
    handleEdit(selectedQuestion);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 h-full overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header - Modern Design */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 px-6 py-4 flex-shrink-0 relative overflow-hidden shadow-lg transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              {editingId ? 'Edit Question' : 'Create New Question'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">
              {editingId ? 'Update the question details below with modern tools' : 'Add a new question to your question bank with advanced features'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {!editingId && (
              <button
                onClick={generateRandomQuestion}
                className="group relative bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center space-x-2 text-sm font-medium overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14L17 4M9 9v8M15 9v8" />
                  </svg>
                  <span>Generate Sample</span>
                </div>
              </button>
            )}

          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="w-full px-6 py-4 h-full">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Form Section - Modern Design */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-300 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-t-2xl"></div>
            
            <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0 transition-colors duration-300">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">Question Details</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
              <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {/* Section Tabs - Modern Design */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 transition-colors duration-300">Section</label>
                <div className="flex space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 p-2 rounded-xl w-fit shadow-inner transition-colors duration-300">
                  {Object.values(SAT_SECTIONS).map((section) => (
                    <button
                      key={section}
                      type="button"
                      onClick={() => handleInputChange('section', section)}
                      className={`px-5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        formData.section === section
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg transform scale-105'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50 hover:shadow-md transition-colors duration-300'
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain and Question Type Row - Compact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Domain</label>
                  <select
                    value={formData.domain}
                    onChange={(e) => handleInputChange('domain', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-300"
                  >
                    <option value="">Select Domain</option>
                    {getDomainOptions(formData.section).map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Question Type</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => handleInputChange('questionType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-300"
                  >
                    <option value="">Select Question Type</option>
                    {getQuestionTypeOptions(formData.section).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Passage Text - Compact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
                  Passage Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.passageText}
                  onChange={(e) => handleInputChange('passageText', e.target.value)}
                  placeholder="Enter the reading passage or problem context..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 resize-vertical text-sm transition-colors duration-300 ${
                    validationErrors.passageText 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                />
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 resize-vertical text-sm transition-colors duration-300 ${
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
                      <div className={`border-2 rounded-lg p-3 transition-colors ${
                        validationErrors[`answerChoice_${choice}`]
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                          : formData.correctAnswer === choice 
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                      }`}>
                        <div className="flex items-center mb-1">
                          <input
                            type="radio"
                            name="correctAnswer"
                            value={choice}
                            checked={formData.correctAnswer === choice}
                            onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
                            className="w-4 h-4 text-green-600 border-gray-300 dark:border-gray-600 focus:ring-green-500 dark:bg-gray-700"
                          />
                          <label className="ml-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
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
                          className={`w-full px-2 py-1.5 border rounded-md focus:ring-2 text-sm transition-colors duration-300 ${
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
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => handleInputChange('explanation', e.target.value)}
                    placeholder="Provide an explanation for the correct answer..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                  />
                </div>

                {/* Settings */}
                <div className="space-y-3">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">Difficulty Level</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => handleInputChange('difficulty', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-300"
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
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-300">
                <div className="flex justify-between">
                {/* Left side - Cancel button when editing */}
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setOriginalFormData(null);
                      setFormData({
                        section: SAT_SECTIONS.READING_WRITING,
                        domain: '',
                        questionType: '',
                        passageText: '',
                        questionText: '',
                        answerChoices: { A: '', B: '', C: '', D: '' },
                        correctAnswer: 'A',
                        explanation: '',
                        difficulty: DIFFICULTY_LEVELS.MEDIUM
                      });
                    }}
                    className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}

                {/* Right side - Delete/Update/Add button */}
                <div className={editingId ? '' : 'ml-auto'}>
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
                        setFormData({
                          section: SAT_SECTIONS.READING_WRITING,
                          domain: '',
                          questionType: '',
                          passageText: '',
                          questionText: '',
                          answerChoices: { A: '', B: '', C: '', D: '' },
                          correctAnswer: 'A',
                          explanation: '',
                          difficulty: DIFFICULTY_LEVELS.MEDIUM
                        });
                      }}
                      className="text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Question</span>
                    </AnimatedButton>
                  ) : (
                    // Show Update/Add button
                    <AnimatedButton
                      type="button"
                      variant={editingId ? "primary" : "success"}
                      successMessage={() => editingId ? "Updated!" : "Added!"}
                      onClick={handleSubmit}
                      className="text-sm"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden transition-colors duration-300">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 transition-colors duration-300">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Question Bank</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">{filteredQuestions.length} questions</p>
                </div>
              </div>
              
              {/* Filter */}
              <div>
                <select
                  value={filterSection}
                  onChange={(e) => setFilterSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm transition-colors duration-300"
                >
                  <option value="All Sections">All Sections</option>
                  {Object.values(SAT_SECTIONS).map((section) => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Animated Questions List - Takes up remaining space */}
            <div className="p-4 flex-1 overflow-hidden">
              {filteredQuestions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors duration-300">
                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1 transition-colors duration-300">No questions found</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">Create your first question using the form.</p>
                </div>
              ) : (
                <div className="h-full">
                  <AnimatedList
                    items={questionItems}
                    onItemSelect={handleQuestionSelect}
                    showGradients={true}
                    enableArrowNavigation={true}
                    displayScrollbar={true}
                  />
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {filteredQuestions.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex-shrink-0 transition-colors duration-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Click any question to edit
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setFilterSection('All Sections')}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-300"
                    >
                      Show All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={3000}
      />
    </div>
  );
};

export default QuestionLogger; 