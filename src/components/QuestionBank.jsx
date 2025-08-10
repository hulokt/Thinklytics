import React, { useMemo, useState, useEffect } from 'react';
import { useGlobalCatalogQuestions } from '../hooks/useCatalogGlobal';
import { useDarkMode } from '../contexts/DarkModeContext';
import Fuse from 'fuse.js/dist/fuse.esm.js';

const QuestionBank = () => {
  const { data: catalog, loading } = useGlobalCatalogQuestions();
  const { isDarkMode } = useDarkMode();
  const [search, setSearch] = useState('');
  const [section, setSection] = useState('All');
  const [domain, setDomain] = useState('All');
  const [questionType, setQuestionType] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  const questions = Array.isArray(catalog) ? catalog : [];

  const filtered = useMemo(() => {
    let arr = questions;
    if (section !== 'All') arr = arr.filter(q => q.section === section);
    if (domain !== 'All') arr = arr.filter(q => q.domain === domain);
    if (questionType !== 'All') arr = arr.filter(q => q.questionType === questionType);
    if (difficulty !== 'All') arr = arr.filter(q => q.difficulty === difficulty);
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      
      // Special syntax for "con:" - find all questions with "con:" anywhere
      if (searchLower === 'con:') {
        return arr.filter(question => {
          const questionText = (question.questionText || '').toLowerCase();
          const explanation = (question.explanation || '').toLowerCase();
          return questionText.includes('con:') || explanation.includes('con:');
        });
      }
      
      // Special syntax for "con:" followed by answer choice
      const conMatch = searchLower.match(/^con:\s*([abcd])$/i);
      if (conMatch) {
        const answerChoice = conMatch[1].toLowerCase();
        return arr.filter(question => {
          const questionText = (question.questionText || '').toLowerCase();
          const explanation = (question.explanation || '').toLowerCase();
          return (questionText.includes(`con:${answerChoice}`) || questionText.includes(`con: ${answerChoice}`)) ||
                 (explanation.includes(`con:${answerChoice}`) || explanation.includes(`con: ${answerChoice}`));
        });
      }
      
      // Advanced fuzzy search with comprehensive data coverage
      const fuse = new Fuse(arr, {
        includeScore: true,
        threshold: 0.3, // Stricter threshold for better relevance
        ignoreLocation: true,
        minMatchCharLength: 2,
        shouldSort: true,
        keys: [
          { name: 'section', weight: 0.05 },
          { name: 'domain', weight: 0.05 },
          { name: 'questionType', weight: 0.05 },
          { name: 'difficulty', weight: 0.02 },
          { name: 'questionText', weight: 0.4 },
          { name: 'passageText', weight: 0.35 },
          { name: 'explanation', weight: 0.2 },
          { name: 'answerChoices.A', weight: 0.08 },
          { name: 'answerChoices.B', weight: 0.08 },
          { name: 'answerChoices.C', weight: 0.08 },
          { name: 'answerChoices.D', weight: 0.08 },
          { name: 'correctAnswer', weight: 0.02 }
        ]
      });
      
      const results = fuse.search(search);
      // Stricter filtering - only include highly relevant results
      return results.filter(r => (r.score ?? 0) <= 0.4).map(r => r.item);
    }
    return arr;
  }, [questions, section, domain, questionType, difficulty, search]);

  const distinct = (key) => ['All', ...Array.from(new Set(questions.map(q => q[key]).filter(Boolean)))];

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Question Bank</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Browse sample SAT-style questions. Your analytics only count when you answer a question wrong (it will be added to your Wrong Log automatically).</p>
      </div>
      <div className="p-3 grid grid-cols-2 md:grid-cols-6 gap-2 bg-white dark:bg-gray-900">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600" />
        <select value={section} onChange={e=>{setSection(e.target.value); setDomain('All'); setQuestionType('All');}} className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600">
          {distinct('section').map(v=> <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={domain} onChange={e=>setDomain(e.target.value)} className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600">
          {distinct('domain').map(v=> <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={questionType} onChange={e=>setQuestionType(e.target.value)} className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600">
          {distinct('questionType').map(v=> <option key={v} value={v}>{v}</option>)}
        </select>
        <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600">
          {distinct('difficulty').map(v=> <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {loading ? (
          <div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600 dark:text-gray-400">No questions match your filters.</div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(q => (
              <li key={q.id} className="p-3 border rounded bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">{q.section} • {q.domain} • {q.questionType} • {q.difficulty}</div>
                <div className="font-medium text-gray-900 dark:text-white mt-1">{q.questionText || (q.passageText?.slice(0,120) + '...')}</div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {['A','B','C','D'].map(letter => (
                    q.answerChoices?.[letter] ? (
                      <div key={letter} className="px-2 py-1 border rounded dark:border-gray-600">
                        <span className="font-semibold mr-1">{letter}.</span> {q.answerChoices[letter]}
                      </div>
                    ) : null
                  ))}
                </div>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Correct Answer: {q.correctAnswer}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuestionBank;




