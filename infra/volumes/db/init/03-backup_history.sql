-- Backup history system
-- Creates a separate table to store hourly snapshots of a source table, with restore and pruning utilities

-- Required extensions
create extension if not exists pgcrypto with schema public;

-- Helper function for SHA256 checksums (fixes digest function issues)
create or replace function public._sha256_jsonb(jsonb)
returns text
language sql
as $$
  select encode(digest(convert_to(coalesce($1::text, ''), 'UTF8'), 'sha256'::text), 'hex');
$$;

-- Table to store backup history
create table if not exists public.backup_history (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  backup_time timestamptz not null default now(),
  row_count integer not null default 0,
  checksum text,
  data jsonb not null
);

-- Indexes for efficient lookups and ordering
create index if not exists idx_backup_history_source_time on public.backup_history (source_table, backup_time desc);
create index if not exists idx_backup_history_checksum on public.backup_history (checksum);

-- RLS: restrict to admins by default
alter table public.backup_history enable row level security;

drop policy if exists "backup history admin select" on public.backup_history;
create policy "backup history admin select" on public.backup_history
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "backup history admin modify" on public.backup_history;
create policy "backup history admin modify" on public.backup_history
  for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Ensure backup_history carries owner and type columns
alter table public.backup_history add column if not exists user_id uuid;
alter table public.backup_history add column if not exists data_type text;

-- Current backup table that holds the latest snapshot per source table
create table if not exists public.table_backups (
  id uuid primary key default gen_random_uuid(),
  source_table text not null unique,
  updated_at timestamptz not null default now(),
  row_count integer not null default 0,
  checksum text,
  snapshot jsonb not null
);

create index if not exists idx_table_backups_source on public.table_backups (source_table);

alter table public.table_backups enable row level security;

drop policy if exists "table backups admin select" on public.table_backups;
create policy "table backups admin select" on public.table_backups
  for select to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists "table backups admin modify" on public.table_backups;
create policy "table backups admin modify" on public.table_backups
  for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Keep updated_at current on updates
create or replace function public.set_table_backups_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_table_backups_updated_at on public.table_backups;
create trigger trg_set_table_backups_updated_at
before update on public.table_backups
for each row execute function public.set_table_backups_updated_at();

