-- sql/migrations/add_concierge_columns.sql
-- Ensures required columns and indexes exist on the public.concierge table.
-- Safe to run multiple times (uses IF NOT EXISTS / DO $$ patterns).

-- Add status column if missing
ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'New';

-- Add reply column if missing
ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS reply text;

-- Add last_activity column if missing
ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS last_activity timestamptz;

-- Add conversation_open column if missing
ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS conversation_open boolean NOT NULL DEFAULT false;

-- Index on created_at for fast ordering
CREATE INDEX IF NOT EXISTS idx_concierge_created_at
  ON public.concierge (created_at DESC);

-- Index on status for filter queries
CREATE INDEX IF NOT EXISTS idx_concierge_status
  ON public.concierge (status);
