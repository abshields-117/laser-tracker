-- Migration: Fix RLS policies so all staff roles see all patient records
-- Context: Early sessions were logged under info@harlanesthetics.com (now kiosk role).
--          Jocelyn's tech account couldn't see those records due to assigned_tech_id filtering.
--          Small clinic design decision: all staff see all patients (no per-tech isolation needed).
-- Date: 2026-06-30

-- Remove restrictive tech-scoped policies
DROP POLICY IF EXISTS "Techs can view their assigned patients" ON public.patients;
DROP POLICY IF EXISTS "Techs can view their assigned plans" ON public.treatment_plans;
DROP POLICY IF EXISTS "Techs can view treatments for assigned patients" ON public.treatments;

-- All authenticated staff (tech/md/admin) can view all records
CREATE POLICY "All staff can view all patients" ON public.patients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'md', 'tech'))
  );

CREATE POLICY "All staff can view all plans" ON public.treatment_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'md', 'tech'))
  );

CREATE POLICY "All staff can view all treatments" ON public.treatments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'md', 'tech'))
  );