-- Backup function: snapshot entire table into jsonb array and store metadata
create or replace function public.run_table_backup(p_source_table text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  snapshot jsonb;
  rc integer;
  csum text;
  new_id uuid;
begin
  if p_source_table is null or length(trim(p_source_table)) = 0 then
    raise exception 'p_source_table cannot be null or empty';
  end if;

  -- Collect full table into JSONB in a single aggregate
  execute format('select coalesce(jsonb_agg(t), ''[]''::jsonb), count(*) from %I t', p_source_table)
    into snapshot, rc;

  -- Compute checksum for deduplication/verification
  csum := encode(digest(coalesce(snapshot::text, ''), 'sha256'::text), 'hex');

  insert into public.backup_history (source_table, data, row_count, checksum)
  values (p_source_table, snapshot, coalesce(rc, 0), csum)
  returning id into new_id;

  -- Upsert current backup record for the source table
  insert into public.table_backups (source_table, row_count, checksum, snapshot)
  values (p_source_table, coalesce(rc, 0), csum, snapshot)
  on conflict (source_table) do update set
    row_count = excluded.row_count,
    checksum = excluded.checksum,
    snapshot = excluded.snapshot,
    updated_at = now();

  return new_id;
end;
$$;

grant execute on function public.run_table_backup(text) to authenticated;

-- Restore function: truncate target table then reinsert from snapshot
create or replace function public.restore_table_from_backup(
  p_backup_id uuid,
  p_target_table text default null,
  p_truncate boolean default true
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_table text;
  v_target_table text;
  snapshot jsonb;
begin
  if p_backup_id is null then
    raise exception 'p_backup_id cannot be null';
  end if;

  select source_table, data into v_source_table, snapshot
  from public.backup_history where id = p_backup_id;

  if not found then
    raise exception 'Backup id % not found', p_backup_id;
  end if;

  v_target_table := coalesce(p_target_table, v_source_table);

  if p_truncate then
    execute format('truncate table %I restart identity cascade', v_target_table);
  end if;

  -- Insert rows back; requires keys in JSON to match table columns
  execute format(
    'insert into %1$I select * from jsonb_populate_recordset(null::%1$I, $1)',
    v_target_table
  ) using snapshot;

  -- Also update current backup to match the restored snapshot
  perform public.sync_current_backup_from_history(p_backup_id);

  return true;
end;
$$;

grant execute on function public.restore_table_from_backup(uuid, text, boolean) to authenticated;

-- Sync current backup table from a history row
create or replace function public.sync_current_backup_from_history(p_backup_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_table text;
  snapshot jsonb;
  rc integer;
  csum text;
begin
  select source_table, data, row_count, checksum
  into v_source_table, snapshot, rc, csum
  from public.backup_history where id = p_backup_id;

  if not found then
    raise exception 'Backup id % not found', p_backup_id;
  end if;

  insert into public.table_backups (source_table, row_count, checksum, snapshot)
  values (v_source_table, coalesce(rc,0), csum, snapshot)
  on conflict (source_table) do update set
    row_count = excluded.row_count,
    checksum = excluded.checksum,
    snapshot = excluded.snapshot,
    updated_at = now();

  return true;
end;
$$;

grant execute on function public.sync_current_backup_from_history(uuid) to authenticated;

-- Pruning function: keep last N hourly backups per source table and 1 per day beyond that horizon
create or replace function public.prune_backup_history(
  p_keep_hourly integer default 168, -- last 7 days hourly
  p_keep_daily_days integer default 90 -- then keep 1 per day for the last 90 days
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer := 0;
begin
  -- Delete anything older than the hourly window that is not the most recent for its day
  with ranked as (
    select id,
           source_table,
           backup_time,
           row_number() over (partition by source_table order by backup_time desc) as rn,
           date_trunc('day', backup_time) as day_key,
           row_number() over (partition by source_table, date_trunc('day', backup_time) order by backup_time desc) as rn_day
    from public.backup_history
  ), to_delete as (
    select r.id from ranked r
    where (
      r.rn > p_keep_hourly
      and r.backup_time >= now() - make_interval(days => p_keep_daily_days)
      and r.rn_day > 1 -- keep the most recent for each day
    )
    or (
      r.backup_time < now() - make_interval(days => p_keep_daily_days)
    )
  )
  delete from public.backup_history b using to_delete d where b.id = d.id;

  get diagnostics deleted_count = row_count;
  return coalesce(deleted_count, 0);
end;
$$;

grant execute on function public.prune_backup_history(integer, integer) to authenticated;

-- Seed history for ALL users from current backups (one-time per user_id+data_type)
create or replace function public.seed_backup_history_from_backups_all_users()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
begin
  insert into public.backup_history (source_table, user_id, data_type, data, row_count, checksum)
  select
    case
      when b.data_type = 'user_questions' then 'user_questions'
      when b.data_type = 'catalog_questions_table' then 'catalog_questions'
      else 'user_data'
    end as source_table,
    b.user_id,
    b.data_type,
    b.snapshot,
    (case when jsonb_typeof(b.snapshot) = 'array' then jsonb_array_length(b.snapshot) else 1 end),
    encode(digest(coalesce(b.snapshot::text, ''), 'sha256'::text), 'hex')
  from public.backups b
  where b.data_type in (
    'sat_master_log_all_quizzes',
    'user_questions',
    'sat_master_log_calendar_events',
    'sat_master_log_question_answers',
    'sat_master_log_catalog_questions',
    'catalog_questions_table'
  )
  and not exists (
    select 1 from public.backup_history h
    where h.user_id = b.user_id and h.data_type = b.data_type
  );

  get diagnostics inserted_count = row_count;
  return coalesce(inserted_count, 0);
end;
$$;

grant execute on function public.seed_backup_history_from_backups_all_users() to authenticated;

-- Rotate all backups hourly for ALL users (and global catalog)
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
begin
  -- For each distinct user id present in backups, user_data, or user_questions
  for r in (
    select user_id from public.backups
    union
    select distinct user_id from public.user_data
    union
    select distinct user_id from public.user_questions
  ) loop
    perform public.rotate_all_backups_hourly_for_user(r.user_id);
    ran := ran + 1;
  end loop;

  -- Also rotate global catalog snapshot under any admin user id
  select a.user_id into admin_id from public.admins a limit 1;
  if admin_id is not null then
    perform public.rotate_catalog_backup_hourly(admin_id);
  end if;

  return ran;
end;
$$;

grant execute on function public.rotate_all_backups_hourly_for_all_users() to authenticated;

-- Snapshot entire backups table into a single history row
create or replace function public.snapshot_entire_backups_table()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  snapshot jsonb;
  rc integer;
  csum text;
  new_id uuid;
begin
  select coalesce(jsonb_agg(to_jsonb(b)), '[]'::jsonb), count(*)
  into snapshot, rc
  from public.backups b;

  csum := md5(coalesce(snapshot::text, ''));

  insert into public.backup_history (source_table, data, row_count, checksum)
  values ('backups', snapshot, coalesce(rc, 0), csum)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.snapshot_entire_backups_table() to authenticated;

-- Restore backups table exactly from a full-table history snapshot
create or replace function public.restore_entire_backups_table(p_history_id uuid, p_truncate boolean default true)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  snap jsonb;
begin
  select data into snap
  from public.backup_history
  where id = p_history_id and source_table = 'backups';

  if not found then
    raise exception 'Backup history id % not found for source_table=backups', p_history_id;
  end if;

  if p_truncate then
    truncate table public.backups restart identity cascade;
  end if;

  -- Insert with proper handling of user_id constraint
  insert into public.backups (user_id, data_type, snapshot, updated_at)
  select 
    coalesce((value->>'user_id')::uuid, gen_random_uuid()) as user_id,
    coalesce(value->>'data_type', 'unknown') as data_type,
    value->'snapshot' as snapshot,
    coalesce((value->>'updated_at')::timestamptz, now()) as updated_at
  from jsonb_array_elements(snap);

  return true;
end;
$$;

grant execute on function public.restore_entire_backups_table(uuid, boolean) to authenticated;

-- Restore from backup history to live tables and sync backups
create or replace function public.restore_from_backup_history(
  p_backup_id uuid,
  p_user_id uuid default null,
  p_data_type text default null,
  p_target_table text default null,
  p_truncate boolean default true
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_table text;
  v_target_table text;
  v_user_id uuid;
  v_data_type text;
  snapshot jsonb;
begin
  if p_backup_id is null then
    raise exception 'p_backup_id cannot be null';
  end if;

  -- Get backup details
  select source_table, user_id, data_type, data 
  into v_source_table, v_user_id, v_data_type, snapshot
  from public.backup_history 
  where id = p_backup_id;

  if not found then
    raise exception 'Backup id % not found', p_backup_id;
  end if;

  -- Use provided parameters or fall back to backup values
  v_user_id := coalesce(p_user_id, v_user_id);
  v_data_type := coalesce(p_data_type, v_data_type);
  v_target_table := coalesce(p_target_table, v_source_table);

  -- Handle different restore scenarios
  if v_source_table = 'backups' then
    -- This is a full system backup, use the dedicated function
    return public.restore_entire_backups_table(p_backup_id, p_truncate);
  elsif v_data_type = 'user_questions' then
    -- Restore user_questions table
    if v_user_id is null then
      raise exception 'user_id is required for user_questions restore';
    end if;
    
    if p_truncate then
      delete from public.user_questions where user_id = v_user_id;
    end if;
    
    insert into public.user_questions
    select * from jsonb_populate_recordset(null::public.user_questions, snapshot);
    
  elsif v_data_type = 'catalog_questions_table' then
    -- Restore catalog_questions table (admin only)
    if p_truncate then
      truncate table public.catalog_questions restart identity cascade;
    end if;
    
    insert into public.catalog_questions
    select * from jsonb_populate_recordset(null::public.catalog_questions, snapshot);
    
  else
    -- Restore to user_data table
    if v_user_id is null then
      raise exception 'user_id is required for user_data restore';
    end if;
    
    insert into public.user_data (user_id, data_type, data, updated_at)
    values (v_user_id, v_data_type, snapshot, now())
    on conflict (user_id, data_type) do update set
      data = excluded.data,
      updated_at = excluded.updated_at;
  end if;

  -- Update the corresponding backup entry
  update public.backups 
  set snapshot = snapshot,
      updated_at = now()
  where user_id = v_user_id and data_type = v_data_type;

  return true;
end;
$$;

grant execute on function public.restore_from_backup_history(uuid, uuid, text, text, boolean) to authenticated;

-- Manual backup trigger function (call this from your app or external scheduler)
create or replace function public.trigger_hourly_backup()
returns void
language plpgsql
security definer
as $$
begin
  -- Call backup for catalog_questions table (adjust as needed)
  perform public.run_table_backup('catalog_questions');
  
  -- Log the backup trigger
  raise notice 'Hourly backup triggered for catalog_questions at %', now();
end;
$$;

grant execute on function public.trigger_hourly_backup() to authenticated;

-- Manual prune trigger function
create or replace function public.trigger_daily_prune()
returns void
language plpgsql
security definer
as $$
begin
  -- Call prune function
  perform public.prune_backup_history();
  
  -- Log the prune trigger
  raise notice 'Daily prune triggered at %', now();
end;
$$;

grant execute on function public.trigger_daily_prune() to authenticated;

-- Alternative: Create a simple backup status table to track when backups should run
create table if not exists public.backup_schedule (
  id text primary key default 'default',
  last_hourly_backup timestamptz,
  last_daily_prune timestamptz,
  next_hourly_backup timestamptz,
  next_daily_prune timestamptz,
  updated_at timestamptz default now()
);

-- Insert default schedule
insert into public.backup_schedule (id, next_hourly_backup, next_daily_prune)
values ('default', now() + interval '1 hour', now() + interval '1 day')
on conflict (id) do nothing;

-- Function to check and run scheduled backups
create or replace function public.check_and_run_scheduled_backups()
returns table(action text, executed boolean, next_run timestamptz)
language plpgsql
security definer
as $$
declare
  schedule_record record;
  should_run_hourly boolean := false;
  should_run_daily boolean := false;
begin
  -- Get current schedule
  select * into schedule_record from public.backup_schedule where id = 'default';
  
  if not found then
    -- Initialize schedule if not exists
    insert into public.backup_schedule (id, next_hourly_backup, next_daily_prune)
    values ('default', now() + interval '1 hour', now() + interval '1 day');
    select * into schedule_record from public.backup_schedule where id = 'default';
  end if;
  
  -- Check if hourly backup should run
  if now() >= schedule_record.next_hourly_backup then
    should_run_hourly := true;
  end if;
  
  -- Check if daily prune should run
  if now() >= schedule_record.next_daily_prune then
    should_run_daily := true;
  end if;
  
  -- Execute hourly backup if needed
  if should_run_hourly then
    perform public.run_table_backup('catalog_questions');
    update public.backup_schedule 
    set last_hourly_backup = now(),
        next_hourly_backup = now() + interval '1 hour',
        updated_at = now()
    where id = 'default';
    
    action := 'hourly_backup';
    executed := true;
    next_run := now() + interval '1 hour';
    return next;
  end if;
  
  -- Execute daily prune if needed
  if should_run_daily then
    perform public.prune_backup_history();
    update public.backup_schedule 
    set last_daily_prune = now(),
        next_daily_prune = now() + interval '1 day',
        updated_at = now()
    where id = 'default';
    
    action := 'daily_prune';
    executed := true;
    next_run := now() + interval '1 day';
    return next;
  end if;
  
  -- Return status if nothing executed
  action := 'no_action';
  executed := false;
  next_run := least(schedule_record.next_hourly_backup, schedule_record.next_daily_prune);
  return next;
end;
$$;

grant execute on function public.check_and_run_scheduled_backups() to authenticated;

-- Simple function for creating restorable backups (optimized for smaller tables)
create or replace function public.snapshot_entire_backups_table_simple()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  snapshot jsonb;
  rc integer;
  csum text;
  new_id uuid;
begin
  -- Check if backups table exists
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'backups') then
    raise exception 'backups table does not exist';
  end if;

  -- Get the data directly (should work for 13 rows)
  select coalesce(jsonb_agg(to_jsonb(b)), '[]'::jsonb), count(*)
  into snapshot, rc
  from public.backups b;

  csum := md5(coalesce(snapshot::text, ''));

  insert into public.backup_history (source_table, data, row_count, checksum)
  values ('backups', snapshot, coalesce(rc, 0), csum)
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.snapshot_entire_backups_table_simple() to authenticated;


-- Delete a backup row from history by id (used by Admin UI "Delete backup")
create or replace function public.delete_backup_from_history(p_backup_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer := 0;
begin
  if p_backup_id is null then
    raise exception 'p_backup_id cannot be null';
  end if;

  delete from public.backup_history where id = p_backup_id;
  get diagnostics deleted_count = row_count;
  return deleted_count > 0;
end;
$$;

grant execute on function public.delete_backup_from_history(uuid) to authenticated;

