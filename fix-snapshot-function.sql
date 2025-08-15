-- Fix Snapshot Function - Apply this in your Supabase SQL Editor
-- Make it create real restorable snapshots instead of metadata-only

-- Drop the current function
DROP FUNCTION IF EXISTS public.snapshot_entire_backups_table_simple();

-- Create the real snapshot function that creates restorable backups
create or replace function public.snapshot_entire_backups_table_simple()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  snapshot jsonb := '[]'::jsonb;
  rc integer;
  csum text;
  new_id uuid;
  r record;
  processed integer := 0;
begin
  -- Disable statement timeout for this function
  PERFORM set_config('statement_timeout','0', true);
  
  -- Check if backups table exists
  if not exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'backups') then
    raise exception 'backups table does not exist';
  end if;
  
  -- Get the total count
  select count(*) into rc from public.backups;
  
  -- Process data row by row to avoid timeout
  for r in (
    select to_jsonb(b) as row_data
    from public.backups b
    order by b.user_id, b.data_type
  ) loop
    -- Add row to snapshot
    snapshot := snapshot || r.row_data;
    processed := processed + 1;
    
    -- Log progress every 5 rows
    if processed % 5 = 0 then
      raise notice 'Processed % rows out of %', processed, rc;
    end if;
  end loop;
  
  csum := md5(coalesce(snapshot::text, ''));
  
  insert into public.backup_history (source_table, data, row_count, checksum)
  values ('backups', snapshot, coalesce(rc, 0), csum)
  returning id into new_id;
  
  raise notice 'Created REAL restorable snapshot (% rows, % bytes)', rc, octet_length(snapshot::text);
  return new_id;
end;
$$;

grant execute on function public.snapshot_entire_backups_table_simple() to authenticated;

-- Test the fixed function
SELECT 'Fixed snapshot function created!' as status;
SELECT public.snapshot_entire_backups_table_simple() as test_result;
