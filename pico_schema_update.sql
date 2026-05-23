-- Add support for PicoKing and Internal Tech Notes

ALTER TABLE public.treatments
ADD COLUMN IF NOT EXISTS machine_used text DEFAULT 'Splendor X',
ADD COLUMN IF NOT EXISTS pico_probe text,
ADD COLUMN IF NOT EXISTS pico_wavelength text,
ADD COLUMN IF NOT EXISTS pico_mode text,
ADD COLUMN IF NOT EXISTS pico_frequency_hz numeric,
ADD COLUMN IF NOT EXISTS tech_notes text;
