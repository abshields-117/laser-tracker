-- Migration: Patient Photos
-- Run in Supabase SQL Editor (project: vvthpimxbvtbtdqchlec)
--
-- ALSO required (do this first in Supabase Dashboard):
--   Storage → New bucket → Name: "patient-photos" → Private (NOT public) → Save
--   Then run this SQL below.

-- 1. Create patient_photos table
CREATE TABLE IF NOT EXISTS public.patient_photos (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id     uuid        NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  storage_path   text        NOT NULL,
  category       text        NOT NULL DEFAULT 'progress'
                             CHECK (category IN ('before', 'after', 'progress', 'treatment_area')),
  notes          text,
  taken_at       timestamptz NOT NULL DEFAULT now(),
  uploaded_by    uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- 2. Index for fast per-patient queries
CREATE INDEX IF NOT EXISTS patient_photos_patient_id_idx ON public.patient_photos(patient_id);

-- 3. Enable RLS
ALTER TABLE public.patient_photos ENABLE ROW LEVEL SECURITY;

-- 4. All authenticated staff can view photos
CREATE POLICY "Staff can view all photos"
  ON public.patient_photos FOR SELECT
  TO authenticated
  USING (true);

-- 5. All authenticated staff can insert (upload) photos
CREATE POLICY "Staff can insert photos"
  ON public.patient_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Only admin can delete photo records
CREATE POLICY "Admin can delete photos"
  ON public.patient_photos FOR DELETE
  TO authenticated
  USING (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- 7. Storage bucket RLS policies (run after creating the bucket in Dashboard)
--    These apply to the "patient-photos" Storage bucket.

-- Allow authenticated users to upload (insert) objects
CREATE POLICY "Staff can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'patient-photos');

-- Allow authenticated users to read (select) objects for signed URL generation
CREATE POLICY "Staff can read photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'patient-photos');

-- Allow admin to delete photo files
CREATE POLICY "Admin can delete photo files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'patient-photos'
    AND exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
