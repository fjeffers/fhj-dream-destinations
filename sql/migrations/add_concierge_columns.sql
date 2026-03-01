-- Migration: add_concierge_columns.sql
-- Ensures the concierge table has status, reply, last_activity, and conversation_open columns,
-- plus useful indexes.

ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS reply text,
  ADD COLUMN IF NOT EXISTS last_activity timestamptz,
  ADD COLUMN IF NOT EXISTS conversation_open boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_concierge_created_at ON public.concierge (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_concierge_status ON public.concierge (status);
