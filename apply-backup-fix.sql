-- Backup Timeout Fix - Apply this in your Supabase SQL Editor
-- This adds the missing functions and optimizes the backup process

-- First, drop any existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.rotate_backups_hourly(text, uuid, text);
DROP FUNCTION IF EXISTS public.rotate_all_backups_hourly_for_all_users();
DROP FUNCTION IF EXISTS public.rotate_backups_batch(integer, integer);

-- 1. Add the missing rotate_backups_hourly function
create or replace function public.rotate_backups_hourly(
  p_source_table text,
  p_user_id uuid,
  p_data_type text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_data jsonb;
  row_count integer;
  checksum text;
  backup_id uuid;
begin
  -- Get current data from the source table
  if p_data_type = 'user_questions' then
    select coalesce(jsonb_agg(to_jsonb(uq)), '[]'::jsonb), count(*)
    into current_data, row_count
    from public.user_questions uq
    where uq.user_id = p_user_id;
  elsif p_data_type = 'catalog_questions_table' then
    select coalesce(jsonb_agg(to_jsonb(cq)), '[]'::jsonb), count(*)
    into current_data, row_count
    from public.catalog_questions cq;
  else
    -- For other data types, get from user_data table
    select coalesce(data, '[]'::jsonb), 1
    into current_data, row_count
    from public.user_data ud
    where ud.user_id = p_user_id and ud.data_type = p_data_type;
  end if;

  -- Compute checksum
  checksum := encode(digest(coalesce(current_data::text, ''), 'sha256'::text), 'hex');

  -- Insert into backup history
  insert into public.backup_history (source_table, user_id, data_type, data, row_count, checksum)
  values (p_source_table, p_user_id, p_data_type, current_data, coalesce(row_count, 0), checksum)
  returning id into backup_id;

  -- Update or insert into backups table
  insert into public.backups (user_id, data_type, snapshot, updated_at)
  values (p_user_id, p_data_type, current_data, now())
  on conflict (user_id, data_type) do update set
    snapshot = excluded.snapshot,
    updated_at = now();

  return true;
exception when others then
  raise notice 'Failed to rotate backup for user % data_type %: %', p_user_id, p_data_type, sqlerrm;
  return false;
end;
$$;

grant execute on function public.rotate_backups_hourly(text, uuid, text) to authenticated;

-- 2. Optimize the main backup function
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
  batch_size integer := 10; -- Process only 10 users at a time to avoid timeouts
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

  -- Update backups for each user in smaller batches to avoid timeouts
  for r in (
    select distinct user_id from public.backups
    where user_id is not null
    limit batch_size  -- Process only batch_size users to avoid timeout
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
      
      -- Log progress every 5 users
      if user_count % 5 = 0 then
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

-- 3. Add batch processing function for fallback
create or replace function public.rotate_backups_batch(
  p_batch_size integer default 10,
  p_offset integer default 0
)
returns table(user_id uuid, data_type text, success boolean, error_message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  admin_id uuid;
  success boolean;
  error_msg text;
begin
  -- Get admin user for global catalog
  select a.user_id into admin_id from public.admins a limit 1;
  
  -- Update global catalog backup first (only on first batch)
  if p_offset = 0 and admin_id is not null then
    begin
      success := public.rotate_backups_hourly('catalog_questions', admin_id, 'catalog_questions_table');
      if success then
        user_id := admin_id;
        data_type := 'catalog_questions_table';
        success := true;
        error_message := null;
        return next;
      end if;
    exception when others then
      user_id := admin_id;
      data_type := 'catalog_questions_table';
      success := false;
      error_message := sqlerrm;
      return next;
    end;
  end if;

  -- Update backups for each user in the batch
  for r in (
    select distinct user_id from public.backups
    where user_id is not null
    order by user_id
    limit p_batch_size
    offset p_offset
  ) loop
    -- Process each data type for this user
    for data_type in values 
      ('user_questions'),
      ('sat_master_log_all_quizzes'),
      ('sat_master_log_calendar_events'),
      ('sat_master_log_question_answers'),
      ('sat_master_log_catalog_questions')
    loop
      begin
        success := public.rotate_backups_hourly(data_type, r.user_id, data_type);
        error_msg := null;
      exception when others then
        success := false;
        error_msg := sqlerrm;
      end;
      
      user_id := r.user_id;
      return next;
    end loop;
  end loop;
end;
$$;

grant execute on function public.rotate_backups_batch(integer, integer) to authenticated;

-- 4. Test that the functions were created successfully
SELECT 'Functions created successfully!' as status;
SELECT routine_name, routine_type FROM information_schema.routines 
WHERE routine_name IN ('rotate_backups_hourly', 'rotate_all_backups_hourly_for_all_users', 'rotate_backups_batch')
  AND routine_schema = 'public'
ORDER BY routine_name;
