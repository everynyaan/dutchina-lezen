-- Dutchina sync layer: app_state
-- Idempotent -- safe to paste into the Supabase SQL editor more than once.

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table if not exists public.app_state (
  user_id    uuid        not null references auth.users(id) on delete cascade,
  subsystem  text        not null,
  value      jsonb       not null,
  rev        bigint      not null default 1,
  updated_at timestamptz not null default now(),
  primary key (user_id, subsystem),
  constraint app_state_subsystem_check check (
    subsystem in ('srs', 'progress', 'daily', 'config', 'adjustments', 'pages')
  )
);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.app_state enable row level security;

-- Prevents reading another user's rows.
drop policy if exists "app_state_select_own" on public.app_state;
create policy "app_state_select_own"
  on public.app_state
  for select
  using (auth.uid() = user_id);

-- Prevents inserting a row owned by another user.
drop policy if exists "app_state_insert_own" on public.app_state;
create policy "app_state_insert_own"
  on public.app_state
  for insert
  with check (auth.uid() = user_id);

-- Prevents updating another user's rows or reassigning ownership via user_id.
drop policy if exists "app_state_update_own" on public.app_state;
create policy "app_state_update_own"
  on public.app_state
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Prevents deleting another user's rows.
drop policy if exists "app_state_delete_own" on public.app_state;
create policy "app_state_delete_own"
  on public.app_state
  for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Server-owned rev / updated_at (client cannot set these)
-- ---------------------------------------------------------------------------
create or replace function public.app_state_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.rev := 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists app_state_before_insert on public.app_state;
create trigger app_state_before_insert
  before insert on public.app_state
  for each row
  execute function public.app_state_before_insert();

create or replace function public.app_state_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.subsystem is distinct from old.subsystem then
    raise exception 'app_state.subsystem is immutable';
  end if;
  new.rev := old.rev + 1;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists app_state_before_update on public.app_state;
create trigger app_state_before_update
  before update on public.app_state
  for each row
  execute function public.app_state_before_update();

-- ---------------------------------------------------------------------------
-- Grants: authenticated only; anon and public get nothing
-- ---------------------------------------------------------------------------
revoke all on public.app_state from anon;
revoke all on public.app_state from public;
grant select, insert, update, delete on public.app_state to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime (no-op if already a publication member)
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_state'
  ) then
    alter publication supabase_realtime add table public.app_state;
  end if;
end $$;
