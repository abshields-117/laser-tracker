"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Save, User, Zap, Sun, Loader2, CheckCircle2, ClipboardCheck,
  Activity, MessageSquare, ChevronDown, Shield, Square, Circle,
} from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────────────

const BODY_AREAS = [
  'Underarms', 'Bikini/Brazilian', 'Full Legs', 'Back',
  'Face', 'Neck', 'Arms', 'Chest',
] as const;

const SKIN_TYPES = ['I', 'II', 'III', 'IV', 'V', 'VI'] as const;

const CLINICAL_ENDPOINTS = [
  'Mild Erythema',
  'PFE (Edema)',
  'None / Poor Response',
] as const;

const WAVELENGTH_OPTIONS = ['755nm (Alexandrite)', '1064nm (Nd:YAG)', 'Blend'] as const;

const COOLING_LEVELS = ['Off', 'Low', 'Medium', 'High', 'Max'] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

interface TreatmentParams {
  wavelength: string;
  spotShape: 'Square' | 'Round';
  spotSize: string;
  fluenceAlex: string;
  fluenceYag: string;
  pulseWidthAlex: string;
  pulseWidthYag: string;
  repRate: string;
  coolingLevel: string;
  numPulses: string;
}

interface PreChecklist {
  hairShaved: boolean;
  areaCleaned: boolean;
  consentSigned: boolean;
}

// ─── Shared Sub-Components (MUST be outside main component to avoid remount) ──

const SectionCard = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
      {icon}
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-sm font-semibold text-slate-700">{children}</label>
);

