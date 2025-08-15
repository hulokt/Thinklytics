-- Check Backup Status - Run this in your Supabase SQL Editor
-- Let's see what's actually happening with backups and history

-- 1. Check when backups table was last updated (more accurate)
SELECT 'Backups table last updated:' as info;
SELECT 
  user_id,
  data_type,
  updated_at,
  NOW() as current_time,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
ORDER BY updated_at DESC
LIMIT 5;

-- 2. Check if backup_history has ANY recent entries
SELECT 'All backup history entries (last 24 hours):' as info;
SELECT 
  id,
  source_table,
  backup_time,
  row_count,
  NOW() as current_time,
  EXTRACT(EPOCH FROM (NOW() - backup_time))/60 as minutes_since_backup
FROM public.backup_history 
WHERE backup_time > NOW() - INTERVAL '24 hours'
ORDER BY backup_time DESC
LIMIT 10;

-- 3. Check total count of backup history
SELECT 'Total backup history count:' as info;
SELECT COUNT(*) as total_backups FROM public.backup_history;

-- 4. Test if the snapshot function works manually
SELECT 'Testing snapshot function manually:' as info;
SELECT public.snapshot_entire_backups_table_simple() as new_backup_id;

-- 5. Check if a new backup was created
SELECT 'Checking for new backup after manual test:' as info;
SELECT 
  id,
  source_table,
  backup_time,
  row_count
FROM public.backup_history 
WHERE backup_time > NOW() - INTERVAL '5 minutes'
ORDER BY backup_time DESC
LIMIT 3;

-- 6. Check if Edge Function has proper permissions
SELECT 'Checking RLS policies:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('backups', 'backup_history')
ORDER BY tablename, policyname;
