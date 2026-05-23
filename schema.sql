-- ==========================================
-- HARLAN LASER TRACKER - PRODUCTION SCHEMA
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. USERS & ROLES (RBAC)
-- ==========================================
-- This table links directly to Supabase Auth and stores custom roles.
create table public.users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  role text check (role in ('admin', 'md', 'tech')) default 'tech',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Protect the users table
alter table public.users enable row level security;

-- Only Admins can see all users. Users can see themselves.
create policy "Admins can view all users" on public.users for select using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);

-- ==========================================
-- 2. PATIENTS (Core Record)
-- ==========================================
create table public.patients (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  dob date not null,
  email text,
  phone text,
  baseline_skin_type text check (baseline_skin_type in ('I', 'II', 'III', 'IV', 'V', 'VI')),
  medical_clearance_status boolean default false, -- Must be true before treatment
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 3. TREATMENT PLANS (Packages)
-- ==========================================
create table public.treatment_plans (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  package_name text not null,
  total_sessions int default 8,
  assigned_tech_id uuid references public.users(id), -- Critical for Tech RLS
  status text check (status in ('active', 'completed', 'paused', 'cancelled')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 4. CLINICAL LOGS (The Sessions)
-- ==========================================
create table public.treatments (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references public.patients(id) on delete cascade not null,
  plan_id uuid references public.treatment_plans(id) on delete cascade not null,
  tech_user_id uuid references public.users(id) not null,
  session_number int not null,
  treatment_date timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- SAFETY CHECK
  skin_type_at_session text check (skin_type_at_session in ('I', 'II', 'III', 'IV', 'V', 'VI')) not null,
  sun_exposure_check boolean default false,
  sun_exposed_areas jsonb, -- Array of areas
  
  -- SETTINGS (Splendor X)
  areas_treated jsonb not null, -- Array of strings
  spot_size text,
  fluence_jcm2 numeric,
  pulse_width_ms numeric,
  cooling_setting text,
  overlap_percent text,
  
  -- SHOT COUNTS
  shots_fired_alex int,
  shots_fired_yag int,
  
  -- REACTION & NOTES
  clinical_endpoint text check (clinical_endpoint in ('Mild Erythema', 'PFE (Edema)', 'None / Poor Response')),
  notes text,
  
  -- AUDIT
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS) - THE VAULT
-- ==========================================
-- Turn on the locks
alter table public.patients enable row level security;
alter table public.treatment_plans enable row level security;
alter table public.treatments enable row level security;

-- Admins and MDs can see EVERYTHING.
create policy "Admins and MDs can view all patients" on public.patients for select using (
  exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'md'))
);
create policy "Admins and MDs can view all plans" on public.treatment_plans for select using (
  exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'md'))
);
create policy "Admins and MDs can view all treatments" on public.treatments for select using (
  exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'md'))
);

-- Technicians can ONLY see Patients who have a Treatment Plan assigned to that Technician.
create policy "Techs can view their assigned patients" on public.patients for select using (
  exists (
    select 1 from public.treatment_plans 
    where patient_id = patients.id 
    and assigned_tech_id = auth.uid()
  )
);

-- Technicians can ONLY see Treatment Plans assigned to them.
create policy "Techs can view their assigned plans" on public.treatment_plans for select using (
  assigned_tech_id = auth.uid()
);

-- Technicians can view treatments for their assigned patients, and insert new ones.
create policy "Techs can view treatments for assigned patients" on public.treatments for select using (
  exists (
    select 1 from public.treatment_plans 
    where id = treatments.plan_id 
    and assigned_tech_id = auth.uid()
  )
);
create policy "Techs can insert treatments" on public.treatments for insert with check (
  tech_user_id = auth.uid() -- Can only log as themselves
);

-- ==========================================
-- 6. AUDIT TRIGGER (Auto-create user profile on signup)
-- ==========================================
create function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'tech');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

