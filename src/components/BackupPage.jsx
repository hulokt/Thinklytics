import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
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
  Archive
} from 'lucide-react';

const BackupPage = () => {
  const [backups, setBackups] = useState([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [backupsError, setBackupsError] = useState('');

  // Load backups when component mounts
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setBackupsLoading(true);
      setBackupsError('');
      try {
        const { data, error } = await supabase
          .from('backup_history')
          .select('id, user_id, data_type, backup_time, row_count, checksum, source_table')
          .order('backup_time', { ascending: false })
          .limit(500);
        if (error) throw error;
        if (mounted) setBackups(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setBackupsError(e?.message || 'Failed to load backups');
      } finally {
        if (mounted) setBackupsLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const runBackupNow = useCallback(async () => {
    try {
      setBackupsLoading(true);
      const { error } = await supabase.rpc('rotate_backups_batch', { p_batch_size: 5, p_offset: 0 });
      if (error) throw error;
      const { data: refreshed } = await supabase
        .from('backup_history')
        .select('id, user_id, data_type, backup_time, row_count, checksum')
        .order('backup_time', { ascending: false })
        .limit(500);
      setBackups(Array.isArray(refreshed) ? refreshed : []);
      alert('Rotation completed');
    } catch (e) {
      alert(`Rotation failed: ${e?.message || e}`);
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  const restoreFromBackup = useCallback(async (backup) => {
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
  }, []);

  const pruneBackups = useCallback(async () => {
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
  }, []);

  const rebuildBackupsAllUsers = useCallback(async () => {
    if (!confirm('This will replace the entire backups table with fresh snapshots for admin users only. Continue?')) return;
    try {
      setBackupsLoading(true);
      const { data, error } = await supabase.rpc('rebuild_backups_simple');
      if (error) throw error;
      alert(data || 'Backups table rebuilt successfully for admin users');
    } catch (e) {
      alert(`Rebuild failed: ${e?.message || e}`);
    } finally {
      setBackupsLoading(false);
    }
  }, []);

  const createRestorableBackup = useCallback(async () => {
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
  }, []);



  return (
    <div className="h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto p-8">
          {backupsError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center gap-2 mb-8">
              <AlertCircle className="w-5 h-5" />
              <span>{backupsError}</span>
            </div>
          )}
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backup System</h1>
                <p className="text-gray-600 dark:text-gray-300">Manage and monitor your data backups</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-3xl">
              This system automatically creates hourly snapshots of all user data and the global catalog. 
              Each backup preserves the complete state of your data, allowing you to restore to any point in time.
            </p>
          </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Create Backup */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Create Backup</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Full system snapshot</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Creates a complete snapshot with all backup data. Use this when you need to restore your system.
            </p>
            <button 
              onClick={createRestorableBackup}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl" 
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
                  Create Backup
                </>
              )}
            </button>
          </div>

          {/* Cleanup Backups */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Cleanup</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Remove old backups</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Removes old backup history entries while keeping recent backups. Helps manage storage efficiently.
            </p>
            <button 
              onClick={pruneBackups} 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl" 
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
                  Cleanup
                </>
              )}
            </button>
          </div>

          {/* Rebuild Backups */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">Rebuild</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fresh snapshots</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Creates fresh snapshots for all users and replaces the entire backups table.
            </p>
            <button 
              onClick={rebuildBackupsAllUsers}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl" 
              disabled={backupsLoading}
            >
              {backupsLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Rebuilding...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Rebuild
                </>
              )}
            </button>
          </div>
        </div>

        {/* Backup Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{backups.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Latest Backup</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {backups[0] ? new Date(backups[0].backup_time).toLocaleDateString() : 'None'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Data Types</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(backups.map(b => b.data_type).filter(Boolean)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {backups.reduce((sum, b) => sum + (b.row_count || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backup History */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                <History className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Backup History</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  All backup snapshots with restore options
                </p>
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
                        .order('backup_time', { ascending: false })
                        .limit(500);
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
              <div key={backup.id} className={`p-4 ${index !== backups.length - 1 ? 'border-b border-slate-200 dark:border-slate-700' : ''} hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300`}>
                <div className="space-y-4">
                  {/* Header with icon and title */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-md ${
                        backup.source_table === 'backups' 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-600' 
                          : backup.data_type === 'catalog_questions_table'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : backup.data_type === 'user_questions'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          : 'bg-gradient-to-br from-orange-500 to-red-600'
                      }`}>
                        {(() => {
                          if (backup.source_table === 'backups') {
                            return <Database className="w-5 h-5 text-white" />;
                          }
                          if (backup.data_type === 'catalog_questions_table') {
                            return <FileText className="w-5 h-5 text-white" />;
                          }
                          if (backup.data_type === 'user_questions') {
                            return <Users className="w-5 h-5 text-white" />;
                          }
                          return <Archive className="w-5 h-5 text-white" />;
                        })()}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900 dark:text-white">
                          {(() => {
                            if (backup.source_table === 'backups') {
                              return 'System Snapshot';
                            }
                            if (backup.data_type === 'catalog_questions_table') {
                              return 'Global Catalog';
                            }
                            if (backup.data_type === 'user_questions') {
                              return 'User Questions';
                            }
                            if (backup.data_type === 'sat_master_log_all_quizzes') {
                              return 'Quiz Results';
                            }
                            if (backup.data_type === 'sat_master_log_calendar_events') {
                              return 'Calendar Events';
                            }
                            if (backup.data_type === 'sat_master_log_question_answers') {
                              return 'Question Answers';
                            }
                            if (backup.data_type === 'sat_master_log_catalog_questions') {
                              return 'Catalog Logs';
                            }
                            if (backup.data_type) {
                              return backup.data_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                            }
                            return 'System Snapshot';
                          })()}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(backup.backup_time).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
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
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
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
                          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
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
                              .order('backup_time', { ascending: false })
                              .limit(500);
                            setBackups(Array.isArray(refreshed) ? refreshed : []);
                            alert('Backup deleted successfully');
                          } catch(e) {
                            alert(`Delete failed: ${e?.message || e}`);
                          } finally {
                            setBackupsLoading(false);
                          }
                        }}
                        className="p-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 shadow-lg hover:shadow-xl"
                        disabled={backupsLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Detailed Information Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Database className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Source</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {backup.source_table || 'backups'}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {backup.user_id ? (
                          <span className="font-mono text-xs bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">
                            {backup.user_id.slice(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-slate-500">System-wide</span>
                        )}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rows</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {backup.row_count?.toLocaleString() || '0'}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-3 h-3 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Checksum</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                        {String(backup.checksum).slice(0, 12)}...
                      </p>
                    </div>
                  </div>

                  {/* Additional Metadata */}
                  <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4">
                        <span className="text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">ID:</span> {backup.id}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Age:</span> {(() => {
                            const age = Date.now() - new Date(backup.backup_time).getTime();
                            const hours = Math.floor(age / (1000 * 60 * 60));
                            const days = Math.floor(hours / 24);
                            if (days > 0) return `${days}d ago`;
                            if (hours > 0) return `${hours}h ago`;
                            return '<1h ago';
                          })()}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Type:</span> {backup.source_table === 'backups' ? 'System' : 'Data'}
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
    </div>
    </div>
  );
};

export default BackupPage;