const NumberInput = ({ value, onChange, placeholder, className = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) => (
  <input
    type="number"
    step="any"
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  />
);

// ─── Component ───────────────────────────────────────────────────────────────

export default function SessionLogger({ patientId }: { patientId: string | null }) {
  const [patient, setPatient] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session
  const [sessionNum, setSessionNum] = useState(1);

  // Pre-treatment checklist
  const [preChecklist, setPreChecklist] = useState<PreChecklist>({
    hairShaved: false,
    areaCleaned: false,
    consentSigned: false,
  });

  // Sun exposure
  const [sunExposure, setSunExposure] = useState(false);
  const [sunExposedAreas, setSunExposedAreas] = useState<string[]>([]);

  // Treatment parameters
  const [params, setParams] = useState<TreatmentParams>({
    wavelength: '755nm (Alexandrite)',
    spotShape: 'Square',
    spotSize: '',
    fluenceAlex: '',
    fluenceYag: '',
    pulseWidthAlex: '',
    pulseWidthYag: '',
    repRate: '',
    coolingLevel: 'Medium',
    numPulses: '',
  });

  // Areas treated
  const [areasTreated, setAreasTreated] = useState<string[]>([]);
  const [otherArea, setOtherArea] = useState('');

  // Clinical endpoint
  const [clinicalEndpoint, setClinicalEndpoint] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  // ─── Data Fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!patientId) { setLoading(false); return; }
    setLoading(true);
    try {
      // Fetch patient
      const { data: pt } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      setPatient(pt);

      // Fetch active plan
      const { data: plans } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active');
      const activePlan = plans?.[0] ?? null;
      setPlan(activePlan);

      // Fetch most recent treatment for pre-population
      if (activePlan) {
        const { data: treatments } = await supabase
          .from('treatments')
          .select('*')
          .eq('plan_id', activePlan.id)
          .order('session_number', { ascending: false })
          .limit(1);

        const prev = treatments?.[0];
        if (prev) {
          setSessionNum(prev.session_number + 1);
          // Pre-populate parameters from previous session
          const prevAreas = prev.areas_treated as any;
          setParams(p => ({
            ...p,
            spotSize: prev.spot_size ?? '',
            fluenceAlex: prev.fluence_jcm2?.toString() ?? '',
            fluenceYag: prev.shots_fired_yag ? prev.fluence_jcm2?.toString() ?? '' : '',
            pulseWidthAlex: prev.pulse_width_ms?.toString() ?? '',
            pulseWidthYag: prev.pulse_width_ms?.toString() ?? '',
            coolingLevel: prev.cooling_setting ?? 'Medium',
            // Preserve wavelength/shape from areas_treated jsonb if stored
            ...(prevAreas?.params ?? {}),
          }));
          if (Array.isArray(prevAreas?.areas)) {
            setAreasTreated(prevAreas.areas);
          } else if (Array.isArray(prevAreas)) {
            setAreasTreated(prevAreas);
          }
        } else {
          setSessionNum(1);
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const toggleArea = (area: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    setList(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]);
  };

  const updateParam = (key: keyof TreatmentParams, value: string) => {
    setParams(p => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    if (!patientId || !patient) return;
    setSaving(true);
    setError(null);

    try {
      let activePlan = plan;

      // Create plan if none exists
      if (!activePlan) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: newPlan, error: planErr } = await supabase
          .from('treatment_plans')
          .insert({
            patient_id: patientId,
            package_name: patient.package_name ?? 'Standard Package',
            total_sessions: 8,
            status: 'active',
            assigned_tech_id: user?.id,
          })
          .select()
          .single();
        if (planErr) throw planErr;
        activePlan = newPlan;
        setPlan(newPlan);
      }

      const { data: { user } } = await supabase.auth.getUser();

      const allAreas = [...areasTreated];
      if (otherArea.trim()) allAreas.push(otherArea.trim());

      const { error: insertErr } = await supabase.from('treatments').insert({
        patient_id: patientId,
        plan_id: activePlan.id,
        tech_user_id: user?.id,
        session_number: sessionNum,
        skin_type_at_session: patient.skin_type ?? null,
        sun_exposure_check: sunExposure,
        sun_exposed_areas: sunExposure ? sunExposedAreas : null,
        areas_treated: {
          areas: allAreas,
          params: {
            wavelength: params.wavelength,
            spotShape: params.spotShape,
            repRate: params.repRate,
            numPulses: params.numPulses,
          },
        },
        spot_size: params.spotSize || null,
        fluence_jcm2: params.fluenceAlex ? parseFloat(params.fluenceAlex) : null,
        pulse_width_ms: params.pulseWidthAlex ? parseFloat(params.pulseWidthAlex) : null,
        cooling_setting: params.coolingLevel,
        overlap_percent: null,
        shots_fired_alex: params.numPulses ? parseInt(params.numPulses) : null,
        shots_fired_yag: params.fluenceYag ? parseInt(params.numPulses || '0') : null,
        clinical_endpoint: clinicalEndpoint || null,
        notes: notes || null,
      });

      if (insertErr) throw insertErr;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // SectionCard, Label, NumberInput all moved outside component

  // ─── Loading / Empty States ─────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!patientId || !patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <User className="w-12 h-12 mb-2" />
        <p className="text-lg">Select a patient to begin</p>
      </div>
    );
  }

  const totalSessions = plan?.total_sessions ?? 8;
  const dob = patient.date_of_birth
    ? new Date(patient.date_of_birth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  // ─── Main Render ────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">

      {/* ── Section 1: Patient Header ─────────────────────────────────── */}
      <div className="bg-slate-800 rounded-xl p-5 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {patient.first_name} {patient.last_name}
            </h2>
            <p className="text-slate-300 text-sm mt-0.5">DOB: {dob}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/30">
              <Shield className="w-3.5 h-3.5" />
              Skin Type {patient.skin_type ?? '—'}
            </span>
            <span className="inline-flex items-center bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-500/30">
              Session {sessionNum} / {totalSessions}
            </span>
          </div>
        </div>
        {plan && (
          <p className="text-slate-400 text-xs mt-2">
            Plan: {plan.package_name} &middot; Tech: {plan.assigned_tech_id ? 'Assigned' : 'Unassigned'}
          </p>
        )}
      </div>

      {/* ── Section 2: Pre-Treatment Checklist ────────────────────────── */}
      <SectionCard title="Pre-Treatment Checklist" icon={<ClipboardCheck className="w-4 h-4 text-slate-500" />}>
        <div className="space-y-3">
          {([
            ['hairShaved', 'Hair closely shaved?'],
            ['areaCleaned', 'Treatment area cleaned and dry?'],
            ['consentSigned', 'Consent form signed?'],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preChecklist[key]}
                onChange={() => setPreChecklist(p => ({ ...p, [key]: !p[key] }))}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">{label}</span>
            </label>
          ))}

          <div className="border-t border-slate-100 pt-3 mt-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sunExposure}
                onChange={() => setSunExposure(!sunExposure)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-semibold text-amber-700 flex items-center gap-1.5">
                <Sun className="w-4 h-4" /> Recent Sun Exposure?
              </span>
            </label>
            {sunExposure && (
              <div className="mt-3 ml-7 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BODY_AREAS.map(area => (
                  <label key={area} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sunExposedAreas.includes(area)}
                      onChange={() => toggleArea(area, sunExposedAreas, setSunExposedAreas)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                    {area}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── Section 3: Treatment Parameters ───────────────────────────── */}
      <SectionCard title="Treatment Parameters" icon={<Zap className="w-4 h-4 text-slate-500" />}>
        <div className="space-y-4">

          {/* Wavelength */}
          <div>
            <Label>Wavelength</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {WAVELENGTH_OPTIONS.map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => updateParam('wavelength', w)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                    params.wavelength === w
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Spot Shape */}
          <div>
            <Label>Spot Shape</Label>
            <div className="mt-1.5 flex gap-3">
              {(['Square', 'Round'] as const).map(shape => (
                <label key={shape} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="spotShape"
                    checked={params.spotShape === shape}
                    onChange={() => updateParam('spotShape', shape)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex items-center gap-1.5 text-sm text-slate-700">
                    {shape === 'Square' ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    {shape}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Spot Size + Rep Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Spot Size (mm)</Label>
              <NumberInput value={params.spotSize} onChange={v => updateParam('spotSize', v)} placeholder="e.g. 18" />
            </div>
            <div>
              <Label>Rep Rate (Hz)</Label>
              <NumberInput value={params.repRate} onChange={v => updateParam('repRate', v)} placeholder="e.g. 2" />
            </div>
          </div>

          {/* Fluence - dual column */}
          <div>
            <Label>Fluence F (J/cm²)</Label>
            <div className="grid grid-cols-2 gap-4 mt-1.5">
              <div>
                <span className="text-xs text-slate-500">755nm Alexandrite</span>
                <NumberInput value={params.fluenceAlex} onChange={v => updateParam('fluenceAlex', v)} placeholder="J/cm²" />
              </div>
              <div>
                <span className="text-xs text-slate-500">1064nm Nd:YAG</span>
                <NumberInput value={params.fluenceYag} onChange={v => updateParam('fluenceYag', v)} placeholder="J/cm²" />
              </div>
            </div>
          </div>

          {/* Pulse Duration - dual column */}
          <div>
            <Label>Pulse Duration PD (ms)</Label>
            <div className="grid grid-cols-2 gap-4 mt-1.5">
              <div>
                <span className="text-xs text-slate-500">755nm Alexandrite</span>
                <NumberInput value={params.pulseWidthAlex} onChange={v => updateParam('pulseWidthAlex', v)} placeholder="ms" />
              </div>
              <div>
                <span className="text-xs text-slate-500">1064nm Nd:YAG</span>
                <NumberInput value={params.pulseWidthYag} onChange={v => updateParam('pulseWidthYag', v)} placeholder="ms" />
              </div>
            </div>
          </div>

          {/* Cooling + Pulses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cooling Level</Label>
              <div className="relative mt-1.5">
                <select
                  value={params.coolingLevel}
                  onChange={e => updateParam('coolingLevel', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 text-sm appearance-none
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white pr-8"
                >
                  {COOLING_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <Label>Number of Pulses</Label>
              <NumberInput value={params.numPulses} onChange={v => updateParam('numPulses', v)} placeholder="Total" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── Section 4: Areas Treated ──────────────────────────────────── */}
      <SectionCard title="Areas Treated" icon={<Activity className="w-4 h-4 text-slate-500" />}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {BODY_AREAS.map(area => (
            <label key={area} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
              areasTreated.includes(area)
                ? 'bg-blue-50 border-blue-300 text-blue-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
              <input
                type="checkbox"
                checked={areasTreated.includes(area)}
                onChange={() => toggleArea(area, areasTreated, setAreasTreated)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {area}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <Label>Other</Label>
          <input
            type="text"
            value={otherArea}
            onChange={e => setOtherArea(e.target.value)}
            placeholder="Specify other area..."
            className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </SectionCard>

      {/* ── Section 5: Clinical Endpoint ──────────────────────────────── */}
      <SectionCard title="Clinical Endpoint / Reaction" icon={<CheckCircle2 className="w-4 h-4 text-slate-500" />}>
        <div className="flex flex-col sm:flex-row gap-3">
          {CLINICAL_ENDPOINTS.map(ep => (
            <label key={ep} className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
              clinicalEndpoint === ep
                ? 'bg-green-50 border-green-400 text-green-800 font-medium'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="clinicalEndpoint"
                checked={clinicalEndpoint === ep}
                onChange={() => setClinicalEndpoint(ep)}
                className="w-4 h-4 text-green-600 focus:ring-green-500"
              />
              {ep}
            </label>
          ))}
        </div>
      </SectionCard>

      {/* ── Section 6: Comments ───────────────────────────────────────── */}
      <SectionCard title="Clinical Notes" icon={<MessageSquare className="w-4 h-4 text-slate-500" />}>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={4}
          placeholder="Post-treatment observations, patient feedback, parameter adjustments for next session..."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
        />
      </SectionCard>

      {/* ── Section 7: Save ───────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Treatment session saved successfully!
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving || areasTreated.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300
          text-white font-semibold py-3.5 rounded-xl shadow-sm transition-all text-sm uppercase tracking-wide"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : (
          <><Save className="w-4 h-4" /> Save Treatment Session</>
        )}
      </button>
    </div>
  );
}
