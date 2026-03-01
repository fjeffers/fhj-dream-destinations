-- =============================================================
-- Migration: fix_service_role_rls
-- Purpose:   Fix "new row violates row-level security policy"
--            errors that occur when the Netlify backend functions
--            try to INSERT/UPDATE/DELETE rows in any table.
--
-- Root cause: Every table created in Supabase has RLS enabled by
-- default.  The backend functions must use the service_role key
-- (not the anon/public key) to bypass RLS automatically.  If the
-- wrong key is loaded, all writes fail with an RLS violation.
--
-- This migration adds an explicit belt-and-suspenders policy on
-- every table accessed by the backend functions, granting the
-- service_role full CRUD access.  This is safe because:
--   • service_role is only used by the Netlify server-side functions.
--   • All browser clients use the anon/public key, which is NOT
--     covered by these policies, so direct client access remains
--     blocked for sensitive tables (admins, clients, etc.).
--
-- Run once in the Supabase SQL Editor.
-- Re-running is safe – all DROP/CREATE steps are idempotent.
-- =============================================================

-- ── Helper macro ────────────────────────────────────────────
-- We apply the same two operations to every table:
--   1. ENABLE ROW LEVEL SECURITY so that all non-service_role
--      requests are subject to the policies below.
--   2. CREATE the service_role policy granting full CRUD.

-- ── about_page ──────────────────────────────────────────────
ALTER TABLE IF EXISTS public.about_page ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.about_page;
CREATE POLICY "service_role_full_access"
  ON public.about_page FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── admins (the original trigger for this migration) ────────
ALTER TABLE IF EXISTS public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admins_allow_all"           ON public.admins;
DROP POLICY IF EXISTS "admins_restrict_all"        ON public.admins;
DROP POLICY IF EXISTS "allow_backend_access"       ON public.admins;
DROP POLICY IF EXISTS "service_role_full_access"   ON public.admins;
CREATE POLICY "service_role_full_access"
  ON public.admins FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── audit_log ───────────────────────────────────────────────
ALTER TABLE IF EXISTS public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.audit_log;
CREATE POLICY "service_role_full_access"
  ON public.audit_log FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── blocked_slots ───────────────────────────────────────────
ALTER TABLE IF EXISTS public.blocked_slots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.blocked_slots;
CREATE POLICY "service_role_full_access"
  ON public.blocked_slots FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── bookings ────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.bookings;
CREATE POLICY "service_role_full_access"
  ON public.bookings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── client_login ────────────────────────────────────────────
ALTER TABLE IF EXISTS public.client_login ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.client_login;
CREATE POLICY "service_role_full_access"
  ON public.client_login FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── clients ─────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.clients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.clients;
CREATE POLICY "service_role_full_access"
  ON public.clients FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── concierge ───────────────────────────────────────────────
ALTER TABLE IF EXISTS public.concierge ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.concierge;
CREATE POLICY "service_role_full_access"
  ON public.concierge FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── concierge_messages ──────────────────────────────────────
ALTER TABLE IF EXISTS public.concierge_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.concierge_messages;
CREATE POLICY "service_role_full_access"
  ON public.concierge_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── deals ───────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.deals;
CREATE POLICY "service_role_full_access"
  ON public.deals FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── documents ───────────────────────────────────────────────
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.documents;
CREATE POLICY "service_role_full_access"
  ON public.documents FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── events ──────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.events;
CREATE POLICY "service_role_full_access"
  ON public.events FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── payments ────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.payments;
CREATE POLICY "service_role_full_access"
  ON public.payments FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── rsvps ───────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.rsvps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.rsvps;
CREATE POLICY "service_role_full_access"
  ON public.rsvps FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- ── trips ───────────────────────────────────────────────────
ALTER TABLE IF EXISTS public.trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_full_access" ON public.trips;
CREATE POLICY "service_role_full_access"
  ON public.trips FOR ALL TO service_role
  USING (true) WITH CHECK (true);
