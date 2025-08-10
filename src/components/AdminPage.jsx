import React, { useEffect, useState, useMemo, useRef } from 'react';
import QuestionLogger from './QuestionLogger';
import { useGlobalCatalogQuestions } from '../hooks/useCatalogGlobal';
import Fuse from 'fuse.js/dist/fuse.esm.js';

// Advanced search utilities
const normalizeText = (text) => {
  if (!text) return '';
  return text.toString().toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

const calculateSimilarity = (text1, text2) => {
  const normalized1 = normalizeText(text1);
  const normalized2 = normalizeText(text2);
  
  if (normalized1 === normalized2) return 1;
  if (!normalized1 || !normalized2) return 0;
  
  // Check if one contains the other
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.8;
  }
  
  // Simple word-based similarity
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = new Set([...words1, ...words2]).size;
  
  return commonWords.length / totalWords;
};

const fuzzySearch = (searchTerm, text, threshold = 0.3) => {
  if (!searchTerm || !text) return false;
  
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedText = normalizeText(text);
  
  // Exact match
  if (normalizedText.includes(normalizedSearch)) return true;
  
  // Fuzzy match
  const similarity = calculateSimilarity(normalizedSearch, normalizedText);
  return similarity >= threshold;
};

const AdminPage = () => {
  const { data: catalog, loading, addQuestions, updateQuestion, deleteQuestion, bulkDeleteQuestions } = useGlobalCatalogQuestions();

  const [adminAuthed, setAdminAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [localAdminPassword, setLocalAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Track recently added signatures to avoid duplicate imports when the import action fires twice
  const recentlyAddedRef = useRef(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('satlog:adminSession') === 'yes';
    setAdminAuthed(saved);
    const lpw = localStorage.getItem('satlog:adminPassword') || '';
    setLocalAdminPassword(lpw);
  }, []);

  const adminPassword = import.meta?.env?.VITE_ADMIN_PASSWORD || import.meta?.env?.NEXT_PUBLIC_ADMIN_PASSWORD || '';
  const effectivePassword = adminPassword || localAdminPassword;

  // Advanced search filtering with Fuse.js - same as Question Selector
  const filteredCatalog = useMemo(() => {
    if (!searchTerm.trim()) return catalog || [];
    
    const searchLower = searchTerm.toLowerCase();
    const catalogArray = Array.isArray(catalog) ? catalog : [];

    // Special search: questions with no question type
    if (searchLower === 'no question type' || searchLower === 'no type' || searchLower === 'missing type') {
      return catalogArray.filter(q => !q.questionType || String(q.questionType).trim() === '');
    }
    
    // Special syntax for "con:" - find all questions with "con:" anywhere
    if (searchLower === 'con:') {
      return catalogArray.filter(question => {
        const questionText = (question.questionText || '').toLowerCase();
        const explanation = (question.explanation || '').toLowerCase();
        return questionText.includes('con:') || explanation.includes('con:');
      });
    }
    
    // Special syntax for "con:" followed by answer choice
    const conMatch = searchLower.match(/^con:\s*([abcd])$/i);
    if (conMatch) {
      const answerChoice = conMatch[1].toLowerCase();
      return catalogArray.filter(question => {
        const questionText = (question.questionText || '').toLowerCase();
        const explanation = (question.explanation || '').toLowerCase();
        return (questionText.includes(`con:${answerChoice}`) || questionText.includes(`con: ${answerChoice}`)) ||
               (explanation.includes(`con:${answerChoice}`) || explanation.includes(`con: ${answerChoice}`));
      });
    }
    
    // Single-letter correct answer search
    if (['A', 'B', 'C', 'D'].includes(searchLower.toUpperCase()) && searchLower.length === 1) {
      return catalogArray.filter(q => q.correctAnswer === searchLower.toUpperCase());
    }
    
    // Advanced fuzzy search with synonym mapping and comprehensive data coverage
    const synonymMap = {
      'english': 'Reading and Writing',
      'reading writing': 'Reading and Writing',
      'reading and writing': 'Reading and Writing',
      'reading & writing': 'Reading and Writing',
      'rw': 'Reading and Writing',
      'r/w': 'Reading and Writing',
      'maths': 'Math',
      'mathematics': 'Math',
      'mth': 'Math',
      'mths': 'Math'
    };
    
    const normalized = searchTerm.trim().toLowerCase();
    const mappedQuery = synonymMap[normalized] || searchTerm;
    
    const fuse = new Fuse(catalogArray, {
      includeScore: true,
      shouldSort: true,
      threshold: 0.4, // More lenient threshold for better fuzzy matching
      ignoreLocation: true,
      minMatchCharLength: 2,
      keys: [
        { name: 'section', weight: 0.1 },
        { name: 'domain', weight: 0.1 },
        { name: 'questionType', weight: 0.1 },
        { name: 'difficulty', weight: 0.05 },
        { name: 'correctAnswer', weight: 0.1 },
        { name: 'questionText', weight: 0.3 },
        { name: 'passageText', weight: 0.25 },
        { name: 'explanation', weight: 0.15 },
        { name: 'answerChoices.A', weight: 0.1 },
        { name: 'answerChoices.B', weight: 0.1 },
        { name: 'answerChoices.C', weight: 0.1 },
        { name: 'answerChoices.D', weight: 0.1 }
      ]
    });
    
    const fuseResults = fuse.search(mappedQuery);
    // More lenient filtering - include results with higher scores for better recall
    return fuseResults.filter(r => r.score !== undefined && r.score <= 0.6).map(r => r.item);
  }, [catalog, searchTerm]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!effectivePassword) {
      alert('No admin password configured yet. Set one below.');
      return;
    }
    if (passwordInput === effectivePassword) {
      localStorage.setItem('satlog:adminSession', 'yes');
      setAdminAuthed(true);
      setPasswordInput('');
    } else {
      alert('Invalid password');
    }
  };

  const saveLocalAdminPassword = (e) => {
    e.preventDefault();
    const pw = (newAdminPassword || '').trim();
    if (pw.length < 6) {
      alert('Please choose a password with at least 6 characters.');
      return;
    }
    localStorage.setItem('satlog:adminPassword', pw);
    setLocalAdminPassword(pw);
    setNewAdminPassword('');
    alert('Admin password saved locally for this browser. You can now log in.');
  };

  // Helpers reused from App's question handlers
  const isHiddenQuestion = (question) => {
    if (!question.section || !question.domain || !question.questionType) {
      return false;
    }
    const passageTextEmpty = !question.passageText || String(question.passageText).trim() === '';
    const passageImageEmpty = !question.passageImage;
    const questionTextEmpty = !question.questionText || String(question.questionText).trim() === '';
    const explanationEmpty = !question.explanation || String(question.explanation).trim() === '';
    const answerChoicesEmpty = !question.answerChoices ||
      Object.values(question.answerChoices).every(choice => !choice || String(choice).trim() === '');
    return passageTextEmpty && passageImageEmpty && questionTextEmpty && explanationEmpty && answerChoicesEmpty;
  };

  const catalogArray = Array.isArray(catalog) ? catalog : [];

  const handleAddCatalogQuestion = async (newQuestion) => {
    const incoming = Array.isArray(newQuestion) ? newQuestion : [newQuestion];

    const isSameQuestion = (a, b) => {
      const aIsHidden = isHiddenQuestion(a);
      const bIsHidden = isHiddenQuestion(b);
      if (aIsHidden && bIsHidden) return false;
      const basicFieldsMatch = (
        (a.section || '') === (b.section || '') &&
        (a.domain || '') === (b.domain || '') &&
        (a.questionType || '') === (b.questionType || '') &&
        (a.passageText || '') === (b.passageText || '') &&
        (a.questionText || '') === (b.questionText || '') &&
        (a.correctAnswer || '') === (b.correctAnswer || '') &&
        (a.explanation || '') === (b.explanation || '') &&
        (a.difficulty || '') === (b.difficulty || '') &&
        (a.passageImage || '') === (b.passageImage || '')
      );
      const aChoices = a.answerChoices || {};
      const bChoices = b.answerChoices || {};
      const answerChoicesMatch = (
        (aChoices.A || '') === (bChoices.A || '') &&
        (aChoices.B || '') === (bChoices.B || '') &&
        (aChoices.C || '') === (bChoices.C || '') &&
        (aChoices.D || '') === (bChoices.D || '')
      );
      return basicFieldsMatch && answerChoicesMatch;
    };

    // Deduplicate within the incoming batch by content, keeping first occurrence
    const dedupedIncoming = [];
    const seenSignatures = new Set();
    const signatureFor = (q) => JSON.stringify({
      section: (q.section||'').trim(),
      domain: (q.domain||'').trim(),
      questionType: (q.questionType||'').trim(),
      passageText: (q.passageText||'').trim(),
      questionText: (q.questionText||'').trim(),
      explanation: (q.explanation||'').trim(),
      difficulty: (q.difficulty||'').trim(),
      correctAnswer: (q.correctAnswer||'').trim(),
      A: (q.answerChoices?.A||'').trim(),
      B: (q.answerChoices?.B||'').trim(),
      C: (q.answerChoices?.C||'').trim(),
      D: (q.answerChoices?.D||'').trim(),
    });
    incoming.forEach(q => {
      const sig = signatureFor(q);
      // Skip if we've just added this signature recently to prevent double insertions
      if (recentlyAddedRef.current.has(sig)) return;
      if (!seenSignatures.has(sig) && !catalogArray.some(exQ => signatureFor(exQ) === sig)) {
        seenSignatures.add(sig);
        dedupedIncoming.push(q);
      }
    });

    if (dedupedIncoming.length === 0) {
      return; // Nothing new to add
    }

    const nowIso = new Date().toISOString();
    const questionsWithIds = dedupedIncoming.map((q, index) => ({
      ...q,
      id: `catalog-${Date.now()}-${Math.floor(Math.random() * 1000000)}-${index}`,
      origin: 'catalog',
      hidden: isHiddenQuestion(q),
      createdAt: nowIso,
      lastUpdated: nowIso,
    }));

    // Persist to global catalog (realtime will update local state)
    const ok = await addQuestions(questionsWithIds);
    if (!ok) {
      alert('Failed to add to catalog. Ensure DB table and permissions exist.');
      return;
    }

    // Mark signatures as recently added, and clear after a short delay
    questionsWithIds.forEach(q => {
      const sig = signatureFor(q);
      recentlyAddedRef.current.add(sig);
      setTimeout(() => {
        recentlyAddedRef.current.delete(sig);
      }, 30000); // 30s window to suppress accidental duplicate submissions
    });
  };

  const handleUpdateCatalogQuestion = async (questionId, updatedQuestion) => {
    const merged = { ...updatedQuestion, origin: 'catalog' };
    merged.hidden = isHiddenQuestion({ ...catalogArray.find(q=>q.id===questionId), ...merged });
    const ok = await updateQuestion(questionId, merged);
    if (!ok) alert('Failed to update catalog question.');
  };

  const handleDeleteCatalogQuestion = async (questionId) => {
    const ok = await deleteQuestion(questionId);
    if (!ok) alert('Failed to delete from catalog.');
  };

  const handleBulkDeleteCatalogQuestions = async (questionIds) => {
    const ok = await bulkDeleteQuestions(questionIds);
    if (!ok) alert('Failed to bulk delete from catalog.');
  };

  if (!adminAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-6">
        <div className="w-full max-w-lg grid grid-cols-1 gap-4">
          <form onSubmit={handleLogin} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Admin Login</h1>
            <input
              type="password"
              value={passwordInput}
              onChange={(e)=>setPasswordInput(e.target.value)}
              placeholder="Enter admin password"
              className="w-full mb-4 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium">Enter</button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Env password (VITE_ADMIN_PASSWORD) is {adminPassword ? 'configured' : 'not set'}. You can also set a local admin password below.</p>
          </form>

          {!adminPassword && (
            <form onSubmit={saveLocalAdminPassword} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Set Local Admin Password</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">This stores the admin password in this browser only. For team use, set VITE_ADMIN_PASSWORD in .env.local.</p>
              <input
                type="password"
                value={newAdminPassword}
                onChange={(e)=>setNewAdminPassword(e.target.value)}
                placeholder="New admin password"
                className="w-full mb-3 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button className="w-full py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium">Save Local Password</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <QuestionLogger
      questions={filteredCatalog}
      loading={loading}
      onAddQuestion={handleAddCatalogQuestion}
      onUpdateQuestion={handleUpdateCatalogQuestion}
      onDeleteQuestion={handleDeleteCatalogQuestion}
      onBulkDeleteQuestions={handleBulkDeleteCatalogQuestions}
      headerTitle={"Create Global Question"}
      headerSubtitle={"Changes here update the global catalog for all users"}
      listTitle={`Global Question Bank${searchTerm ? ` (${filteredCatalog?.length || 0} results)` : ''}`}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
    />
  );
};

export default AdminPage;

