import React, { useEffect, useState, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import QuestionLogger from './QuestionLogger';
import { useGlobalCatalogQuestions } from '../hooks/useCatalogGlobal';
import Fuse from 'fuse.js/dist/fuse.esm.js';
import { 
  Database, 
  History, 
  RotateCcw, 
  Download, 
  Upload, 
  Trash2, 
  Clock, 
  Users, 
  FileText, 
  Shield,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Archive,
  Settings
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('logger'); // 'logger' | 'backups'
  const [backups, setBackups] = useState([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [backupsError, setBackupsError] = useState('');
  const [backupSchedule, setBackupSchedule] = useState(null);
  // Track recently added signatures to avoid duplicate imports when the import action fires twice
  const recentlyAddedRef = useRef(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('satlog:adminSession') === 'yes';
    setAdminAuthed(saved);
    const lpw = localStorage.getItem('satlog:adminPassword') || '';
    setLocalAdminPassword(lpw);
  }, []);

  // Load backups and schedule when switching to the backups tab
  useEffect(() => {
    if (!adminAuthed) return;
    if (activeTab !== 'backups') return;
    let mounted = true;
    const load = async () => {
      setBackupsLoading(true);
      setBackupsError('');
      try {
        // Load backup history
        const { data, error } = await supabase
          .from('backup_history')
          .select('id, user_id, data_type, backup_time, row_count, checksum, source_table')
          .order('backup_time', { ascending: false });
        if (error) throw error;
        if (mounted) setBackups(Array.isArray(data) ? data : []);

        // Remove backup_schedule usage; not needed anymore
        if (mounted) setBackupSchedule(null);
      } catch (e) {
        if (mounted) setBackupsError(e?.message || 'Failed to load backups');
      } finally {
        if (mounted) setBackupsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [adminAuthed, activeTab]);

  const runBackupNow = async () => {
    try {
      setBackupsLoading(true);
      // Rotate all backups for all users; this copies current backups into history and refreshes backups from live
      const { error } = await supabase.rpc('rotate_all_backups_hourly_for_all_users');
      if (error) throw error;
      const { data: refreshed } = await supabase
        .from('backup_history')
        .select('id, user_id, data_type, backup_time, row_count, checksum')
        .order('backup_time', { ascending: false });
      setBackups(Array.isArray(refreshed) ? refreshed : []);
      alert('Rotation completed');
    } catch (e) {
      alert(`Rotation failed: ${e?.message || e}`);
    } finally {
      setBackupsLoading(false);
    }
  };

  const restoreFromBackup = async (backup) => {
    if (!backup?.id) return;
    if (!confirm('Restore this backup to replace current data? This will truncate the table before restore.')) return;
    try {
      setBackupsLoading(true);
      const { error } = await supabase.rpc('restore_from_backup_history', {
        p_backup_id: backup.id,
        p_user_id: backup.user_id || null,
        p_data_type: backup.data_type,
        p_target_table: null,
        p_truncate: true,
      });
      if (error) throw error;
      alert('Restore completed');
    } catch (e) {
      alert(`Restore failed: ${e?.message || e}`);
    } finally {
      setBackupsLoading(false);
    }
  };

  const pruneBackups = async () => {
    try {
      setBackupsLoading(true);
      const { data, error } = await supabase.rpc('prune_backup_history', {});
      if (error) throw error;
      const { data: refreshed } = await supabase
        .from('backup_history')
        .select('id, user_id, data_type, backup_time, row_count, checksum')
        .order('backup_time', { ascending: false });
      setBackups(Array.isArray(refreshed) ? refreshed : []);
      alert('Prune completed');
    } catch (e) {
      alert(`Prune failed: ${e?.message || e}`);
    } finally {
      setBackupsLoading(false);
    }
  };



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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-2 mb-4">
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${activeTab === 'logger' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
            onClick={() => setActiveTab('logger')}
          >
            Logger
          </button>
          <button
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${activeTab === 'backups' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'}`}
            onClick={() => setActiveTab('backups')}
          >
            Backup History
          </button>

        </div>

        {activeTab === 'logger' && (
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
        )}

        {activeTab === 'backups' && (
          <div className="space-y-6">
            {backupsError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{backupsError}</span>
              </div>
            )}
            
            {/* Backup System Overview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Backup System Overview</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    This system automatically creates hourly snapshots of all user data and the global catalog. 
                    Each backup preserves the complete state of your data, allowing you to restore to any point in time.
                    Backups are stored efficiently with deduplication and can be managed through the controls below.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">




              {/* Full Data Snapshot */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Create Restorable Backup</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Full data snapshot</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Creates a complete snapshot with all backup data. Slower but can be restored from. 
                  Use this when you need to restore your system.
                </p>
                <button 
                  onClick={async()=>{
                    try {
                      setBackupsLoading(true);
                      const { error } = await supabase.rpc('snapshot_entire_backups_table_simple');
                      if (error) throw error;
                      const { data: refreshed } = await supabase
                        .from('backup_history')
                        .select('id, user_id, data_type, backup_time, row_count, checksum, source_table')
                        .order('backup_time', { ascending: false });
                      setBackups(Array.isArray(refreshed) ? refreshed : []);
                      alert('Full data backup created successfully');
                    } catch(e) {
                      alert(`Full backup failed: ${e?.message || e}`);
                    } finally {
                      setBackupsLoading(false);
                    }
                  }} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  disabled={backupsLoading}
                >
                  {backupsLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      Create Restorable Backup
                    </>
                  )}
                </button>
              </div>

              {/* Cleanup Old Backups */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Cleanup Old Backups</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Remove outdated entries</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Removes old backup history entries while keeping recent hourly backups and daily snapshots. 
                  Helps manage storage efficiently.
                </p>
                <button 
                  onClick={pruneBackups} 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                  disabled={backupsLoading}
                >
                  {backupsLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Cleanup Old Backups
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Backup Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Backups</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{backups.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Latest Backup</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {backups[0] ? new Date(backups[0].backup_time).toLocaleDateString() : 'None'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Data Types</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Set(backups.map(b => b.data_type).filter(Boolean)).size}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Rows</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {backups.reduce((sum, b) => sum + (b.row_count || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Backup History */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Backup History</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        All backup snapshots with restore options
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                                         <button
                       onClick={async () => {
                         try {
                           setBackupsLoading(true);
                           const { data, error } = await supabase
                             .from('backup_history')
                             .select('id, user_id, data_type, backup_time, row_count, checksum, source_table')
                             .order('backup_time', { ascending: false });
                           if (error) throw error;
                           setBackups(Array.isArray(data) ? data : []);
                         } catch (e) {
                           console.error('Failed to reload backups:', e);
                           setBackupsError(e?.message || 'Failed to reload backups');
                         } finally {
                           setBackupsLoading(false);
                         }
                       }}
                       className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                       disabled={backupsLoading}
                     >
                       <RefreshCw className={`w-4 h-4 ${backupsLoading ? 'animate-spin' : ''}`} />
                     </button>
                  </div>
                </div>
              </div>
              
              <div className="max-h-[60vh] overflow-auto">
                {backups.length === 0 && !backupsLoading && (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Info className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Backups Yet</h4>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Create your first backup to start preserving your data history.
                    </p>
                                         <button
                       onClick={async()=>{
                         try {
                           setBackupsLoading(true);
                           const { error } = await supabase.rpc('snapshot_entire_backups_table');
                           if (error) throw error;
                           const { data: refreshed } = await supabase
                             .from('backup_history')
                             .select('id, user_id, data_type, backup_time, row_count, checksum, source_table')
                             .order('backup_time', { ascending: false });
                           setBackups(Array.isArray(refreshed) ? refreshed : []);
                           alert('First backup created successfully');
                         } catch(e) {
                           alert(`Backup failed: ${e?.message || e}`);
                         } finally {
                           setBackupsLoading(false);
                         }
                       }}
                       className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                     >
                       Create First Backup
                     </button>
                  </div>
                )}
                
                                 {backups.map((backup, index) => (
                   <div key={backup.id} className={`p-6 ${index !== backups.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200`}>
                     <div className="space-y-4">
                       {/* Header with icon and title */}
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                             backup.source_table === 'backups' 
                               ? 'bg-purple-100 dark:bg-purple-900' 
                               : backup.data_type === 'catalog_questions_table'
                               ? 'bg-green-100 dark:bg-green-900'
                               : backup.data_type === 'user_questions'
                               ? 'bg-blue-100 dark:bg-blue-900'
                               : 'bg-orange-100 dark:bg-orange-900'
                           }`}>
                             {(() => {
                               if (backup.source_table === 'backups') {
                                 return <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
                               }
                               if (backup.data_type === 'catalog_questions_table') {
                                 return <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />;
                               }
                               if (backup.data_type === 'user_questions') {
                                 return <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
                               }
                               return <Archive className="w-6 h-6 text-orange-600 dark:text-orange-400" />;
                             })()}
                           </div>
                           <div>
                             <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                               {(() => {
                                 if (backup.source_table === 'backups') {
                                   return 'Backups Table Snapshot';
                                 }
                                 if (backup.data_type === 'catalog_questions_table') {
                                   return 'Global Catalog Questions';
                                 }
                                 if (backup.data_type === 'user_questions') {
                                   return 'User Questions';
                                 }
                                 if (backup.data_type === 'sat_master_log_all_quizzes') {
                                   return 'All Quiz Results';
                                 }
                                 if (backup.data_type === 'sat_master_log_calendar_events') {
                                   return 'Calendar Events';
                                 }
                                 if (backup.data_type === 'sat_master_log_question_answers') {
                                   return 'Question Answers';
                                 }
                                 if (backup.data_type === 'sat_master_log_catalog_questions') {
                                   return 'Catalog Question Logs';
                                 }
                                 if (backup.data_type) {
                                   return backup.data_type;
                                 }
                                 return 'Backups Table Snapshot';
                               })()}
                             </h4>
                             <p className="text-sm text-gray-500 dark:text-gray-400">
                               {new Date(backup.backup_time).toLocaleString('en-US', {
                                 year: 'numeric',
                                 month: 'long',
                                 day: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit',
                                 second: '2-digit'
                               })}
                             </p>
                           </div>
                         </div>
                         
                                                <div className="flex items-center gap-2">
                         {backup.source_table === 'backups' ? (
                           <button
                             onClick={async()=>{
                               if (!confirm('This will restore the entire backups table to this exact state. Continue?')) return;
                               try {
                                 setBackupsLoading(true);
                                 const { error } = await supabase.rpc('restore_entire_backups_table', { 
                                   p_history_id: backup.id, 
                                   p_truncate: true 
                                 });
                                 if (error) throw error;
                                 alert('Backups table restored successfully');
                               } catch(e) {
                                 alert(`Restore failed: ${e?.message || e}`);
                               } finally {
                                 setBackupsLoading(false);
                               }
                             }}
                             className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                             disabled={backupsLoading}
                           >
                             {backupsLoading ? (
                               <>
                                 <RefreshCw className="w-4 h-4 animate-spin" />
                                 Restoring...
                               </>
                             ) : (
                               <>
                                 <Upload className="w-4 h-4" />
                                 Restore System
                               </>
                             )}
                           </button>
                         ) : (
                           <button
                             onClick={() => restoreFromBackup(backup)}
                             className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                             disabled={backupsLoading}
                           >
                             {backupsLoading ? (
                               <>
                                 <RefreshCw className="w-4 h-4 animate-spin" />
                                 Restoring...
                               </>
                             ) : (
                               <>
                                 <Upload className="w-4 h-4" />
                                 Restore Data
                               </>
                             )}
                           </button>
                         )}
                         
                         <button
                           onClick={async()=>{
                             if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) return;
                             try {
                               setBackupsLoading(true);
                               const { error } = await supabase.rpc('delete_backup_from_history', { 
                                 p_backup_id: backup.id
                               });
                               if (error) throw error;
                               // Refresh the backup list
                               const { data: refreshed } = await supabase
                                 .from('backup_history')
                                 .select('id, user_id, data_type, backup_time, row_count, checksum, source_table')
                                 .order('backup_time', { ascending: false });
                               setBackups(Array.isArray(refreshed) ? refreshed : []);
                               alert('Backup deleted successfully');
                             } catch(e) {
                               alert(`Delete failed: ${e?.message || e}`);
                             } finally {
                               setBackupsLoading(false);
                             }
                           }}
                           className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                           disabled={backupsLoading}
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                       </div>

                       {/* Detailed Information Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                           <div className="flex items-center gap-2 mb-1">
                             <Database className="w-4 h-4 text-gray-500" />
                             <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Source Table</span>
                           </div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white">
                             {backup.source_table || 'backups'}
                           </p>
                         </div>

                         <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                           <div className="flex items-center gap-2 mb-1">
                             <Users className="w-4 h-4 text-gray-500" />
                             <span className="text-xs font-medium text-gray-500 dark:text-gray-400">User ID</span>
                           </div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white">
                             {backup.user_id ? (
                               <span className="font-mono text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                                 {backup.user_id.slice(0, 8)}...
                               </span>
                             ) : (
                               <span className="text-gray-500">System-wide</span>
                             )}
                           </p>
                         </div>

                         <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                           <div className="flex items-center gap-2 mb-1">
                             <FileText className="w-4 h-4 text-gray-500" />
                             <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Data Rows</span>
                           </div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white">
                             {backup.row_count?.toLocaleString() || '0'} rows
                           </p>
                         </div>

                         <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                           <div className="flex items-center gap-2 mb-1">
                             <Shield className="w-4 h-4 text-gray-500" />
                             <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Checksum</span>
                           </div>
                           <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono">
                             {String(backup.checksum).slice(0, 12)}...
                           </p>
                         </div>
                       </div>

                       {/* Additional Metadata */}
                       <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                         <div className="flex items-center gap-2 mb-2">
                           <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                           <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Backup Details</span>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                           <div>
                             <span className="text-blue-700 dark:text-blue-300 font-medium">Backup ID:</span>
                             <span className="ml-2 font-mono text-blue-900 dark:text-blue-100">
                               {backup.id.slice(0, 8)}...
                             </span>
                           </div>
                           <div>
                             <span className="text-blue-700 dark:text-blue-300 font-medium">Age:</span>
                             <span className="ml-2 text-blue-900 dark:text-blue-100">
                               {(() => {
                                 const age = Date.now() - new Date(backup.backup_time).getTime();
                                 const hours = Math.floor(age / (1000 * 60 * 60));
                                 const days = Math.floor(hours / 24);
                                 if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                                 if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                                 return 'Less than 1 hour ago';
                               })()}
                             </span>
                           </div>
                           <div>
                             <span className="text-blue-700 dark:text-blue-300 font-medium">Type:</span>
                             <span className="ml-2 text-blue-900 dark:text-blue-100">
                               {backup.source_table === 'backups' ? 'Full System' : 'Data Type'}
                             </span>
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;

