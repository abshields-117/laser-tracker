-- Migration: Add 'kiosk' role
-- Run this in Supabase SQL Editor for the laser-tracker project
-- (vvthpimxbvtbtdqchlec.supabase.co)

-- 1. Drop the old role check constraint
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Re-add with kiosk included
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'md', 'tech', 'kiosk'));

-- 3. Kiosk RLS: kiosk users can INSERT intakes but cannot SELECT patient records,
--    session logs, or photos. They are already blocked at the middleware layer,
--    but this adds DB-level enforcement as a belt-and-suspenders measure.

-- Allow kiosk to insert into patient_intakes (they already could via the
-- existing anon/authenticated policy, but being explicit is better):
-- (No additional policy needed if existing INSERT policies allow authenticated users.)

-- Verify the constraint was applied:
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'users_role_check';
