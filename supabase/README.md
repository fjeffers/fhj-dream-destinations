# Supabase Migrations

This directory contains SQL migrations that must be run in your Supabase project
to keep the database schema in sync with the application.

## How to apply

### Option A — Supabase SQL Editor (easiest)

> ⚠️ **Important:** You must paste the **SQL text** shown below into the editor —
> do **NOT** type the filename. The SQL Editor runs SQL statements, not file paths.

1. Go to your project at [supabase.com](https://supabase.com)
2. In the left sidebar click **SQL Editor**
3. Click **New query** (or the `+` button)
4. **Copy the SQL block** shown in the migration section below (everything inside
   the ` ```sql … ``` ` fence)
5. **Paste it** into the SQL Editor's query box
6. Click **Run** (or press `Ctrl/Cmd + Enter`)

### Option B — Supabase CLI
```bash
npx supabase db push
```

---

## Required migrations

### `20260301000000_fix_service_role_rls.sql`

**Problem:** "new row violates row-level security policy for table admins" (and
potentially any other table) when adding, editing, or deleting records via the
admin panel.

**Fix:** Grants the `service_role` (used by all Netlify backend functions) explicit
`FOR ALL` access to every table in the project, while keeping direct anonymous
client access blocked.  Tables covered: `about_page`, `admins`, `audit_log`,
`blocked_slots`, `bookings`, `client_login`, `clients`, `concierge`,
`concierge_messages`, `deals`, `documents`, `events`, `payments`, `rsvps`, `trips`.

**Must be run if:** You cannot add, edit, or delete records via any admin page.

**Copy and paste this SQL into the Supabase SQL Editor, then click Run:**

```sql
ALTER TABLE IF EXISTS public.about_page ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.about_page;
CREATE POLICY "service_role_full_access"
  ON public.about_page FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_allow_all"           ON public.admins;
DROP POLICY IF EXISTS "admins_restrict_all"        ON public.admins;
DROP POLICY IF EXISTS "allow_backend_access"       ON public.admins;
DROP POLICY IF EXISTS "service_role_full_access"   ON public.admins;
CREATE POLICY "service_role_full_access"
  ON public.admins FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.audit_log;
CREATE POLICY "service_role_full_access"
  ON public.audit_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.blocked_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.blocked_slots;
CREATE POLICY "service_role_full_access"
  ON public.blocked_slots FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.bookings;
CREATE POLICY "service_role_full_access"
  ON public.bookings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.client_login ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.client_login;
CREATE POLICY "service_role_full_access"
  ON public.client_login FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.clients;
CREATE POLICY "service_role_full_access"
  ON public.clients FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.concierge ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.concierge;
CREATE POLICY "service_role_full_access"
  ON public.concierge FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.concierge_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.concierge_messages;
CREATE POLICY "service_role_full_access"
  ON public.concierge_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.deals;
CREATE POLICY "service_role_full_access"
  ON public.deals FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.documents;
CREATE POLICY "service_role_full_access"
  ON public.documents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.events;
CREATE POLICY "service_role_full_access"
  ON public.events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.payments;
CREATE POLICY "service_role_full_access"
  ON public.payments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.rsvps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.rsvps;
CREATE POLICY "service_role_full_access"
  ON public.rsvps FOR ALL TO service_role
  USING (true) WITH CHECK (true);

ALTER TABLE IF EXISTS public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.trips;
CREATE POLICY "service_role_full_access"
  ON public.trips FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

---

## Environment variables

Ensure these are set in your **Netlify site settings → Environment variables**:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your project URL, e.g. `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | The **service_role** key from Project Settings → API |

> ⚠️ Use the **service_role** key, NOT the **anon/public** key.  
> The service_role key is the one that bypasses Row Level Security and
> allows backend functions to manage the admins table.
