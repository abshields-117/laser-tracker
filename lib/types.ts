/**
 * Shared row types for the Supabase tables this app reads/writes.
 *
 * NOTE: the production schema has drifted from the SQL files in the repo
 * root — some columns exist under two names depending on when the row was
 * created (e.g. patients.dob vs patients.date_of_birth). Fields that may be
 * absent on older rows are optional here, and `patientDob()` below is the
 * single canonical way to read a patient's date of birth.
 */

export interface MedicalHistory {
  selfTanner?: boolean;
  sunExposure?: boolean;
  accutane?: boolean;
  pregnant?: boolean;
  recentBirth?: boolean;
  photosensitive?: boolean;
  antibiotics?: boolean;
  herpesSimplex?: boolean;
  keloids?: boolean;
  tattoos?: boolean;
  cancer?: boolean;
  medications?: string;
  [key: string]: boolean | string | undefined;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  /** Newer rows */
  dob?: string | null;
  /** Legacy rows (production schema drift) */
  date_of_birth?: string | null;
  email?: string | null;
  phone?: string | null;
  baseline_skin_type?: string | null;
  /** Legacy column name on some rows */
  skin_type?: string | null;
  ethnic_background?: string | null;
  medical_history_json?: MedicalHistory | null;
  /** Legacy column name on some rows (production schema drift) */
  medical_history?: MedicalHistory | null;
  medical_clearance_status?: boolean;
  cleared_by?: string | null;
  cleared_at?: string | null;
  clearance_notes?: string | null;
  created_at: string;
}

/** Canonical accessor for a patient's DOB across schema drift. */
export function patientDob(p: Pick<Patient, 'dob' | 'date_of_birth'>): string | null {
  return p.dob || p.date_of_birth || null;
}

/**
 * Display a patient's DOB. Date-only strings get a local-midnight suffix so
 * they don't shift a day when rendered in timezones behind UTC.
 */
export function formatDob(p: Pick<Patient, 'dob' | 'date_of_birth'>): string {
  const d = patientDob(p);
  if (!d) return '—';
  const parsed = new Date(d.includes('T') ? d : `${d}T00:00:00`);
  return isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
}

export interface TreatmentPlan {
  id: string;
  patient_id: string;
  package_name?: string | null;
  total_sessions?: number | null;
  sessions_completed?: number | null;
  status: string;
  assigned_tech_id?: string | null;
  start_date?: string | null;
  created_at?: string;
}

/** Params snapshot stored inside treatments.areas_treated (jsonb). */
export interface AreasTreatedJson {
  areas?: string[];
  params?: {
    wavelength?: string;
    spotShape?: string;
    repRate?: string;
    numPulses?: string;
  };
}

export interface Treatment {
  id: string;
  patient_id: string;
  plan_id: string;
  tech_user_id?: string | null;
  session_number: number;
  treatment_date: string;
  skin_type_at_session?: string | null;
  sun_exposure_check?: boolean;
  sun_exposed_areas?: string[] | null;
  /** jsonb — either the new {areas, params} shape or a legacy string[] */
  areas_treated?: AreasTreatedJson | string[] | null;
  /** legacy single-area column */
  body_area?: string | null;
  spot_size?: string | null;
  fluence_jcm2?: number | null;
  pulse_width_ms?: number | null;
  cooling_setting?: string | null;
  machine_used?: string | null;
  pico_probe?: string | null;
  pico_wavelength?: string | null;
  pico_mode?: string | null;
  pico_frequency_hz?: number | null;
  shots_fired_alex?: number | null;
  shots_fired_yag?: number | null;
  clinical_endpoint?: string | null;
  notes?: string | null;
  tech_notes?: string | null;
  users?: { full_name: string | null } | null;
}

export interface ConsentRecordSummary {
  id: string;
  signed_at: string;
  service_type?: string | null;
  source?: string | null;
  storage_path?: string | null;
  consent_html?: string | null;
}

export type UserRole = 'admin' | 'md' | 'tech' | 'kiosk';

/** Human-readable labels for medical_history_json flags (shared across views). */
export const MEDICAL_LABELS: Record<string, string> = {
  selfTanner: 'Self tanner in last 7 days',
  sunExposure: 'Prolonged sun exposure (last 4 weeks)',
  accutane: 'Accutane in last 6 months',
  pregnant: 'Currently pregnant or breastfeeding',
  recentBirth: 'Given birth in last 12 months',
  photosensitive: 'Photosensitive meds / retinol / retin-a',
  antibiotics: 'Currently taking antibiotics',
  herpesSimplex: 'History of Herpes Simplex',
  keloids: 'History of keloid scarring',
  tattoos: 'Tattoos/permanent makeup in treatment area',
  cancer: 'History of skin cancer',
};
