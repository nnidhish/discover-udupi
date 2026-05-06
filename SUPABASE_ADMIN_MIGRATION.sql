-- Admin access + trip cover images migration
-- Run this in Supabase SQL Editor

-- 1. Add is_admin column to profiles (defaults to false for all users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- To grant admin access to a user, find their UUID in Auth > Users, then run:
--   UPDATE profiles SET is_admin = TRUE WHERE id = '<user-uuid>';
-- To revoke:
--   UPDATE profiles SET is_admin = FALSE WHERE id = '<user-uuid>';


-- 2. Create the trip-covers storage bucket (run this too)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-covers', 'trip-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on trip-covers
CREATE POLICY "Public read trip covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-covers');

-- Allow authenticated admins to upload/delete
CREATE POLICY "Admin upload trip covers" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'trip-covers'
    AND (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin delete trip covers" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'trip-covers'
    AND (SELECT is_admin FROM profiles WHERE id = auth.uid())
  );
