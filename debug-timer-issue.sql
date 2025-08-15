-- Debug Timer Issue - Run this in your Supabase SQL Editor
-- Let's check what's happening with the backups table and timer

-- 1. Check current state of backups table
SELECT 'Current backups table state:' as info;
SELECT 
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
ORDER BY updated_at DESC
LIMIT 10;

-- 2. Check if backup_history has recent entries
SELECT 'Recent backup history entries:' as info;
SELECT 
  id,
  source_table,
  backup_time,
  row_count
FROM public.backup_history 
WHERE backup_time > NOW() - INTERVAL '1 hour'
ORDER BY backup_time DESC
LIMIT 5;

-- 3. Test the snapshot function directly
SELECT 'Testing snapshot function:' as info;
SELECT public.snapshot_entire_backups_table_simple() as new_backup_id;

-- 4. Check if backups table was updated after snapshot
SELECT 'Backups table after snapshot:' as info;
SELECT 
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
ORDER BY updated_at DESC
LIMIT 5;

-- 5. Manually update the backups table timestamp
SELECT 'Manually updating backups timestamp...' as info;
UPDATE public.backups SET updated_at = NOW();

-- 6. Check final state
SELECT 'Final backups table state:' as info;
SELECT 
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
ORDER BY updated_at DESC
LIMIT 5;
