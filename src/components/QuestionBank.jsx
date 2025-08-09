import React, { useMemo, useState, useEffect } from 'react';
import { useCatalogQuestions } from '../hooks/useUserData';
import { useDarkMode } from '../contexts/DarkModeContext';
import Fuse from 'fuse.js/dist/fuse.esm.js';

const QuestionBank = () => {
  const { data: catalog, loading } = useCatalogQuestions();
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
      const fuse = new Fuse(arr, {
        includeScore: true,
        threshold: 0.3,
        ignoreLocation: true,
        keys: ['section','domain','questionType','difficulty','questionText','passageText','answerChoices.A','answerChoices.B','answerChoices.C','answerChoices.D']
      });
      return fuse.search(search).filter(r => (r.score ?? 0) <= 0.5).map(r => r.item);
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

