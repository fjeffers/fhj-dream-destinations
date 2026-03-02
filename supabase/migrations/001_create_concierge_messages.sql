-- Migration: 001_create_concierge_messages
-- Ensure the concierge_messages table exists for threaded admin conversations.

CREATE TABLE IF NOT EXISTS concierge_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concierge_id UUID NOT NULL REFERENCES concierge(id) ON DELETE CASCADE,
  sender      TEXT NOT NULL,
  body        TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS concierge_messages_concierge_id_idx
  ON concierge_messages (concierge_id);
