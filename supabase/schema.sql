-- ============================================================
--  FHJ DREAM DESTINATIONS — Complete Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
--  Execute all at once (safe to re-run — uses IF NOT EXISTS)
-- ============================================================


-- ============================================================
-- SECTION 1: EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- SECTION 2: CORE TABLES
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
-- One row per user (clients, admin, managers, employees)
-- Automatically created via trigger when a Supabase auth user signs up
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             TEXT NOT NULL,
  full_name         TEXT,
  phone             TEXT,
  role              TEXT NOT NULL DEFAULT 'client'
                      CHECK (role IN ('admin', 'manager', 'employee', 'client')),
  tier              TEXT DEFAULT 'Silver'
                      CHECK (tier IN ('Silver', 'Gold', 'Platinum')),
  approved          BOOLEAN DEFAULT FALSE,
  -- Travel profile
  dob               DATE,
  passport_num      TEXT,
  nationality       TEXT,
  address           TEXT,
  city              TEXT,
  state             TEXT,
  zip               TEXT,
  country           TEXT,
  -- Preferences
  dietary_reqs      TEXT,
  medical_needs     TEXT,
  preferred_contact TEXT,
  -- Emergency contact
  emergency_name    TEXT,
  emergency_phone   TEXT,
  emergency_relation TEXT,
  -- Stats (updated by triggers or admin)
  total_spent       NUMERIC(10,2) DEFAULT 0,
  trips_count       INTEGER DEFAULT 0,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── deals ────────────────────────────────────────────────────
