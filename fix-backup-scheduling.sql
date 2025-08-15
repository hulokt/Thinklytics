-- Fix Backup Scheduling Issue
-- The current function only processes 10 users per hour, but we need to process ALL users

-- Option 1: Remove the limit to process all users (might timeout with many users)
create or replace function public.rotate_all_backups_hourly_for_all_users()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ran integer := 0;
  r record;
  admin_id uuid;
  user_count integer := 0;
begin
  -- Get admin user for global catalog
  select a.user_id into admin_id from public.admins a limit 1;
  
  -- Update global catalog backup first
  if admin_id is not null then
    begin
      perform public.rotate_backups_hourly('catalog_questions', admin_id, 'catalog_questions_table');
      ran := ran + 1;
      raise notice 'Updated catalog backup for admin user %', admin_id;
    exception when others then
      raise notice 'Failed to update catalog backup: %', sqlerrm;
    end;
  end if;

  -- Update backups for ALL users (removed the limit)
  for r in (
    select distinct user_id from public.backups
    where user_id is not null
    order by user_id  -- Process in consistent order
  ) loop
    begin
      -- Update each user's data backups one by one with error handling
      if public.rotate_backups_hourly('user_questions', r.user_id, 'user_questions') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_all_quizzes', r.user_id, 'sat_master_log_all_quizzes') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_calendar_events', r.user_id, 'sat_master_log_calendar_events') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_question_answers', r.user_id, 'sat_master_log_question_answers') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_catalog_questions', r.user_id, 'sat_master_log_catalog_questions') then
        ran := ran + 1;
      end if;
      
      user_count := user_count + 1;
      
      -- Log progress every 10 users
      if user_count % 10 = 0 then
        raise notice 'Processed % users so far', user_count;
      end if;
      
    exception when others then
      raise notice 'Failed to update backups for user %: %', r.user_id, sqlerrm;
      -- Continue with next user
    end;
  end loop;

  raise notice 'Completed backup rotation for % users', user_count;
  return ran;
end;
$$;

grant execute on function public.rotate_all_backups_hourly_for_all_users() to authenticated;

-- Option 2: Create a function that processes users in rotation (alternative approach)
-- This processes different users each hour to ensure all users get updated eventually
create or replace function public.rotate_backups_hourly_rotation()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ran integer := 0;
  r record;
  admin_id uuid;
  user_count integer := 0;
  batch_size integer := 20; -- Process 20 users per hour
  current_hour integer;
  offset_users integer;
begin
  -- Calculate which batch of users to process this hour
  current_hour := extract(hour from now());
  offset_users := (current_hour * batch_size) % (
    select count(distinct user_id) from public.backups where user_id is not null
  );
  
  -- Get admin user for global catalog
  select a.user_id into admin_id from public.admins a limit 1;
  
  -- Update global catalog backup first
  if admin_id is not null then
    begin
      perform public.rotate_backups_hourly('catalog_questions', admin_id, 'catalog_questions_table');
      ran := ran + 1;
      raise notice 'Updated catalog backup for admin user %', admin_id;
    exception when others then
      raise notice 'Failed to update catalog backup: %', sqlerrm;
    end;
  end if;

  -- Update backups for a rotating batch of users
  for r in (
    select distinct user_id from public.backups
    where user_id is not null
    order by user_id
    limit batch_size
    offset offset_users
  ) loop
    begin
      -- Update each user's data backups one by one with error handling
      if public.rotate_backups_hourly('user_questions', r.user_id, 'user_questions') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_all_quizzes', r.user_id, 'sat_master_log_all_quizzes') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_calendar_events', r.user_id, 'sat_master_log_calendar_events') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_question_answers', r.user_id, 'sat_master_log_question_answers') then
        ran := ran + 1;
      end if;
      
      if public.rotate_backups_hourly('sat_master_log_catalog_questions', r.user_id, 'sat_master_log_catalog_questions') then
        ran := ran + 1;
      end if;
      
      user_count := user_count + 1;
      
    exception when others then
      raise notice 'Failed to update backups for user %: %', r.user_id, sqlerrm;
      -- Continue with next user
    end;
  end loop;

  raise notice 'Completed backup rotation for % users (hour %: offset %)', user_count, current_hour, offset_users;
  return ran;
end;
$$;

grant execute on function public.rotate_backups_hourly_rotation() to authenticated;

-- Test the functions
SELECT 'Functions updated successfully!' as status;

-- Check how many total users we have
SELECT 
  COUNT(DISTINCT user_id) as total_users,
  COUNT(*) as total_backup_entries
FROM public.backups 
WHERE user_id IS NOT NULL;
