# 🖥️ Dev Dashboard

A professional, Notion-style **work dashboard + public portfolio** for software developer **Hanafi Afan**. Two surfaces in one app:

- **🌐 Public site (`/`)** — a read-only showcase of current work + a **project request form** anyone can submit (name, WhatsApp, brief, file attachments).
- **🔒 Workspace (`/app`)** — login-protected. Full CRUD for projects, tasks, profile, and an **inbox** of incoming requests where each WhatsApp number becomes a one-click **wa.me** chat button.

![stack](https://img.shields.io/badge/Next.js-15-black) ![ts](https://img.shields.io/badge/TypeScript-5-blue) ![tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8) ![supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

---

## ✨ Features

**Public**
- Hero with profile, skills & social links
- Live read-only showcase of public projects grouped by status, with task breakdown
- **Request form** → name, WhatsApp, email, project type, message + up to 5 file attachments
- Dark / light mode

**Workspace (owner only)**
- Dashboard: stat cards, project-status donut, task-status bar, upcoming tasks, activity
- Projects: searchable grid + detail page with **drag-and-drop Kanban**, inline status/progress, resource links, “show on public site” toggle
- Tasks: global table, inline status change, overdue highlighting
- **Requests inbox**: status workflow, attachment preview, **wa.me** + email shortcuts, “new” badge in sidebar
- Profile editor
- **Realtime sync** across tabs/devices (Supabase)

## 🧱 Tech stack

| Layer | Choice |
|-------|--------|
| Framework | **Next.js 15** (App Router) + **TypeScript** |
| Styling | **Tailwind CSS** + shadcn-style UI primitives |
| Icons | **lucide-react** |
| Data / cache | **TanStack Query** |
| Charts | **Recharts** |
| Backend | **Supabase** — Postgres + Auth + Storage + Realtime |

The data layer is abstracted behind a `DataProvider` interface (`src/lib/api.ts`) with two implementations — **demo** (localStorage) and **Supabase** — so the entire UI is backend-agnostic.

## 🚀 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Runs immediately in **demo mode** (no backend): data lives in `localStorage`, seeded with sample content. Log in at `/login` with password **`admin`**.

### Connect the real Supabase backend
Follow **[`supabase/SETUP.md`](./supabase/SETUP.md)** — create the project, run [`schema.sql`](./supabase/schema.sql), make the `request-files` storage bucket, create your owner account, then fill `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```
Restart `npm run dev` → the sidebar shows **“Supabase connected”** and login uses real auth.

## 🔐 Security model
Enforced by Postgres **Row Level Security**, not just the UI:
- **Anon visitors**: read projects/tasks/profile, and *insert* a request (+upload files). Nothing else.
- **Authenticated (you)**: full read/write everywhere. Disable Supabase sign-ups so `authenticated == owner`.

## 📁 Project structure

```
src/
├── app/
│   ├── page.tsx              # 🌐 public landing + request form
│   ├── login/                # auth screen
│   └── app/                  # 🔒 workspace (auth-guarded layout)
│       ├── page.tsx          #   dashboard
│       ├── projects/         #   list + [id] detail (kanban)
│       ├── tasks/            #   global task table
│       ├── requests/         #   incoming request inbox
│       └── profile/          #   profile editor
├── components/               # ui, app-shell, charts, kanban, dialogs, request-form…
└── lib/
    ├── types.ts              # domain models (mirror the SQL schema)
    ├── api.ts                # DataProvider: Local + Supabase
    ├── auth.ts               # Demo + Supabase auth
    ├── supabase.ts           # client singleton
    ├── queries.ts            # React Query hooks
    ├── seed.ts / utils.ts
supabase/
├── schema.sql                # tables + RLS + realtime + seed
├── SETUP.md                  # full deployment guide
└── edge-reminder.example.ts  # optional scheduled WhatsApp reminders
```

## 📜 Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | Lint |

## 🚢 Deploy
Push to GitHub → import to **Vercel** → add the `NEXT_PUBLIC_*` env vars → deploy. Public site + request intake go live; you log in at `/login`.

---

Made with ❤️ for **Hanafi Afan**.
