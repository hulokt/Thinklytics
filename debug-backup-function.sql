-- Debug Backup Function
-- Let's test each part separately to see what's working

-- 1. Check if we have an admin user
SELECT 'Admin users:' as info;
SELECT user_id FROM public.admins LIMIT 5;

-- 2. Check what users exist in backups table
SELECT 'Users in backups table:' as info;
SELECT DISTINCT user_id FROM public.backups WHERE user_id IS NOT NULL ORDER BY user_id;

-- 3. Test the individual rotate_backups_hourly function for one user
SELECT 'Testing individual backup function:' as info;
-- Replace '6aab6383-6414-4cf9-b1e7-984f9ad34c56' with an actual user_id from step 2
SELECT public.rotate_backups_hourly('user_questions', '6aab6383-6414-4cf9-b1e7-984f9ad34c56', 'user_questions') as test_result;

-- 4. Check if the backup was updated
SELECT 'Checking if backup was updated:' as info;
SELECT 
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
WHERE user_id = '6aab6383-6414-4cf9-b1e7-984f9ad34c56' 
  AND data_type = 'user_questions';

-- 5. Test the main function with more detailed logging
SELECT 'Testing main function with detailed logging:' as info;
-- This will show us exactly what's happening
SELECT public.rotate_all_backups_hourly_for_all_users() as operations_count;

-- 6. Check final results
SELECT 'Final backup status:' as info;
SELECT 
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
ORDER BY updated_at DESC;
