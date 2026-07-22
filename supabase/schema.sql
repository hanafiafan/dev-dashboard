-- ============================================================
--  Dev Dashboard — Supabase schema
--  Run this in: Supabase Dashboard → SQL Editor → New query → Run
--
--  Security model (single-owner app):
--   • Anyone (anon) can READ projects/tasks/profile  → public showcase
--   • Anyone (anon) can INSERT a request             → public brief form
--   • Only an AUTHENTICATED user (= you, the owner)  → full read/write
--     (disable public sign-ups so "authenticated" == owner)
--
--  Column names are intentionally camelCase (quoted) so they map
--  1:1 to the app's TypeScript models — no translation layer.
-- ============================================================

-- ---------- Profile (single row, public) ----------
create table if not exists public.profile (
  id            int primary key default 1,
  "name"        text not null default '',
  "role"        text not null default '',
  email         text not null default '',
  "location"    text not null default '',
  bio           text not null default '',
  "avatarEmoji" text not null default '🧑‍💻',
  skills        text[] not null default '{}',
  github        text not null default '',
  linkedin      text not null default '',
  website       text not null default '',
  "showCalendar"  boolean not null default true,
  "showTechStack" boolean not null default true,
  "acceptingProjects" boolean not null default true,  -- if false, public request form is locked
  constraint single_profile check (id = 1)
);

-- ---------- Projects ----------
create table if not exists public.projects (
  id            text primary key,
  "name"        text not null,
  emoji         text not null default '📁',
  status        text not null default 'Planning',
  priority      text not null default 'Medium',
  "startDate"   date,
  deadline      date,
  "techStack"   text[] not null default '{}',
  client        text not null default '',
  progress      int  not null default 0,
  "publicSummary" text not null default '',  -- safe-for-anyone summary shown publicly
  description   text not null default '',     -- full internal detail, owner-only
  "repoUrl"     text not null default '',
  "figmaUrl"    text not null default '',
  "stagingUrl"  text not null default '',
  "isPublic"    boolean not null default true,   -- show on public landing?
  "createdAt"   timestamptz not null default now(),
  "updatedAt"   timestamptz not null default now()
);

-- ---------- Tasks ----------
create table if not exists public.tasks (
  id              text primary key,
  "projectId"     text not null references public.projects(id) on delete cascade,
  "name"          text not null,
  status          text not null default 'Todo',
  priority        text not null default 'Medium',
  "dueDate"       date,
  "estimatedHours" numeric not null default 0,
  notes           text not null default '',
  "createdAt"     timestamptz not null default now(),
  "updatedAt"     timestamptz not null default now()
);
create index if not exists tasks_project_idx on public.tasks ("projectId");

-- ---------- Requests (public brief submissions) ----------
create table if not exists public.requests (
  id           uuid primary key default gen_random_uuid(),
  "name"       text not null,
  whatsapp     text not null default '',
  email        text not null default '',
  company      text not null default '',
  "projectType" text not null default '',
  team         text not null default '',  -- tim/bagian internal pengaju (opsional)
  timeline     text not null default '',
  "referenceUrl" text not null default '',
  "driveLink"  text not null default '',  -- Google Drive link (Editor access) in place of direct file upload
  message      text not null default '',
  attachments  jsonb not null default '[]'::jsonb,   -- [{name,url,size}]
  status       text not null default 'New',          -- New | Reviewing | Accepted | Rejected | Done
  "createdAt"  timestamptz not null default now()
);
create index if not exists requests_created_idx on public.requests ("createdAt" desc);

-- ---------- Activity (audit log) ----------
create table if not exists public.activity (
  id          uuid primary key default gen_random_uuid(),
  "timestamp" timestamptz not null default now(),
  "type"      text not null,
  "action"    text not null,
  message     text not null
);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table public.profile  enable row level security;
alter table public.projects enable row level security;
alter table public.tasks    enable row level security;
alter table public.requests enable row level security;
alter table public.activity enable row level security;

-- Public read for the showcase tables — anon only ever sees isPublic rows
create policy "public read profile"  on public.profile  for select to anon using (true);
create policy "public read projects" on public.projects for select to anon
  using ("isPublic" = true);
create policy "public read tasks"    on public.tasks    for select to anon
  using (exists (select 1 from public.projects p where p.id = "projectId" and p."isPublic" = true));

-- Column-level lockdown: even for isPublic projects, anon can never read
-- description/client/links — owner-only regardless of row visibility.
-- IMPORTANT: `revoke select (col) ... from anon` alone does NOT work — Supabase's
-- blanket `grant select on all tables to anon` still allows full-row reads
-- through that separate table-level grant. You must revoke the whole table-level
-- grant first, then grant back only the safe columns.
revoke select on public.projects from anon;
grant select (id, "name", emoji, status, priority, "startDate", deadline, "techStack", progress, "publicSummary", "isPublic", "createdAt", "updatedAt")
  on public.projects to anon;

-- Owner (any authenticated user) full read/write on showcase tables
create policy "owner read profile"   on public.profile  for select to authenticated using (true);
create policy "owner write profile"  on public.profile  for all    to authenticated using (true) with check (true);
create policy "owner read projects"  on public.projects for select to authenticated using (true);
create policy "owner write projects" on public.projects for all    to authenticated using (true) with check (true);
create policy "owner read tasks"     on public.tasks    for select to authenticated using (true);
create policy "owner write tasks"    on public.tasks    for all    to authenticated using (true) with check (true);

-- Requests: anyone may submit; only owner may read/manage
create policy "anyone submit request" on public.requests for insert to anon, authenticated with check (true);
create policy "owner read requests"   on public.requests for select to authenticated using (true);
create policy "owner manage requests" on public.requests for update to authenticated using (true) with check (true);
create policy "owner delete requests" on public.requests for delete to authenticated using (true);

-- Activity: owner reads, anyone may append (so public submissions get logged)
create policy "owner read activity"   on public.activity for select to authenticated using (true);
create policy "anyone append activity" on public.activity for insert to anon, authenticated with check (true);

-- ============================================================
--  Realtime — broadcast row changes to subscribed clients
-- ============================================================
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.requests;

-- ============================================================
--  Calendar events (owner-only)
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
create policy "owner manage events" on public.events for all to authenticated using (true) with check (true);
alter publication supabase_realtime add table public.events;

-- ============================================================
--  Seed the owner profile (edit to taste)
-- ============================================================
insert into public.profile (id, "name", "role", email, "location", bio, "avatarEmoji", skills, github, linkedin, website)
values (
  1,
  'Hanafi Afan',
  'Full-Stack Software Developer',
  'hanafi.afan@gmail.com',
  'Bandung, Indonesia',
  'Software developer berfokus pada web & mobile app development.',
  '🧑‍💻',
  array['TypeScript','Next.js','Laravel','Flutter','PostgreSQL'],
  'https://github.com/hanafiafan',
  'https://linkedin.com/in/hanafiafan',
  'https://hanafiafan.dev'
)
on conflict (id) do nothing;
