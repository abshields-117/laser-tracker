-- Applied directly to production Supabase on 2026-07-03.
-- Fixes a PHI exposure gap found during the Fable 5 full-app review (PR #6):
-- the "All staff can view patients" policy allowed ANY authenticated user
-- (including the kiosk account) to SELECT every column of every patient row,
-- regardless of what columns the app's UI actually queries for. App-level
-- select() column narrowing added in PR #6 is not a substitute for RLS.
--
-- Role coverage after this change:
--   admin/md -> "Admins and MDs can view all patients"
--   tech     -> "All staff can view all patients" (role-checked, not blanket)
--   kiosk    -> "Kiosk can view patients for resign lookup" (new, this file)

BEGIN;

DROP POLICY IF EXISTS "All staff can view patients" ON public.patients;

CREATE POLICY "Kiosk can view patients for resign lookup"
ON public.patients
FOR SELECT
USING (get_user_role() = 'kiosk');

COMMIT;
