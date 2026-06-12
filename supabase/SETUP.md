# 🟢 Supabase Backend — Setup Guide

The app runs in **two modes**:

| Mode | When | Storage | Login |
|------|------|---------|-------|
| **Demo** (default) | Supabase env vars empty | Browser `localStorage` | password `admin` |
| **Supabase** | env vars set | Postgres + Storage | real email/password |

Follow this guide to switch from demo to a real, persistent, multi-device backend with auth, file uploads, and realtime.

---

## 1. Create the project
1. Go to <https://supabase.com> → **New project**. Pick a name + region (closest to you, e.g. Singapore) + a strong database password.
2. Wait ~2 minutes for it to provision.

## 2. Create the database schema
1. Open **SQL Editor → New query**.
2. Paste the entire contents of [`schema.sql`](./schema.sql) and click **Run**.
   - This creates the `projects`, `tasks`, `profile`, `requests`, `activity` tables, all Row-Level-Security policies, realtime, and seeds your profile row.

## 3. Create the Storage bucket (for request attachments)
1. **Storage → Create bucket** → name it exactly **`request-files`** → enable **Public bucket** → Create.
2. Open **SQL Editor → New query**, paste and **Run**:
   ```sql
   -- visitors (anon) may upload attachments with their request
   create policy "anyone upload request files"
     on storage.objects for insert
     with check (bucket_id = 'request-files');

   -- attachments are publicly readable (so you can open them)
   create policy "public read request files"
     on storage.objects for select
     using (bucket_id = 'request-files');
   ```

## 4. Create your owner account
1. **Authentication → Users → Add user** → enter your email + a password → **Create user** (tick "Auto confirm").
   - This is the account you'll log in with at `/login`.
2. **Lock it down to just you:** **Authentication → Sign In / Providers → Email** → turn **OFF** “Allow new users to sign up”. Now only your existing account can authenticate, so *authenticated = owner*.

## 5. Get your API keys
**Project Settings → API**, copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 6. Wire up the app
Create `.env.local` in the project root (copy from `.env.local.example`):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
NEXT_PUBLIC_OWNER_EMAIL=hanafi.afan@gmail.com
```
Restart the dev server:
```bash
npm run dev
```
The sidebar badge should now read **“Supabase connected”**, and `/login` uses real auth.

---

## How security works
- **Public visitors** can: read projects/tasks/profile (the landing page) and **submit a request** (insert into `requests` + upload files). They **cannot** read other requests, edit, or delete anything — enforced by Postgres RLS, not just the UI.
- **You (authenticated)** can do everything: full CRUD on projects/tasks, manage requests, edit your profile.

## Realtime
`schema.sql` adds `projects`, `tasks`, and `requests` to the `supabase_realtime` publication. The app subscribes and refreshes automatically — open two tabs and watch changes sync live.

## Going to production (Vercel)
1. Push the repo to GitHub, import into **Vercel**.
2. Add the same `NEXT_PUBLIC_*` env vars in the Vercel project settings.
3. Deploy. Your public landing + request form is now live; you log in at `/login`.

## Optional: scheduled WhatsApp/email reminders
For deadline reminders that fire even when nobody is on the site, use a **Supabase Edge Function + `pg_cron`** that queries tasks due soon and calls a WhatsApp API (e.g. Fonnte/Twilio) or email (Resend). See `supabase/edge-reminder.example.ts` for a starting point.
