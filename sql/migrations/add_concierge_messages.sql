-- sql/migrations/add_concierge_messages.sql
-- Creates the public.concierge_messages table for threaded conversations.
-- Safe to run multiple times (uses IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS public.concierge_messages (
  id            uuid          NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  concierge_id  uuid          NOT NULL REFERENCES public.concierge(id) ON DELETE CASCADE,
  sender        text          NOT NULL,         -- 'admin' | 'client' | sender name
  body          text          NOT NULL,
  metadata      jsonb         NOT NULL DEFAULT '{}'::jsonb,
  delivered     boolean       NOT NULL DEFAULT false,
  created_at    timestamptz   NOT NULL DEFAULT now()
);

-- Index for efficient per-conversation queries ordered by time
CREATE INDEX IF NOT EXISTS idx_concierge_messages_concierge_id_created_at
  ON public.concierge_messages (concierge_id, created_at ASC);

-- Ensure last_activity and conversation_open columns exist on parent table
-- (these may already exist from add_concierge_columns.sql)
ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS last_activity timestamptz;

ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS conversation_open boolean NOT NULL DEFAULT false;
