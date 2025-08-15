-- Test All Backup Functions - Run this in your Supabase SQL Editor
-- This tests each function individually to make sure they work

-- ========================================
-- TEST 1: Create Restorable Backup Function
-- ========================================
SELECT '=== TESTING: Create Restorable Backup ===' as test;

-- Check current backup history count
SELECT 'Before creating backup:' as step, COUNT(*) as backup_count FROM public.backup_history;

-- Create a new restorable backup
SELECT 'Creating restorable backup...' as step;
SELECT public.snapshot_entire_backups_table_simple() as new_backup_id;

-- Check if backup was created successfully
SELECT 'After creating backup:' as step, COUNT(*) as backup_count FROM public.backup_history;

-- Show the latest backup details
SELECT 
  'Latest backup details:' as step,
  id,
  backup_time,
  row_count,
  octet_length(data::text)::bigint as data_bytes,
  (jsonb_typeof(data) = 'array') as is_array,
  (data->0 ? 'user_id') as has_user_id
FROM public.backup_history 
WHERE source_table = 'backups'
ORDER BY backup_time DESC 
LIMIT 1;

-- ========================================
-- TEST 2: Cleanup Old Backups Function
-- ========================================
SELECT '=== TESTING: Cleanup Old Backups ===' as test;

-- Check current backup history count
SELECT 'Before cleanup:' as step, COUNT(*) as backup_count FROM public.backup_history;

-- Show backups that would be deleted (older than 7 days)
SELECT 
  'Backups older than 7 days:' as step,
  id,
  backup_time,
  row_count
FROM public.backup_history 
WHERE backup_time < NOW() - INTERVAL '7 days'
ORDER BY backup_time;

-- Run cleanup function
SELECT 'Running cleanup...' as step;
SELECT public.prune_backup_history(168, 7) as deleted_count;

-- Check backup count after cleanup
SELECT 'After cleanup:' as step, COUNT(*) as backup_count FROM public.backup_history;

-- ========================================
-- TEST 3: Update Backups to Latest Data
-- ========================================
SELECT '=== TESTING: Update Backups Timestamp ===' as test;

-- Check current timestamp
SELECT 
  'Current backups timestamp:' as step,
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
ORDER BY updated_at DESC 
LIMIT 3;

-- Update the timestamp
SELECT 'Updating backups timestamp...' as step;
UPDATE public.backups SET updated_at = NOW();

-- Check updated timestamp
SELECT 
  'Updated backups timestamp:' as step,
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
ORDER BY updated_at DESC 
LIMIT 3;

-- ========================================
-- TEST 4: Verify Restore Function Works
-- ========================================
SELECT '=== TESTING: Restore Function ===' as test;

-- Get the latest backup ID
SELECT 'Latest backup ID:' as step, 
  (SELECT id FROM public.backup_history WHERE source_table = 'backups' ORDER BY backup_time DESC LIMIT 1) as backup_id;

-- Test restore (dry run - will rollback)
BEGIN;

SELECT 'Before restore:' as step, COUNT(*) as row_count FROM public.backups;

-- Restore from the latest backup
SELECT 'Restoring from latest backup...' as step;
SELECT public.restore_entire_backups_table(
  (SELECT id FROM public.backup_history WHERE source_table = 'backups' ORDER BY backup_time DESC LIMIT 1), 
  true
) as restore_result;

SELECT 'After restore:' as step, COUNT(*) as row_count FROM public.backups;

-- Rollback to keep original data
ROLLBACK;

SELECT 'Restore test completed (rolled back)' as step;

-- ========================================
-- FINAL SUMMARY
-- ========================================
SELECT '=== FINAL SUMMARY ===' as test;

-- Show all recent backups
SELECT 
  'Recent backup history:' as step,
  id,
  backup_time,
  row_count,
  octet_length(data::text)::bigint as data_bytes
FROM public.backup_history 
WHERE source_table = 'backups'
ORDER BY backup_time DESC 
LIMIT 5;

-- Show current backups status
SELECT 
  'Current backups status:' as step,
  COUNT(*) as total_backups,
  MAX(updated_at) as latest_update
FROM public.backups;

SELECT 'All tests completed!' as status;
