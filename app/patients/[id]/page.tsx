"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, User, FileText, Activity, CheckCircle, ChevronDown, AlertTriangle } from 'lucide-react';
import ConsentViewer from '@/components/ConsentViewer';
import PhotoGallery from '@/components/PhotoGallery';
import { Patient, TreatmentPlan, Treatment, AreasTreatedJson, formatDob, MEDICAL_LABELS } from '@/lib/types';

export const dynamic = 'force-dynamic';

/** Pull the per-session params snapshot out of the areas_treated jsonb (new shape only). */
function treatmentParams(t: Treatment): AreasTreatedJson['params'] {
  const at = t.areas_treated;
  if (at && !Array.isArray(at) && typeof at === 'object') return at.params ?? {};
  return {};
}

function treatmentAreasLabel(t: Treatment): string {
  const at = t.areas_treated;
  if (at && !Array.isArray(at) && Array.isArray(at.areas) && at.areas.length > 0) return at.areas.join(', ');
  if (Array.isArray(at) && at.length > 0) return at.join(', ');
  return t.body_area || 'No area recorded';
}

export default function PatientChartPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTreatment, setExpandedTreatment] = useState<string | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [consentRecord, setConsentRecord] = useState<{ signed_at: string; source?: string } | null>(null);
  const [consentLoading, setConsentLoading] = useState(true);

  useEffect(() => {
    async function fetchChart() {
      try {
        if (!id) return;
        
        // 1. Fetch Patient
        const { data: pData, error: pError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', id)
          .single();
          
        if (pError) throw pError;
        setPatient(pData);

        // 2. Fetch Plans
        const { data: plData, error: plError } = await supabase
          .from('treatment_plans')
          .select('*')
          .eq('patient_id', id)
          .order('created_at', { ascending: false });
          
        if (plError) throw plError;
        setPlans(plData || []);

        // 3. Fetch Treatments (if plans exist)
        if (plData && plData.length > 0) {
          const planIds = plData.map(p => p.id);
          const { data: tData, error: tError } = await supabase
            .from('treatments')
            .select(`
              *,
              users!tech_user_id(full_name)
            `)
            .in('plan_id', planIds)
            .order('session_number', { ascending: false });
            
          if (tError) throw tError;
          setTreatments(tData || []);
        }

        // 4. Check for an actual signed consent record — do NOT assume one exists.
        // Historically this chart showed a hardcoded "Consent Signed" checkmark with a
        // fabricated date for every patient, which was wrong and misleading. Only show
        // green when a real consent_records row is found.
        try {
          const { data: cData } = await supabase
            .from('consent_records')
            .select('signed_at, source')
            .eq('patient_id', id)
            .order('signed_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          setConsentRecord(cData || null);
        } catch (consentErr) {
          console.error('Error checking consent record:', consentErr);
          setConsentRecord(null);
        } finally {
          setConsentLoading(false);
        }

      } catch (err: unknown) {
        console.error('Error fetching chart:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chart.');
      } finally {
        setLoading(false);
      }
    }
    fetchChart();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-medium">{error || "Patient not found"}</p>
        <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const activePlan = plans.find(p => p.status === 'active') || plans[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="text-sm font-semibold text-slate-800">
            Full Patient Chart
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-8">

        {/* Hard-to-miss consent warning — do not treat until resolved */}
        {!consentLoading && !consentRecord && (
          <div className="bg-red-600 text-white rounded-2xl px-6 py-4 shadow-lg flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg leading-tight">No Consent On File — Do Not Treat</p>
                <p className="text-red-100 text-sm">Collect a signed consent before starting any session for this patient.</p>
              </div>
            </div>
            <button
              onClick={() => router.push(`/kiosk/resign?patientId=${id}&returnTo=/patients/${id}`)}
              className="bg-white text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 whitespace-nowrap"
            >
              Collect Consent Now
            </button>
          </div>
        )}

        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.first_name} {patient.last_name}</h1>
              <p className="text-slate-500">DOB: {formatDob(patient)}{patient.phone ? ` • ${patient.phone}` : ''}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
              <span className="block text-xs text-slate-500 uppercase font-semibold">Fitzpatrick</span>
              <span className="block text-lg font-bold text-slate-800 text-center">Type {patient.baseline_skin_type || patient.skin_type || 'N/A'}</span>
            </div>
            {(() => {
              const flagged = patient.medical_history_json?.photosensitive === true;
              return (
                <div className={`px-4 py-2 rounded-lg border ${flagged ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <span className={`block text-xs uppercase font-semibold text-center mb-0.5 ${flagged ? 'text-red-500' : 'text-emerald-500'}`}>Photosensitive Meds</span>
                  <span className={`block text-sm font-bold text-center ${flagged ? 'text-red-800' : 'text-emerald-800'}`}>
                    {flagged ? 'Flagged' : 'Clear'}
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Plans & Details */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" />
                <h2 className="font-bold text-slate-800">Active Package</h2>
              </div>
              <div className="p-6">
                {activePlan ? (
                  <>
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">{activePlan.status}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{activePlan.package_name || 'Custom Plan'}</h3>
                    <p className="text-slate-500 text-sm mt-1">Started: {activePlan.start_date ? new Date(activePlan.start_date).toLocaleDateString() : (activePlan.created_at ? new Date(activePlan.created_at).toLocaleDateString() : '—')}</p>
                    
                    <div className="mt-6">
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="text-slate-700">Progress</span>
                        <span className="text-slate-900">{treatments.filter(t => t.plan_id === activePlan.id).length} / {activePlan.total_sessions || '—'}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (treatments.filter(t => t.plan_id === activePlan.id).length / (activePlan.total_sessions || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-slate-500 text-sm">No active treatment plans.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-500" />
                <h2 className="font-bold text-slate-800">Medical History</h2>
              </div>
              <div className="p-6 space-y-4">
                 {(() => {
                   const history = patient.medical_history_json || patient.medical_history;
                   if (!history || typeof history !== 'object') {
                     return <p className="text-sm text-slate-500 italic">No medical history recorded.</p>;
                   }
                   const flagged = Object.entries(history).filter(([key, val]) => val === true && key !== 'medications');
                   const medications = (history as Record<string, unknown>).medications;
                   return (
                     <div className="space-y-3">
                       {flagged.length > 0 ? (
                         <div className="space-y-2">
                           {flagged.map(([key]) => (
                             <div key={key} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                               <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                               <span className="font-medium">{MEDICAL_LABELS[key] || key}</span>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                           <CheckCircle className="w-4 h-4 text-green-500" />
                           <span className="font-medium">No medical contraindications flagged</span>
                         </div>
                       )}
                       {typeof medications === 'string' && medications.trim() !== '' && (
                         <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                           <span className="block text-xs font-semibold text-blue-800 uppercase mb-1">Current Medications</span>
                           <p className="text-sm text-blue-900">{String(medications)}</p>
                         </div>
                       )}
                     </div>
                   );
                 })()}
                 <div className="pt-4 border-t border-slate-100">
                   {consentLoading ? (
                     <div className="flex items-center gap-2 text-slate-400 text-sm">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>Checking consent status...</span>
                     </div>
                   ) : consentRecord ? (
                     <>
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                           <CheckCircle className="w-4 h-4" />
                           <span>Treatment Consent Signed</span>
                         </div>
                         <button
                           onClick={() => setShowConsent(true)}
                           className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                         >
                           View / Download
                         </button>
                       </div>
                       <p className="text-slate-500 text-xs ml-6 mt-1">
                         Digitally signed on {new Date(consentRecord.signed_at).toLocaleString()}
                         {consentRecord.source === 're_sign' ? ' (re-signed in app)' : ''}
                       </p>
                     </>
                   ) : (
                     <div className="flex items-center justify-between gap-3">
                       <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                         <AlertTriangle className="w-4 h-4" />
                         <span>No Consent On File</span>
                       </div>
                       <button
                         onClick={() => router.push(`/kiosk/resign?patientId=${id}&returnTo=/patients/${id}`)}
                         className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-md"
                       >
                         Collect Consent Now
                       </button>
                     </div>
                   )}
                 </div>
              </div>
            </div>
          </div>

          {/* Right Column: Treatment Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-slate-500" />
                  <h2 className="font-bold text-slate-800">Treatment History</h2>
                </div>
                <span className="text-sm text-slate-500">{treatments.length} total sessions</span>
              </div>
              
              <div className="p-0">
                {treatments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">No treatments recorded yet.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {treatments.map((t) => {
                      const isExpanded = expandedTreatment === t.id;
                      return (
                      <div key={t.id} className="hover:bg-slate-50 transition-colors">
                        {/* Collapsed Summary Row - Always Visible */}
                        <button 
                          onClick={() => setExpandedTreatment(isExpanded ? null : t.id)}
                          className="w-full p-4 flex items-center gap-4 text-left"
                        >
                          <div className="bg-blue-100 text-blue-700 font-bold w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                            {t.session_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Parse area string gracefully (legacy body_area vs new areas_treated jsonb) */}
                              <span className="font-semibold text-slate-900 text-sm">
                                {treatmentAreasLabel(t)}
                              </span>
                              <span className="text-slate-400 text-xs">•</span>
                              <span className="text-xs text-slate-500">{new Date(t.treatment_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              {treatmentParams(t)?.wavelength && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{treatmentParams(t)?.wavelength}</span>
                              )}
                              {t.machine_used && (
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{t.machine_used}</span>
                              )}
                              {t.fluence_jcm2 && (
                                <span className="text-xs text-slate-500">{t.fluence_jcm2} J/cm²</span>
                              )}
                              {(t.shots_fired_alex || t.shots_fired_yag) && (
                                <span className="text-xs text-slate-500">{(t.shots_fired_alex || 0) + (t.shots_fired_yag || 0)} shots</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 mr-2">
                            <span className="text-xs text-slate-500">{t.users?.full_name || 'Tech'}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Expanded Detail Section */}
                        {isExpanded && (
                          <div className="px-6 pb-5 pt-0 space-y-4 border-t border-slate-100 bg-slate-50/50">
                            {/* Treatment Parameters Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4">
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Fluence Total</span>
                                <span className="font-mono font-semibold text-slate-800">{t.fluence_jcm2 || '-'} J/cm²</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Spot Size</span>
                                <span className="font-mono font-semibold text-slate-800">{t.spot_size || '-'} mm</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Spot Shape</span>
                                <span className="font-mono font-semibold text-slate-800">{treatmentParams(t)?.spotShape || '-'}</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Wavelength</span>
                                <span className="font-mono font-semibold text-slate-800">{treatmentParams(t)?.wavelength || t.pico_wavelength || '-'}</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Rep Rate</span>
                                <span className="font-mono font-semibold text-slate-800">{treatmentParams(t)?.repRate ? treatmentParams(t)?.repRate + ' Hz' : (t.pico_frequency_hz ? t.pico_frequency_hz + ' Hz' : '-')}</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Cooling</span>
                                <span className="font-mono font-semibold text-slate-800">{t.cooling_setting || '-'}</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Pulse Duration</span>
                                <span className="font-mono font-semibold text-slate-800">{t.pulse_width_ms ? t.pulse_width_ms + ' ms' : '-'}</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Machine</span>
                                <span className="font-mono font-semibold text-slate-800">{t.machine_used || '-'}</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Shots Fired</span>
                                <span className="font-mono font-semibold text-slate-800">{(t.shots_fired_alex || t.shots_fired_yag) ? ((t.shots_fired_alex || 0) + (t.shots_fired_yag || 0)) : '-'}</span>
                              </div>
                            </div>
                            
                            {/* Skin & Endpoint */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Skin Type at Session</span>
                                <span className="font-semibold text-slate-800">{t.skin_type_at_session || '-'}</span>
                              </div>
                              <div className="bg-white rounded-lg p-3 border border-slate-100">
                                <span className="block text-xs text-slate-400 mb-1">Clinical Endpoint</span>
                                <span className="font-semibold text-slate-800">{t.clinical_endpoint || '-'}</span>
                              </div>
                            </div>

                            {/* Notes */}
                            {t.notes && (
                              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                                <span className="block text-xs font-semibold text-amber-800 uppercase mb-1">Clinical Notes</span>
                                <p className="text-sm text-amber-900">{t.notes}</p>
                              </div>
                            )}
                            {t.tech_notes && (
                              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                <span className="block text-xs font-semibold text-purple-800 uppercase mb-1">Internal Session Notes</span>
                                <p className="text-sm text-purple-900">{t.tech_notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Photo Gallery — full width below the grid */}
        <PhotoGallery patientId={id as string} />

      </main>
      {showConsent && patient && (
        <ConsentViewer
          patientId={id as string}
          patientName={`${patient.first_name} ${patient.last_name}`}
          onClose={() => setShowConsent(false)}
        />
      )}
    </div>
  );
}