-- Travel packages shown on the home/deals page
CREATE TABLE IF NOT EXISTS deals (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  destination   TEXT,
  price         TEXT,                -- e.g. "$2,499" stored as text for flexibility
  duration      TEXT,                -- e.g. "7 nights"
  category      TEXT,                -- cruise, beach, safari, europe, etc.
  description   TEXT,
  image         TEXT,                -- emoji char or image URL
  featured      BOOLEAN DEFAULT FALSE,
  active        BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── events ───────────────────────────────────────────────────
-- Private group celebrations & travel events with RSVP links
CREATE TABLE IF NOT EXISTS events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  date        DATE,
  time        TEXT,                  -- e.g. "7:00 PM"
  location    TEXT,
  capacity    INTEGER DEFAULT 50,
  active      BOOLEAN DEFAULT TRUE,
  -- Private event fields (added for RSVP link system)
  occasion    TEXT,                  -- Anniversary, Birthday, Wedding, etc.
  hosted_by   TEXT,                  -- Primary client name
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── event_rsvps ──────────────────────────────────────────────
-- RSVPs submitted via public link OR client portal
CREATE TABLE IF NOT EXISTS event_rsvps (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id       UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,  -- nullable for public RSVPs
  -- Public RSVP fields (filled when using the shareable link)
  name           TEXT,
  email          TEXT,
  phone          TEXT,
  party_size     INTEGER DEFAULT 1,
  dietary_needs  TEXT,
  message        TEXT,
  source         TEXT DEFAULT 'portal'
                   CHECK (source IN ('portal', 'public_link')),
  status         TEXT DEFAULT 'confirmed'
                   CHECK (status IN ('confirmed', 'waitlist', 'cancelled')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── appointments ─────────────────────────────────────────────
-- Consultation appointments booked via the calendar
CREATE TABLE IF NOT EXISTS appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  email       TEXT,
  phone       TEXT,
  date        DATE NOT NULL,
  time        TEXT NOT NULL,
  type        TEXT DEFAULT 'Consultation'
                CHECK (type IN ('Consultation','Trip Planning','Intake','Follow-Up','VIP Meeting')),
  notes       TEXT,
  status      TEXT DEFAULT 'Pending'
                CHECK (status IN ('Pending','Confirmed','Cancelled','Completed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── appointment_requests ─────────────────────────────────────
-- Public appointment requests (from book-appointment page, pre-login)
CREATE TABLE IF NOT EXISTS appointment_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  date        TEXT NOT NULL,
  time        TEXT NOT NULL,
  type        TEXT DEFAULT 'Consultation',
  notes       TEXT,
  status      TEXT DEFAULT 'Pending'
                CHECK (status IN ('Pending','Confirmed','Cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── blocked_dates ────────────────────────────────────────────
-- Dates blocked by admin — no appointments can be booked
CREATE TABLE IF NOT EXISTS blocked_dates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date       DATE NOT NULL UNIQUE,
  reason     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── availability_settings ────────────────────────────────────
-- Which days of the week and hours are available for booking
CREATE TABLE IF NOT EXISTS availability_settings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week  INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
               -- 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  start_time   TIME NOT NULL DEFAULT '09:00',
  end_time     TIME NOT NULL DEFAULT '17:00',
  active       BOOLEAN DEFAULT TRUE,
  UNIQUE(day_of_week)
);

-- ── bookings ─────────────────────────────────────────────────
-- Confirmed/pending trip bookings managed by admin
CREATE TABLE IF NOT EXISTS bookings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_name      TEXT NOT NULL,
  package_name     TEXT NOT NULL,
  destination      TEXT,
  travel_date      DATE,
  return_date      DATE,
  group_size       INTEGER DEFAULT 1,
  budget           TEXT,
  accommodation    TEXT,
  value            NUMERIC(10,2),    -- booking value in USD
  status           TEXT DEFAULT 'Pending'
                     CHECK (status IN ('Pending','Deposit Paid','Confirmed','Completed','Cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── group_trips ──────────────────────────────────────────────
-- Public group trip packages (cruises, resort blocks, etc.)
CREATE TABLE IF NOT EXISTS group_trips (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  destination TEXT,
  date        DATE,
  spots       INTEGER DEFAULT 20,
  booked      INTEGER DEFAULT 0,
  price       TEXT,
  status      TEXT DEFAULT 'Open'
                CHECK (status IN ('Open','Sold Out','Waitlist','Coming Soon')),
  description TEXT,
  image       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── intake_requests ──────────────────────────────────────────
-- Client intake forms submitted from the public /book page
CREATE TABLE IF NOT EXISTS intake_requests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT,
  dob                 DATE,
  address             TEXT,
  city                TEXT,
  state               TEXT,
  zip                 TEXT,
  country             TEXT,
  passport_num        TEXT,
  nationality         TEXT,
  -- Trip details
  destination         TEXT,
  travel_dates        TEXT,
  return_date         TEXT,
  group_size          INTEGER,
  budget              TEXT,
  accommodation       TEXT,
  special_occasion    TEXT,
  experience_types    TEXT[],
  -- Health & preferences
  dietary_reqs        TEXT,
  medical_needs       TEXT,
  preferred_contact   TEXT,
  -- Emergency contact
  emergency_name      TEXT,
  emergency_phone     TEXT,
  emergency_relation  TEXT,
  -- Meta
  heard_from          TEXT,
  notes               TEXT,
  status              TEXT DEFAULT 'Pending'
                        CHECK (status IN ('Pending','Approved','Rejected')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── messages ─────────────────────────────────────────────────
-- Direct messages between admin and clients
CREATE TABLE IF NOT EXISTS messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  read         BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── site_content ─────────────────────────────────────────────
-- CMS: all editable website content (footer, hero, nav, about page)
CREATE TABLE IF NOT EXISTS site_content (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section     TEXT UNIQUE NOT NULL,
  -- Sections: 'footer', 'hero', 'nav', 'about_story',
  --           'about_mission', 'about_values', 'about_milestones'
  content     JSONB NOT NULL DEFAULT '{}',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- SECTION 2b: ENSURE UNIQUE INDEXES EXIST
-- (Safe to run even if tables already exist without constraints)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_availability_day_of_week
  ON availability_settings(day_of_week);

CREATE UNIQUE INDEX IF NOT EXISTS idx_site_content_section
  ON site_content(section);

-- ============================================================
-- SECTION 3: DEFAULT DATA
-- ============================================================

-- Default availability: Monday–Friday 9AM–5PM
-- Using WHERE NOT EXISTS to avoid ON CONFLICT issues if constraint doesn't exist yet
INSERT INTO availability_settings (day_of_week, start_time, end_time, active)
  SELECT d, '09:00'::TIME, '17:00'::TIME, TRUE
  FROM unnest(ARRAY[1,2,3,4,5]) AS d
  WHERE NOT EXISTS (
    SELECT 1 FROM availability_settings WHERE day_of_week = d
  );

-- Default footer content (matches hardcoded defaults in Footer.tsx)
INSERT INTO site_content (section, content)
  SELECT 'footer', '{
    "email": "info@fhjdreamdestinations.com",
    "phone": "484-541-3573",
    "location": "Tri-State Area",
    "hours": "Mon – Fri: 9AM – 7PM · Sat: 10AM – 4PM",
    "tagline": "Crafting extraordinary journeys, curated with intention — since 2011.",
    "facebook": "",
    "instagram": "",
    "tiktok": ""
  }'::JSONB
  WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE section = 'footer');


-- ============================================================
-- SECTION 4: INDEXES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role        ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email       ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_approved    ON profiles(approved);
CREATE INDEX IF NOT EXISTS idx_deals_active         ON deals(active);
CREATE INDEX IF NOT EXISTS idx_deals_featured       ON deals(featured);
CREATE INDEX IF NOT EXISTS idx_events_active        ON events(active);
CREATE INDEX IF NOT EXISTS idx_events_date          ON events(date);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event    ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_client   ON event_rsvps(client_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_email    ON event_rsvps(email);
CREATE INDEX IF NOT EXISTS idx_appointments_date    ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_client  ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client      ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status      ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_intake_status        ON intake_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_sender      ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient   ON messages(recipient_id);


-- ============================================================
-- SECTION 5: TRIGGER — Auto-create profile on auth signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    -- Auto-approve if invited by admin (has role set), otherwise pending
    CASE WHEN NEW.raw_user_meta_data->>'role' IN ('admin','manager','employee') THEN TRUE
         WHEN NEW.raw_user_meta_data->>'source' = 'rsvp' THEN TRUE
         ELSE FALSE
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- SECTION 6: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps           ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates         ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_trips           ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content          ENABLE ROW LEVEL SECURITY;

-- ── Helper function: check if current user is admin/manager/employee ──
CREATE OR REPLACE FUNCTION is_admin_role()
RETURNS BOOLEAN
LANGUAGE sql STABLE
SECURITY DEFINER                 -- bypass RLS to prevent circular dependency
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'employee')
  );
$$;

-- ── profiles ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users read own profile"     ON profiles;
DROP POLICY IF EXISTS "Users update own profile"   ON profiles;
DROP POLICY IF EXISTS "Admins read all profiles"   ON profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON profiles;

-- Each user can read their own row; admins can read all (handled by separate policy)
CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT
  USING (is_admin_role());

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin_role());

CREATE POLICY "Admins insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin_role());

-- ── deals ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read active deals"  ON deals;
DROP POLICY IF EXISTS "Admins manage deals"       ON deals;

CREATE POLICY "Public read active deals"
  ON deals FOR SELECT
  USING (active = TRUE OR is_admin_role());

CREATE POLICY "Admins manage deals"
  ON deals FOR ALL
  USING (is_admin_role());

-- ── events ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read active events" ON events;
DROP POLICY IF EXISTS "Admins manage events"      ON events;

CREATE POLICY "Public read active events"
  ON events FOR SELECT
  USING (active = TRUE OR is_admin_role());

CREATE POLICY "Admins manage events"
  ON events FOR ALL
  USING (is_admin_role());

-- ── event_rsvps ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Public insert rsvps"       ON event_rsvps;
DROP POLICY IF EXISTS "Clients read own rsvps"    ON event_rsvps;
DROP POLICY IF EXISTS "Admins manage rsvps"       ON event_rsvps;

CREATE POLICY "Public insert rsvps"
  ON event_rsvps FOR INSERT
  WITH CHECK (TRUE);   -- allow unauthenticated (API uses service role)

CREATE POLICY "Clients read own rsvps"
  ON event_rsvps FOR SELECT
  USING (client_id = auth.uid() OR is_admin_role());

CREATE POLICY "Admins manage rsvps"
  ON event_rsvps FOR ALL
  USING (is_admin_role());

-- ── appointments ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Clients read own appointments"  ON appointments;
DROP POLICY IF EXISTS "Admins manage appointments"     ON appointments;

CREATE POLICY "Clients read own appointments"
  ON appointments FOR SELECT
  USING (client_id = auth.uid() OR is_admin_role());

CREATE POLICY "Admins manage appointments"
  ON appointments FOR ALL
  USING (is_admin_role());

-- ── appointment_requests ──────────────────────────────────────
DROP POLICY IF EXISTS "Public insert appointment requests" ON appointment_requests;
DROP POLICY IF EXISTS "Admins manage appointment requests" ON appointment_requests;

CREATE POLICY "Public insert appointment requests"
  ON appointment_requests FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins manage appointment requests"
  ON appointment_requests FOR ALL
  USING (is_admin_role());

-- ── blocked_dates ─────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read blocked dates"  ON blocked_dates;
DROP POLICY IF EXISTS "Admins manage blocked dates" ON blocked_dates;

CREATE POLICY "Public read blocked dates"
  ON blocked_dates FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage blocked dates"
  ON blocked_dates FOR ALL
  USING (is_admin_role());

-- ── availability_settings ─────────────────────────────────────
DROP POLICY IF EXISTS "Public read availability"  ON availability_settings;
DROP POLICY IF EXISTS "Admins manage availability" ON availability_settings;

CREATE POLICY "Public read availability"
  ON availability_settings FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage availability"
  ON availability_settings FOR ALL
  USING (is_admin_role());

-- ── bookings ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Clients read own bookings"  ON bookings;
DROP POLICY IF EXISTS "Admins manage bookings"     ON bookings;

CREATE POLICY "Clients read own bookings"
  ON bookings FOR SELECT
  USING (client_id = auth.uid() OR is_admin_role());

CREATE POLICY "Admins manage bookings"
  ON bookings FOR ALL
  USING (is_admin_role());

-- ── group_trips ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read group trips"  ON group_trips;
DROP POLICY IF EXISTS "Admins manage group trips" ON group_trips;

CREATE POLICY "Public read group trips"
  ON group_trips FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage group trips"
  ON group_trips FOR ALL
  USING (is_admin_role());

-- ── intake_requests ───────────────────────────────────────────
DROP POLICY IF EXISTS "Public insert intake"     ON intake_requests;
DROP POLICY IF EXISTS "Admins manage intake"     ON intake_requests;

CREATE POLICY "Public insert intake"
  ON intake_requests FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins manage intake"
  ON intake_requests FOR ALL
  USING (is_admin_role());

-- ── messages ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Participants read messages"  ON messages;
DROP POLICY IF EXISTS "Participants send messages"  ON messages;
DROP POLICY IF EXISTS "Admins manage messages"      ON messages;

CREATE POLICY "Participants read messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid() OR is_admin_role());

CREATE POLICY "Participants send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() OR is_admin_role());

CREATE POLICY "Admins manage messages"
  ON messages FOR ALL
  USING (is_admin_role());

-- ── site_content ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read site content"  ON site_content;
DROP POLICY IF EXISTS "Admins manage site content" ON site_content;

CREATE POLICY "Public read site content"
  ON site_content FOR SELECT
  USING (TRUE);

CREATE POLICY "Admins manage site content"
  ON site_content FOR ALL
  USING (is_admin_role());


-- ============================================================
-- SECTION 7: GRANT PERMISSIONS
-- ============================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON deals, events, blocked_dates, availability_settings, site_content, group_trips TO anon;
GRANT INSERT ON event_rsvps, appointment_requests, intake_requests TO anon;


-- ============================================================
-- DONE ✓
-- All 12 tables created with indexes, RLS, and triggers.
-- ============================================================

