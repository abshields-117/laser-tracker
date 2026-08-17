-- Drop the overbroad SELECT policy for the kiosk
DROP POLICY IF EXISTS "Kiosk can view patients for resign lookup" ON public.patients;

-- We don't want the kiosk to be able to SELECT * FROM patients.
-- Instead, we will create a secure RPC function that only returns a patient
-- if the exact first name, last name, and dob match.

CREATE OR REPLACE FUNCTION lookup_patient_for_resign(p_first_name TEXT, p_last_name TEXT, p_dob DATE)
RETURNS TABLE (id UUID, first_name TEXT, last_name TEXT, dob DATE, phone TEXT, created_at TIMESTAMPTZ)
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow the kiosk role to execute this logic
  IF (public.get_user_role() != 'kiosk') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
  SELECT p.id, p.first_name, p.last_name, p.dob, p.phone, p.created_at
  FROM public.patients p
  WHERE p.first_name ILIKE p_first_name
    AND p.last_name ILIKE p_last_name
    AND p.dob = p_dob;
END;
$$ LANGUAGE plpgsql;

-- Ensure the kiosk role can execute the function
GRANT EXECUTE ON FUNCTION lookup_patient_for_resign TO authenticated;
