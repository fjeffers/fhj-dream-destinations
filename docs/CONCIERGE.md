# Threaded Concierge — Setup & Configuration

This document covers the environment variables, database migrations, and deployment steps required to enable the interactive threaded concierge feature with AI-powered suggestions.

---

## Required Environment Variables

Set these in your **Netlify** site settings → Environment Variables:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-side only, never expose to browser) |
| `OPENAI_API_KEY` | OpenAI API key for AI suggestion generation (preferred name) |
| `FHJAI` | Fallback name for the OpenAI key if `OPENAI_API_KEY` is not set |

> **Cost note:** The `ai-suggest` function uses **`gpt-4o-mini`** by default. To reduce costs you can change the `model` field in `netlify/functions/ai-suggest.js` to `"gpt-3.5-turbo"`.

---

## Database Migrations

Run the following SQL scripts in your **Supabase SQL Editor** (Dashboard → SQL Editor → New query), in order:

### 1. `sql/migrations/add_concierge_columns.sql`

Adds `status`, `reply`, `last_activity`, and `conversation_open` columns to the existing `concierge` table; creates `idx_concierge_created_at` and `idx_concierge_status` indexes.

### 2. `sql/migrations/add_concierge_messages.sql`

Creates the `public.concierge_messages` table (threaded messages) and adds `idx_concierge_messages_concierge_id_created_at` index.

Both scripts are idempotent (`IF NOT EXISTS`) and safe to re-run.

---

## Netlify Functions

| Endpoint | Method | Description |
|---|---|---|
| `/.netlify/functions/admin-concierge-messages` | GET `?concierge_id=<id>` | Returns all thread messages for a conversation |
| `/.netlify/functions/admin-concierge-messages` | POST `{ concierge_id, sender, body, metadata? }` | Posts a new message to the thread |
| `/.netlify/functions/admin-concierge` | PATCH `{ id, status?, reply? }` | Updates concierge status (Resolve / Archive / Reopen) |
| `/.netlify/functions/admin-concierge` | DELETE `?id=<id>` | Deletes a concierge entry |
| `/.netlify/functions/ai-suggest` | POST `{ message, context? }` | Returns `{ suggestions: string[] }` — 3 AI follow-up questions |

---

## Testing Steps

1. Run both SQL migrations in the Supabase SQL Editor.
2. Ensure Netlify env vars are set (`OPENAI_API_KEY` or `FHJAI`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
3. Push the branch and let Netlify deploy (or run `netlify dev` locally).
4. Open **Admin → Concierge Inbox**, select a message.
5. Click **Suggest** — three AI follow-up question chips should appear.
6. Click a suggestion chip to populate the composer, then click **Send**.
7. Verify the `concierge_messages` table in Supabase has the new row and the parent `concierge` row has an updated `last_activity` / `conversation_open = true`.
8. Test **Resolve**, **Archive**, **Reopen**, and **Delete** buttons to confirm status changes and deletion via `admin-concierge` PATCH/DELETE.
