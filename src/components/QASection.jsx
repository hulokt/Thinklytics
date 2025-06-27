import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How does SAT wrong answer logging work?",
    answer: "Our system allows you to quickly log every wrong answer you make during practice tests or study sessions. Simply input the question details, your answer, the correct answer, and the topic. Our AI then categorizes and analyzes your mistakes to identify patterns and weak areas."
  },
  {
    question: "What kind of analytics do you provide?",
    answer: "We provide comprehensive analytics including performance trends over time, topic-wise accuracy rates, question difficulty analysis, time spent per section, improvement predictions, and personalized study recommendations based on your mistake patterns."
  },
  {
    question: "Can I track multiple practice tests?",
    answer: "Absolutely! You can log unlimited practice tests and track your progress across all of them. Our dashboard shows your performance evolution, comparing scores across different test dates and identifying areas of consistent improvement or concern."
  },
  {
    question: "How accurate are the study recommendations?",
    answer: "Our AI-powered recommendations are based on analysis of thousands of SAT questions and student performance data. The system identifies your specific weak points and suggests targeted study materials, practice questions, and time allocation strategies with 89% average accuracy."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes, we take data security seriously. All your study data is encrypted and stored securely. We never share your personal information or study patterns with third parties. You have full control over your data and can export or delete it at any time."
  },
  {
    question: "Can I use this for other standardized tests?",
    answer: "Currently, our system is optimized specifically for the SAT. However, we're working on expanding to other standardized tests like ACT, GRE, and GMAT. Premium users will get early access to these features as they become available."
  }
];

const QASection = () => {
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (index) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-20 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl mb-4">
            Frequently Asked 
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about our SAT analytics platform
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group rounded-2xl bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 overflow-hidden hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 shadow-sm"
            >
              <button
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200"
                onClick={() => toggleItem(index)}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0 ml-4">
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200" />
                  )}
                </div>
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6 animate-fade-in">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-200 dark:border-white/10 pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QASection; 