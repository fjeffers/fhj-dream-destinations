-- ============================================================
-- FHJ DREAM DESTINATIONS — SUPABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('admin', 'client')),
  tier text default 'Silver' check (tier in ('Silver', 'Gold', 'Platinum')),
  passport_num text,
  dob date,
  address text,
  city text,
  state text,
  zip text,
  country text,
  nationality text,
  dietary_reqs text,
  medical_needs text,
  preferred_contact text default 'email',
  emergency_name text,
  emergency_phone text,
  emergency_relation text,
  notes text,
  total_spent numeric default 0,
  trips_count integer default 0,
  approved boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- DEALS
create table if not exists public.deals (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  destination text not null,
  price text not null,
  duration text not null,
  category text not null,
  description text,
  image text default '✈️',
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- EVENTS
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date date not null,
  time text,
  location text,
  capacity integer default 50,
  exclusive boolean default true,
  active boolean default true,
  created_at timestamptz default now()
);

-- EVENT RSVPS
create table if not exists public.event_rsvps (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade,
  client_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(event_id, client_id)
);

-- GROUP TRIPS
create table if not exists public.group_trips (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  destination text not null,
  date date,
  spots integer default 12,
  booked integer default 0,
  price text,
  status text default 'Open' check (status in ('Open', 'Sold Out', 'Waitlist')),
  description text,
  created_at timestamptz default now()
);

-- APPOINTMENTS
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete set null,
  client_name text not null,
  date date not null,
  time text not null,
  type text default 'Consultation' check (type in ('Consultation', 'Trip Planning', 'Intake', 'Follow-Up', 'VIP Meeting')),
  notes text,
  status text default 'Pending' check (status in ('Pending', 'Confirmed', 'Cancelled')),
  blocked boolean default false,
  created_at timestamptz default now()
);

-- BLOCKED DATES
create table if not exists public.blocked_dates (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  reason text,
  created_at timestamptz default now()
);

-- BOOKINGS
create table if not exists public.bookings (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references public.profiles(id) on delete set null,
  client_name text not null,
  package_name text not null,
  travel_date date,
  return_date date,
  group_size integer default 1,
  budget text,
  accommodation text,
  special_occasion text,
  experience_types text[],
  destination text,
  value numeric,
  status text default 'Pending' check (status in ('Pending', 'Deposit Paid', 'Confirmed', 'Completed', 'Cancelled')),
  notes text,
  created_at timestamptz default now()
);

-- INTAKE REQUESTS (pending approval)
create table if not exists public.intake_requests (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  dob date,
  address text,
  city text,
  state text,
  zip text,
  country text,
  passport_num text,
  nationality text,
  destination text,
  travel_dates date,
  return_date date,
  group_size integer default 1,
  budget text,
  accommodation text,
  special_occasion text,
  experience_types text[],
  dietary_reqs text,
  medical_needs text,
  preferred_contact text,
  emergency_name text,
  emergency_phone text,
  emergency_relation text,
  heard_from text,
  notes text,
  status text default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at timestamptz default now()
);

-- MESSAGES (concierge)
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.deals enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.group_trips enable row level security;
alter table public.appointments enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.bookings enable row level security;
alter table public.intake_requests enable row level security;
alter table public.messages enable row level security;

-- PROFILES policies
create policy "Public profiles viewable by owner" on public.profiles for select using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can update any profile" on public.profiles for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admins can insert profiles" on public.profiles for insert with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Allow profile creation on signup" on public.profiles for insert with check (auth.uid() = id);

-- DEALS policies (public read, admin write)
create policy "Deals are publicly readable" on public.deals for select using (true);
create policy "Admins can manage deals" on public.deals for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- EVENTS policies
create policy "Active events readable by approved clients" on public.events for select using (active = true);
create policy "Admins can manage events" on public.events for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- RSVP policies
create policy "Clients can manage own RSVPs" on public.event_rsvps for all using (auth.uid() = client_id);
create policy "Admins can view all RSVPs" on public.event_rsvps for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- GROUP TRIPS
create policy "Group trips publicly readable" on public.group_trips for select using (true);
create policy "Admins can manage group trips" on public.group_trips for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- APPOINTMENTS
create policy "Clients can view own appointments" on public.appointments for select using (auth.uid() = client_id);
create policy "Admins can manage all appointments" on public.appointments for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- BLOCKED DATES
create policy "Blocked dates publicly readable" on public.blocked_dates for select using (true);
create policy "Admins can manage blocked dates" on public.blocked_dates for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- BOOKINGS
create policy "Clients can view own bookings" on public.bookings for select using (auth.uid() = client_id);
create policy "Admins can manage all bookings" on public.bookings for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- INTAKE REQUESTS
create policy "Anyone can submit intake" on public.intake_requests for insert with check (true);
create policy "Admins can manage intake requests" on public.intake_requests for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- MESSAGES
create policy "Users can view own messages" on public.messages for select using (auth.uid() = sender_id or auth.uid() = recipient_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Admins can view all messages" on public.messages for select using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client'),
    case when coalesce(new.raw_user_meta_data->>'role', 'client') = 'admin' then true else false end
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger deals_updated_at before update on public.deals for each row execute procedure public.handle_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

insert into public.deals (title, destination, price, duration, category, description, image, featured) values
  ('Maldives Private Island Escape', 'Maldives', '$8,900', '7 Nights', 'Island Retreat', 'Exclusive overwater villa with butler service, private beach, and sunset dining.', '🏝️', true),
  ('Amalfi Coast Villa Experience', 'Italy', '$6,500', '5 Nights', 'Cultural Journey', 'Perched cliffside villa overlooking turquoise waters with private chef.', '🇮🇹', true),
  ('Safari & Champagne – Serengeti', 'Tanzania', '$9,800', '8 Nights', 'Adventure', 'Luxury tented camp with private game drives and sundowner experiences.', '🦁', true),
  ('Bora Bora Honeymoon Suite', 'French Polynesia', '$12,400', '10 Nights', 'Romance', 'Two-story overwater bungalow with glass floor panels and infinity plunge pool.', '🌺', false)
on conflict do nothing;

insert into public.events (title, description, date, time, location, capacity, exclusive) values
  ('Luxury Yacht Gala – Miami', 'An exclusive evening aboard a private superyacht with live jazz and gourmet dining.', '2026-04-15', '7:00 PM', 'Port of Miami', 60, true),
  ('Private Wine Tasting – Napa Valley', 'Curated tasting of reserve vintages with the estate sommelier.', '2026-05-08', '3:00 PM', 'Napa Valley, CA', 30, true),
  ('Group Safari Kickoff – Nairobi', 'Pre-departure group orientation and welcome dinner.', '2026-06-20', '9:00 AM', 'Nairobi, Kenya', 20, false)
on conflict do nothing;

insert into public.group_trips (name, destination, date, spots, booked, price, status) values
  ('Santorini Luxury Group Retreat', 'Greece', '2026-07-10', 12, 8, '$4,200/pp', 'Open'),
  ('Northern Lights Iceland Adventure', 'Iceland', '2026-01-15', 16, 16, '$5,800/pp', 'Sold Out')
on conflict do nothing;
