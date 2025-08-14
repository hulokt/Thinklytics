-- Backups table for periodic snapshots of user data
-- One row per (user_id, data_type)

create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  data_type text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint backups_user_type_unique unique (user_id, data_type)
);

alter table public.backups enable row level security;

-- Only owner can select their backups
drop policy if exists "backups select own" on public.backups;
create policy "backups select own" on public.backups
  for select to authenticated
  using (user_id = auth.uid());

-- Only owner can insert their backups
drop policy if exists "backups insert own" on public.backups;
create policy "backups insert own" on public.backups
  for insert to authenticated
  with check (user_id = auth.uid());

-- Only owner can update their backups
drop policy if exists "backups update own" on public.backups;
create policy "backups update own" on public.backups
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Optional: allow admins to manage backups for admin-only data
-- Requires existing public.admins table
drop policy if exists "backups admin manage" on public.backups;
create policy "backups admin manage" on public.backups
  for all to authenticated
  using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Convenience index for lookups
create index if not exists idx_backups_user_type on public.backups (user_id, data_type);

-- Maintain updated_at timestamp on updates
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_backups_updated_at on public.backups;
create trigger set_backups_updated_at
before update on public.backups
for each row execute function public.set_updated_at();


