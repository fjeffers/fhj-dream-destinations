# FHJ Dream Destinations

FHJ Dream Destinations is a travel platform built with React + Vite on the frontend and Netlify serverless functions on the backend, backed by Supabase (PostgreSQL).

## Environment Variables

Set the following variables in your Netlify site settings (or in a local `.env` file for development):

| Variable | Required | Description |
|---|---|---|
| `SUPABASE_URL` | ✅ | Your Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service-role key (server-side only — never expose to the browser) |
| `OPENAI_API_KEY` | ✅ (for AI suggestions) | OpenAI API key used by `ai-suggest` function. Alternatively, set `FHJAI` (the legacy FHJ AI key alias used by this platform) — `OPENAI_API_KEY` takes precedence if both are set. |
| `RESEND_API_KEY` | Optional | [Resend](https://resend.com) API key for transactional email |

> **Security note:** `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` must only be set as server-side (build/function) environment variables in Netlify. Never expose them in the browser bundle.

## Database Migrations

SQL migration files are stored in `sql/migrations/`. Run them in order inside the Supabase SQL Editor:

1. `add_concierge_columns.sql` — adds `status`, `reply`, `last_activity`, and `conversation_open` columns to the `concierge` table, plus indexes.
2. `add_concierge_messages.sql` — creates the `concierge_messages` table for threaded conversations.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
