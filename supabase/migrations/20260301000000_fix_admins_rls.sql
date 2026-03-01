-- =============================================================
-- Migration: fix_admins_rls
-- Purpose:   Fix "new row violates row-level security policy
--            for table admins" when adding/removing admin users.
--
-- Root cause: The admins table has RLS enabled but no explicit
-- policy grants INSERT / UPDATE / DELETE to the service_role.
-- While the service_role key *should* bypass RLS automatically,
-- some Supabase project configurations require an explicit policy.
--
-- This migration:
--   1. Ensures RLS is enabled on the admins table.
--   2. Drops any blanket-deny policies that override the
--      service_role bypass.
--   3. Creates an explicit policy that grants full CRUD access
--      to the service_role (backend Netlify functions).
--   4. Denies direct access from the anon / authenticated roles
--      so no unauthenticated client can read or modify admins.
-- =============================================================

-- Step 1: Enable RLS (idempotent – safe to run even if already on)
ALTER TABLE IF EXISTS public.admins ENABLE ROW LEVEL SECURITY;

-- Step 2: Remove any existing conflicting policies
DROP POLICY IF EXISTS "admins_allow_all"           ON public.admins;
DROP POLICY IF EXISTS "admins_restrict_all"        ON public.admins;
DROP POLICY IF EXISTS "allow_backend_access"       ON public.admins;
DROP POLICY IF EXISTS "service_role_full_access"   ON public.admins;
DROP POLICY IF EXISTS "anon_deny_admins"           ON public.admins;

-- Step 3: Grant full CRUD to the service_role
--   The backend Netlify functions use the service_role key, so they
--   will match this policy.  Direct browser clients (anon / authenticated)
--   will NOT match, keeping the table private.
CREATE POLICY "service_role_full_access"
  ON public.admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
