# Supabase Migrations

This directory contains SQL migrations that must be run in your Supabase project
to keep the database schema in sync with the application.

## How to apply

### Option A — Supabase SQL Editor (easiest)
1. Open your project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Paste the contents of each `.sql` file and click **Run**

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
