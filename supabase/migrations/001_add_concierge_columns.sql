-- Migration: Add missing columns to concierge and concierge_messages tables
-- Run this in Supabase SQL Editor if columns don't exist yet

-- concierge table: add missing columns
ALTER TABLE public.concierge
  ADD COLUMN IF NOT EXISTS phone text DEFAULT '',
  ADD COLUMN IF NOT EXISTS context text DEFAULT '',
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS conversation_open boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_activity timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS reply text DEFAULT '';

-- concierge_messages table: add created_at column
ALTER TABLE public.concierge_messages
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Update existing concierge rows to have a default status
UPDATE public.concierge SET status = 'New' WHERE status IS NULL;
UPDATE public.concierge SET created_at = now() WHERE created_at IS NULL;
UPDATE public.concierge SET last_activity = now() WHERE last_activity IS NULL;
