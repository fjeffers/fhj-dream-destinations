-- Migration: add_concierge_messages.sql
-- Creates the concierge_messages table for threaded conversations.

CREATE TABLE IF NOT EXISTS public.concierge_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  concierge_id    uuid NOT NULL REFERENCES public.concierge(id) ON DELETE CASCADE,
  sender          text NOT NULL,
  body            text NOT NULL,
  metadata        jsonb NOT NULL DEFAULT '{}',
  delivered       boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_concierge_messages_concierge_id_created_at
  ON public.concierge_messages (concierge_id, created_at ASC);
