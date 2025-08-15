# Backup Timeout Fix

## Problem
The hourly backup function was timing out with the error:
```
Function responded with 500
canceling statement due to statement timeout
```

This was happening because the `rotate_all_backups_hourly_for_all_users` function was trying to process ALL users and ALL their data types in a single database operation, which exceeded the database timeout limit.

## Root Cause
1. The `rotate_backups_hourly` function was missing from the database schema
2. The backup function was processing too many users (50) at once
3. Each user had 5 different data types to backup, multiplying the workload
4. No error handling or fallback mechanisms

## Solution Implemented

### 1. Added Missing Function
Created the missing `rotate_backups_hourly` function that handles individual user/data type backups:

```sql
create or replace function public.rotate_backups_hourly(
  p_source_table text,
  p_user_id uuid,
  p_data_type text
)
returns boolean
```

### 2. Optimized Main Function
Updated `rotate_all_backups_hourly_for_all_users` to:
- Process only 10 users at a time (reduced from 50)
- Add better error handling for individual operations
- Add progress logging
- Return detailed results

### 3. Added Batch Processing Function
Created `rotate_backups_batch` function for processing users in configurable batches:

```sql
create or replace function public.rotate_backups_batch(
  p_batch_size integer default 10,
  p_offset integer default 0
)
returns table(user_id uuid, data_type text, success boolean, error_message text)
```

### 4. Enhanced Edge Function
Updated the hourly backup Edge Function to:
- Use the optimized main function
- Fall back to batch processing if main function fails
- Continue with snapshot and cleanup even if backup updates fail
- Provide detailed logging and error reporting

## Files Modified

1. **`SatLog/infra/volumes/db/init/03-backup_history.sql`**
   - Added `rotate_backups_hourly` function
   - Optimized `rotate_all_backups_hourly_for_all_users` function
   - Added `rotate_backups_batch` function

2. **`SatLog/supabase/functions/hourly-backup/index.ts`**
   - Enhanced error handling
   - Added fallback batch processing
   - Improved logging and response details

3. **`SatLog/test-backup-functions.sql`** (new)
   - Test script to verify functions work correctly

## Testing

Run the test script in your Supabase SQL editor:

```sql
-- Test the functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('rotate_backups_hourly', 'rotate_all_backups_hourly_for_all_users', 'rotate_backups_batch')
  AND routine_schema = 'public';

-- Test batch processing with small batch
SELECT * FROM public.rotate_backups_batch(2, 0);
```

## Deployment

1. Apply the SQL changes to your database:
   ```bash
   # Run the updated 03-backup_history.sql in your Supabase SQL editor
   ```

2. Deploy the updated Edge Function:
   ```bash
   supabase functions deploy hourly-backup
   ```

3. Test the function:
   ```bash
   curl -X POST "https://your-project.supabase.co/functions/v1/hourly-backup" \
     -H "Authorization: Bearer your-anon-key" \
     -H "Content-Type: application/json"
   ```

## Expected Results

- Hourly backups should complete without timeouts
- Better error handling and logging
- Fallback mechanisms ensure partial success
- Detailed response with operation counts and snapshot IDs

## Monitoring

Monitor the function logs in Supabase Dashboard:
- Function logs will show progress and any errors
- Response will include operation counts and success status
- Failed operations will be logged but won't stop the entire process
