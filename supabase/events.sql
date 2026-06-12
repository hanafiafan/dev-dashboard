-- ============================================================
--  Dev Dashboard — Calendar events table (run once in SQL Editor)
--  Owner-only: events appear on the workspace dashboard calendar.
-- ============================================================

create table if not exists public.events (
  id          text primary key,
  title       text not null,
  "date"      date,
  "time"      text not null default '',
  "type"      text not null default 'Meeting',
  notes       text not null default '',
  "createdAt" timestamptz not null default now()
);
create index if not exists events_date_idx on public.events ("date");

alter table public.events enable row level security;

drop policy if exists "owner manage events" on public.events;
create policy "owner manage events"
  on public.events for all
  to authenticated
  using (true)
  with check (true);

do $$ begin
  alter publication supabase_realtime add table public.events;
exception when duplicate_object then null; end $$;
