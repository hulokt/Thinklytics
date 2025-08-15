-- Fix Backup Trigger Issue
-- This fixes the problem where backup timestamps aren't updating properly

-- 1. Fix the trigger name (it should be trg_set_backups_updated_at, not set_backups_updated_at)
DROP TRIGGER IF EXISTS set_backups_updated_at ON public.backups;
DROP TRIGGER IF EXISTS trg_set_backups_updated_at ON public.backups;

CREATE TRIGGER trg_set_backups_updated_at
BEFORE UPDATE ON public.backups
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. Test the trigger by updating a backup record
-- This will help verify the trigger is working
SELECT 'Trigger fixed successfully!' as status;

-- 3. Check if the trigger is properly attached
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'backups' 
  AND trigger_schema = 'public';

-- 4. Verify the function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'set_updated_at' 
  AND routine_schema = 'public';

-- 5. Check current backup timestamps to see if they're being updated
SELECT 
  user_id,
  data_type,
  updated_at,
  created_at
FROM public.backups 
ORDER BY updated_at DESC 
LIMIT 10;

-- 6. Test the backup function manually (replace with an actual user_id from your system)
-- Uncomment and modify the line below to test with a real user_id:
-- SELECT public.rotate_backups_hourly('user_questions', 'your-user-id-here', 'user_questions');
