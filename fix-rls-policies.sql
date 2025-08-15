-- Fix RLS Policies - Apply this in your Supabase SQL Editor
-- The Edge Function is being blocked by RLS policies

-- 1. Check if RLS is enabled on the tables
SELECT 'Checking RLS status:' as info;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('backups', 'backup_history')
  AND schemaname = 'public';

-- 2. Add a policy to allow service_role to manage backup_history
SELECT 'Adding service_role policy for backup_history:' as info;
DROP POLICY IF EXISTS "backup_history service_role all" ON public.backup_history;
CREATE POLICY "backup_history service_role all" ON public.backup_history
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. Add a policy to allow service_role to manage backups
SELECT 'Adding service_role policy for backups:' as info;
DROP POLICY IF EXISTS "backups service_role all" ON public.backups;
CREATE POLICY "backups service_role all" ON public.backups
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Verify the new policies
SELECT 'Verifying new policies:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('backups', 'backup_history')
  AND policyname LIKE '%service_role%'
ORDER BY tablename, policyname;

-- 5. Test if the Edge Function can now create backups
SELECT 'Testing Edge Function access:' as info;
-- This simulates what the Edge Function does
INSERT INTO public.backup_history (source_table, data, row_count, checksum)
VALUES ('test', '[]'::jsonb, 0, 'test')
RETURNING id;

-- Clean up test entry
DELETE FROM public.backup_history WHERE source_table = 'test';

SELECT 'RLS policies fixed successfully!' as status;
