"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Save, Calendar, User, Zap, AlertTriangle, Sun, Loader2, FileText } from 'lucide-react';

const PACKAGES = [
  { group: "Female Packages", items: ["Smooth Face & Neck", "The Essential Duo", "The College Prep", "The Full Leg", "The Total Body"] },
  { group: "Men's Packages", items: ["The Clean Neck", "The Athlete's Back", "Upper Body Complete"] },
  { group: "Other", items: ["Other (Please specify)"] }
];

const STANDARD_AREAS = ['Underarms', 'Bikini / Brazilian', 'Full Legs', 'Back', 'Face', 'Neck', 'Arms', 'Chest'];

export default function SessionLogger({ patientId }: { patientId: string | null }) {
  const [patient, setPatient] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [sessionNum, setSessionNum] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState('The Essential Duo');
  const [otherPackage, setOtherPackage] = useState('');
  const [skinCheck, setSkinCheck] = useState({ rechecked: false, type: 'III', sunExposure: false });
  const [treatedAreas, setTreatedAreas] = useState<string[]>(['Underarms']);
  const [otherTreatedArea, setOtherTreatedArea] = useState('');
  const [sunExposedAreas, setSunExposedAreas] = useState<string[]>([]);
  const [fluence, setFluence] = useState('');
  const [spotSize, setSpotSize] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!patientId) return;
    async function loadData() {
      try {
        setLoading(true);
        // Fetch patient
        const { data: pData } = await supabase.from('patients').select('*').eq('id', patientId).single();
        if (pData) setPatient(pData);

        // Fetch active plan
        const { data: planData } = await supabase.from('treatment_plans').select('*').eq('patient_id', patientId).eq('status', 'active').single();
        if (planData) {
          setPlan(planData);
          setSelectedPackage(planData.package_type);
        } else {
          setPlan(null);
          setSessionNum(1);
        }

        if (pData?.skin_type_fitzpatrick) {
           setSkinCheck(prev => ({ ...prev, type: String(pData.skin_type_fitzpatrick) }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [patientId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const user = (await supabase.auth.getUser()).data.user;
      
      let currentPlanId = plan?.id;
      
      // If no active plan, create one!
      if (!currentPlanId) {
        const pType = selectedPackage === 'Other (Please specify)' ? otherPackage : selectedPackage;
        const { data: newPlan, error: planErr } = await supabase.from('treatment_plans').insert({
          patient_id: patientId,
          package_name: pType,
          total_sessions: 8,
          assigned_tech_id: user?.id,
          status: 'active'
        }).select().single();
        if (planErr) throw planErr;
        currentPlanId = newPlan.id;
      }

      // Record Treatment
      const areaList = treatedAreas.includes('Other') 
        ? treatedAreas.filter(a => a !== 'Other').concat(otherTreatedArea).join(', ')
        : treatedAreas.join(', ');

      const { error: tErr } = await supabase.from('treatments').insert({
        plan_id: currentPlanId,
        patient_id: patientId,
        tech_user_id: user?.id,
        session_number: sessionNum,
        treatment_date: new Date().toISOString().split('T')[0],
        areas_treated: treatedAreas.includes('Other') ? treatedAreas.filter(a => a !== 'Other').concat(otherTreatedArea) : treatedAreas,
        fluence_jcm2: fluence ? parseFloat(fluence) : null,
        skin_type_at_session: skinCheck.type,
        sun_exposure_check: skinCheck.sunExposure,
        sun_exposed_areas: skinCheck.sunExposure ? sunExposedAreas : null,
        spot_size: spotSize || null,
        notes: `Sun Exposure: ${skinCheck.sunExposure ? 'Yes' : 'No'}. ${notes}`
      });
      if (tErr) throw tErr;


      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save treatment session.');
    } finally {
      setSaving(false);
    }
  };

  const toggleArea = (area: string) => {
    if (treatedAreas.includes(area)) {
      setTreatedAreas(treatedAreas.filter(a => a !== area));
    } else {
      setTreatedAreas([...treatedAreas, area]);
    }
  };

  if (!patientId) return <div className="p-8 text-center text-slate-500">Please select a patient first.</div>;
  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-400" />
            Laser Session Log
          </h1>
          <p className="text-slate-400 mt-1">
            {patient?.first_name} {patient?.last_name} • Session {sessionNum} of {plan?.total_sessions || 8}
          </p>
        </div>
        <div className="bg-slate-800 px-4 py-2 rounded-lg text-center border border-slate-700">
          <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date</span>
          <div className="flex items-center gap-2 font-bold text-white">
            <Calendar className="w-4 h-4 text-blue-400" />
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-5 h-5 text-slate-500" /> Treatment Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Package Type</label>
                <select className="w-full p-2 border border-slate-300 rounded-lg bg-white text-slate-900" value={selectedPackage} onChange={(e) => setSelectedPackage(e.target.value)}>
                  {PACKAGES.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.items.map(item => <option key={item} value={item}>{item}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Area(s) Treated</label>
                <div className="grid grid-cols-2 gap-2">
                  {STANDARD_AREAS.concat(['Other']).map((area) => (
                    <button key={area} onClick={() => toggleArea(area)} className={`p-2 text-sm rounded-lg border text-left transition-colors ${treatedAreas.includes(area) ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {area}
                    </button>
                  ))}
                </div>
                {treatedAreas.includes('Other') && (
                  <input type="text" placeholder="Please specify area..." className="mt-3 w-full p-2 border border-slate-300 rounded-lg text-slate-900" value={otherTreatedArea} onChange={(e) => setOtherTreatedArea(e.target.value)} />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
               <Sun className="w-5 h-5 text-amber-500" /> Pre-Treatment Check
             </h2>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="sun" className="w-5 h-5 text-blue-600 rounded" checked={skinCheck.sunExposure} onChange={(e) => setSkinCheck({...skinCheck, sunExposure: e.target.checked})} />
                  <label htmlFor="sun" className="text-sm font-medium text-slate-700">Recent Sun Exposure / Self Tanner?</label>
                </div>
                {skinCheck.sunExposure && (
                  <>
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-sm text-amber-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
                      <p><strong>Caution:</strong> Assess skin carefully. Proceed with lower fluence if needed.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Areas Exposed to Sun:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {STANDARD_AREAS.map((area) => (
                          <button key={area} onClick={() => setSunExposedAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])} className={`p-2 text-sm rounded-lg border text-left transition-colors ${sunExposedAreas.includes(area) ? 'bg-amber-50 border-amber-400 text-amber-800 font-medium shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
             </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-8">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
               <FileText className="w-5 h-5 text-slate-500" /> Laser Parameters
             </h2>
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Fluence (J/cm²)</label>
                 <input type="number" step="0.1" className="w-full p-3 font-mono text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900" value={fluence} onChange={(e) => setFluence(e.target.value)} placeholder="e.g. 12" />
               </div>
               <div>
                 <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Spot Size (mm)</label>
                 <input type="number" step="0.1" className="w-full p-3 font-mono text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900" value={spotSize} onChange={(e) => setSpotSize(e.target.value)} placeholder="e.g. 18" />
               </div>
             </div>
             <div className="mt-4">
               <label className="block text-sm font-semibold text-slate-700 mb-1">Clinical Notes & Observations</label>
               <textarea rows={4} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-900" placeholder="Reaction, cooling level used, patient feedback..." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
             </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2">
             {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
             {saving ? 'Saving...' : success ? 'Session Logged!' : 'Log Treatment Session'}
          </button>
        </div>
      </div>
    </div>
  );
}
