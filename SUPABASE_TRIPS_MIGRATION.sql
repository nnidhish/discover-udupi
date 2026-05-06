-- ==========================================================
-- Discover Udupi — Trips Feature Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ==========================================================

-- 1. Add is_admin flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  theme TEXT NOT NULL CHECK (theme IN ('temple_trail','beach_hopping','foodie_tour','nature','mixed')),
  duration_label TEXT NOT NULL,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trip stops (ordered list of location IDs per trip)
CREATE TABLE IF NOT EXISTS trip_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  location_id INTEGER NOT NULL,
  stop_order INTEGER NOT NULL,
  tip TEXT,
  UNIQUE(trip_id, stop_order)
);

-- 4. RLS on trips
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published trips"
  ON trips FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admin full access trips"
  ON trips FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- 5. RLS on trip_stops
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stops of published trips"
  ON trip_stops FOR SELECT
  USING (EXISTS (SELECT 1 FROM trips WHERE id = trip_id AND is_published = TRUE));

CREATE POLICY "Admin full access trip_stops"
  ON trip_stops FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- ==========================================================
-- After running, mark yourself as admin:
--   UPDATE profiles SET is_admin = TRUE WHERE id = '<your-user-id>';
-- Your user ID is in Supabase > Authentication > Users
-- ==========================================================
