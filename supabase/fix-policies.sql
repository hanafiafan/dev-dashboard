-- ============================================================
--  Dev Dashboard — RLS policy repair (idempotent)
--  Run in: Supabase → SQL Editor → New query → Run
--  Safe to run multiple times. Fixes the public request form
--  being blocked by RLS.
-- ============================================================

alter table public.profile  enable row level security;
alter table public.projects enable row level security;
alter table public.tasks    enable row level security;
alter table public.requests enable row level security;
alter table public.activity enable row level security;

-- ---- profile / projects / tasks : public read, owner write ----
drop policy if exists "public read profile"  on public.profile;
drop policy if exists "public read projects" on public.projects;
drop policy if exists "public read tasks"    on public.tasks;
create policy "public read profile"  on public.profile  for select to anon, authenticated using (true);
create policy "public read projects" on public.projects for select to anon, authenticated using (true);
create policy "public read tasks"    on public.tasks    for select to anon, authenticated using (true);

drop policy if exists "owner write profile"  on public.profile;
drop policy if exists "owner write projects" on public.projects;
drop policy if exists "owner write tasks"    on public.tasks;
create policy "owner write profile"  on public.profile  for all to authenticated using (true) with check (true);
create policy "owner write projects" on public.projects for all to authenticated using (true) with check (true);
create policy "owner write tasks"    on public.tasks    for all to authenticated using (true) with check (true);

-- ---- requests : ANYONE may submit, owner manages ----
drop policy if exists "anyone submit request" on public.requests;
drop policy if exists "owner read requests"   on public.requests;
drop policy if exists "owner manage requests" on public.requests;
drop policy if exists "owner delete requests" on public.requests;
create policy "anyone submit request" on public.requests for insert to anon, authenticated with check (true);
create policy "owner read requests"   on public.requests for select to authenticated using (true);
create policy "owner manage requests" on public.requests for update to authenticated using (true) with check (true);
create policy "owner delete requests" on public.requests for delete to authenticated using (true);

-- ---- activity : anyone may append (so public submits get logged), owner reads ----
drop policy if exists "owner read activity"    on public.activity;
drop policy if exists "anyone append activity" on public.activity;
create policy "owner read activity"    on public.activity for select to authenticated using (true);
create policy "anyone append activity" on public.activity for insert to anon, authenticated with check (true);

-- ---- realtime (ignore error if already added) ----
do $$ begin
  alter publication supabase_realtime add table public.projects;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.tasks;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.requests;
exception when duplicate_object then null; end $$;
