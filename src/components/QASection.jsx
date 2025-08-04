import { useState } from "react";
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
    <section id="faq" className="py-24 px-6">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-bold homepage-gradient-text mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-xl homepage-text-secondary max-w-3xl mx-auto">
            Everything you need to know about our AI-powered SAT preparation platform
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group rounded-3xl homepage-card backdrop-blur-sm border homepage-hover-glow overflow-hidden transition-all duration-500"
            >
              <button
                className="w-full px-8 py-8 text-left flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-300"
                onClick={() => toggleItem(index)}
              >
                <h3 className="text-xl font-bold homepage-text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <div className={`transition-transform duration-500 ease-in-out ${openItems.includes(index) ? 'rotate-180' : 'rotate-0'}`}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors duration-300">
                      <ChevronDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-700 ease-in-out ${
                  openItems.includes(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-8 pb-8">
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent mb-6"></div>
                  <p className="text-lg homepage-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QASection; 