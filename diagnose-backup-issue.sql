-- Diagnose Backup Issue
-- Let's find out why the function is only returning 1

-- Step 1: Check what users exist
SELECT 'STEP 1: Users in backups table' as step;
SELECT DISTINCT user_id FROM public.backups WHERE user_id IS NOT NULL ORDER BY user_id;

-- Step 2: Check if we have admin users
SELECT 'STEP 2: Admin users' as step;
SELECT user_id FROM public.admins LIMIT 5;

-- Step 3: Test the query that the function uses to find users
SELECT 'STEP 3: Users found by function query' as step;
SELECT DISTINCT user_id FROM public.backups WHERE user_id IS NOT NULL ORDER BY user_id;

-- Step 4: Test individual backup function for first user
SELECT 'STEP 4: Testing individual backup function' as step;
SELECT public.rotate_backups_hourly('user_questions', '6aab6383-6414-4cf9-b1e7-984f9ad34c56', 'user_questions') as result;

-- Step 5: Check if that backup was updated
SELECT 'STEP 5: Checking if backup was updated' as step;
SELECT 
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
WHERE user_id = '6aab6383-6414-4cf9-b1e7-984f9ad34c56' 
  AND data_type = 'user_questions';

-- Step 6: Test individual backup function for second user
SELECT 'STEP 6: Testing individual backup function for second user' as step;
SELECT public.rotate_backups_hourly('user_questions', '90937b78-cd99-4286-afa9-a2fe494bd67f', 'user_questions') as result;

-- Step 7: Check if second user backup was updated
SELECT 'STEP 7: Checking if second user backup was updated' as step;
SELECT 
  user_id,
  data_type,
  updated_at,
  EXTRACT(EPOCH FROM (NOW() - updated_at))/60 as minutes_since_update
FROM public.backups 
WHERE user_id = '90937b78-cd99-4286-afa9-a2fe494bd67f' 
  AND data_type = 'user_questions';
