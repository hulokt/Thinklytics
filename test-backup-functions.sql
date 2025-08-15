-- Test script for backup functions
-- Run this in your Supabase SQL editor to test the functions

-- Test 1: Check if the rotate_backups_hourly function exists and works
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'rotate_backups_hourly' 
  AND routine_schema = 'public';

-- Test 2: Check if the rotate_all_backups_hourly_for_all_users function exists
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'rotate_all_backups_hourly_for_all_users' 
  AND routine_schema = 'public';

-- Test 3: Check if the rotate_backups_batch function exists
SELECT 
  routine_name, 
  routine_type, 
  data_type 
FROM information_schema.routines 
WHERE routine_name = 'rotate_backups_batch' 
  AND routine_schema = 'public';

-- Test 4: Count how many users have backups (to understand the scale)
SELECT 
  COUNT(DISTINCT user_id) as total_users_with_backups,
  COUNT(*) as total_backup_entries
FROM public.backups 
WHERE user_id IS NOT NULL;

-- Test 5: Test the batch function with a small batch (safe to run)
-- This will process only 2 users and show detailed results
SELECT * FROM public.rotate_backups_batch(2, 0);

-- Test 6: Check backup history to see if new entries were created
SELECT 
  source_table,
  COUNT(*) as backup_count,
  MAX(backup_time) as latest_backup
FROM public.backup_history 
WHERE backup_time > NOW() - INTERVAL '1 hour'
GROUP BY source_table
ORDER BY latest_backup DESC;

-- Test 7: Check the current backups table
SELECT 
  user_id,
  data_type,
  updated_at,
  jsonb_array_length(snapshot) as snapshot_size
FROM public.backups 
ORDER BY updated_at DESC
LIMIT 10;
