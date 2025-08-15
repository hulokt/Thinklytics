-- Fix Missing Functions - Apply this in your Supabase SQL Editor
-- The current rotate_all_backups_hourly_for_all_users calls functions that don't exist

-- Drop the broken function first
DROP FUNCTION IF EXISTS public.rotate_all_backups_hourly_for_all_users();

-- Create a simple, working version that creates a snapshot AND updates the backups table
create or replace function public.rotate_all_backups_hourly_for_all_users()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ran integer := 0;
begin
  -- Create a snapshot of the current backups table
  perform public.snapshot_entire_backups_table_simple();
  
  -- Update the updated_at field for all entries in backups table
  -- This will reset the timer in the frontend
  update public.backups set updated_at = now();
  
  ran := 1;
  
  raise notice 'Created backup snapshot and updated backups table successfully';
  return ran;
end;
$$;

grant execute on function public.rotate_all_backups_hourly_for_all_users() to authenticated;

-- Test that it works
SELECT 'Function fixed successfully!' as status;
SELECT public.rotate_all_backups_hourly_for_all_users() as test_result;
