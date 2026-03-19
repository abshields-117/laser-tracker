"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, User, FileText, Activity, Calendar, CheckCircle } from 'lucide-react';

type Patient = any;
type TreatmentPlan = any;
type Treatment = any;

export default function PatientChartPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      } catch (err: any) {
        console.error('Error fetching chart:', err);
        setError(err.message);
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
        <button onClick={() => router.back()} className="text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  const activePlan = plans.find(p => p.status === 'active') || plans[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="text-sm font-semibold text-slate-800">
            Full Patient Chart
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Patient Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {patient.first_name[0]}{patient.last_name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{patient.first_name} {patient.last_name}</h1>
              <p className="text-slate-500">DOB: {new Date(patient.date_of_birth).toLocaleDateString()} • {patient.phone}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
              <span className="block text-xs text-slate-500 uppercase font-semibold">Fitzpatrick</span>
              <span className="block text-lg font-bold text-slate-800 text-center">Type {patient.skin_type_fitzpatrick || 'N/A'}</span>
            </div>
            <div className={`px-4 py-2 rounded-lg border ${patient.photosensitive_meds ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <span className="block text-xs uppercase font-semibold text-center mb-0.5" style={{ color: patient.photosensitive_meds ? '#ef4444' : '#10b981' }}>Meds</span>
              <span className="block text-sm font-bold text-center" style={{ color: patient.photosensitive_meds ? '#991b1b' : '#065f46' }}>
                {patient.photosensitive_meds ? 'Flagged' : 'Clear'}
              </span>
            </div>
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
                    <h3 className="text-lg font-bold text-slate-900">{activePlan.package_type || 'Custom Plan'}</h3>
                    <p className="text-slate-500 text-sm mt-1">Started: {new Date(activePlan.start_date).toLocaleDateString()}</p>
                    
                    <div className="mt-6">
                      <div className="flex justify-between text-sm font-medium mb-2">
                        <span className="text-slate-700">Progress</span>
                        <span className="text-slate-900">{activePlan.sessions_completed} / {activePlan.total_sessions}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (activePlan.sessions_completed / activePlan.total_sessions) * 100)}%` }}
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
                   const medications = (history as any).medications;
                   return (
                     <div className="space-y-3">
                       {flagged.length > 0 ? (
                         <div className="space-y-2">
                           {flagged.map(([key]) => (
                             <div key={key} className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                               <span className="font-medium">{key}</span>
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
                           <CheckCircle className="w-4 h-4 text-green-500" />
                           <span className="font-medium">No medical contraindications flagged</span>
                         </div>
                       )}
                       {medications && String(medications).trim() !== '' && (
                         <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                           <span className="block text-xs font-semibold text-blue-800 uppercase mb-1">Current Medications</span>
                           <p className="text-sm text-blue-900">{String(medications)}</p>
                         </div>
                       )}
                     </div>
                   );
                 })()}
                 <div className="pt-4 border-t border-slate-100">
                   <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                     <CheckCircle className="w-4 h-4" />
                     <span>Treatment Consent Signed</span>
                   </div>
                   <p className="text-slate-500 text-xs ml-6 mt-1">
                     Digitally signed on {new Date(patient.created_at).toLocaleString()}
                   </p>
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
                    {treatments.map((t) => (
                      <div key={t.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 text-blue-700 font-bold w-10 h-10 rounded-full flex items-center justify-center">
                              {t.session_number}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{t.body_area || 'Treatment Area'}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(t.treatment_date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block text-xs font-semibold text-slate-400 uppercase">Provider</span>
                            <span className="block text-sm font-medium text-slate-800">{t.users?.full_name || 'Tech'}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-slate-100 rounded-lg p-3">
                            <span className="block text-xs text-slate-500 mb-1">Fluence (J/cm²)</span>
                            <span className="font-mono font-medium text-slate-800">{t.fluence || '-'}</span>
                          </div>
                          <div className="bg-slate-100 rounded-lg p-3">
                            <span className="block text-xs text-slate-500 mb-1">Spot Size (mm)</span>
                            <span className="font-mono font-medium text-slate-800">{t.spot_size || '-'}</span>
                          </div>
                        </div>
                        
                        {t.notes && (
                          <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                            <span className="block text-xs font-semibold text-amber-800 uppercase mb-1">Clinical Notes</span>
                            <p className="text-sm text-amber-900">{t.notes}</p>
                          </div>
                        )}
                        {t.tech_notes && (
                          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100 mt-2">
                            <span className="block text-xs font-semibold text-purple-800 uppercase mb-1">Internal Session Notes</span>
                            <p className="text-sm text-purple-900">{t.tech_notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
