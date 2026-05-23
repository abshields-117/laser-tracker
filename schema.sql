-- Supabase Schema for Laser Tracker v2 (HIPAA Compliant)

-- 1. USERS (Staff/MD)
create table users (
  id uuid references auth.users not null primary key,
  email text unique,
  role text check (role in ('admin', 'md', 'tech')) default 'tech',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PATIENTS (Core Record)
create table patients (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  dob date not null,
  email text,
  phone text,
  baseline_skin_type text check (baseline_skin_type in ('I', 'II', 'III', 'IV', 'V', 'VI')),
  package_name text, -- e.g. "Total Body Laser"
  total_sessions int default 8,
  sessions_completed int default 0,
  status text check (status in ('pending_intake', 'active', 'graduated', 'archived')) default 'pending_intake',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. INTAKE TOKENS (Secure Magic Links)
create table intake_tokens (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  token text unique not null,
  expires_at timestamp with time zone not null,
  used_at timestamp with time zone, -- Null until used
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TREATMENTS (The Clinical Log)
create table treatments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  tech_user_id uuid references users(id), -- Who performed it
  treatment_date date default current_date,
  
  -- SAFETY CHECK (Mandatory Re-Type)
  skin_type_at_session text check (skin_type_at_session in ('I', 'II', 'III', 'IV', 'V', 'VI')) not null,
  sun_exposure_check boolean default false, -- "Did you go to Mexico?"
  
  -- SETTINGS (Splendor X Specifics)
  area_treated text not null, -- e.g. "Underarms"
  spot_size text, -- "18mm", "24mm"
  fluence_jcm2 numeric, -- e.g. 14.5
  pulse_width_ms numeric, -- e.g. 20
  cooling_setting text, -- "High"
  
  -- SHOT COUNTS (Splendor X Dual Wavelength)
  shots_fired_alex int,
  shots_fired_yag int,
  
  -- REACTION
  reaction_erythema boolean default false,
  reaction_edema boolean default false,
  notes text,
  
  -- MD OVERSIGHT
  md_reviewed_by uuid references users(id), -- Null until reviewed
  md_reviewed_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CONSENTS (Signed Forms)
create table consents (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade,
  form_type text check (form_type in ('intake', 'laser_consent', 'post_care')),
  signed_at timestamp with time zone default timezone('utc'::text, now()),
  ip_address text, -- Audit trail
  signature_data text, -- JSON or Base64 of signature
  pdf_url text -- Link to stored PDF in Supabase Storage
);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table patients enable row level security;
alter table treatments enable row level security;
alter table users enable row level security;

-- POLICIES (Simplistic for now)
-- 1. Only authenticated staff can read patients/treatments.
create policy "Staff can view all patients" on patients for select using (auth.role() = 'authenticated');
create policy "Staff can insert patients" on patients for insert with check (auth.role() = 'authenticated');
