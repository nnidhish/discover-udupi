-- Add narrative field and make location_id nullable for text-only blocks
-- Run this in Supabase SQL Editor

ALTER TABLE trip_stops ADD COLUMN IF NOT EXISTS narrative TEXT;
ALTER TABLE trip_stops ALTER COLUMN location_id DROP NOT NULL;
