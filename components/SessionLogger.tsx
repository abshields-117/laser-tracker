"use client";

import React, { useState } from 'react';
import { Save, Calendar, User, Zap, AlertTriangle, Sun, Gauge, Thermometer } from 'lucide-react';

export default function SessionLogger() {
  const [patient] = useState({ name: 'Sarah Smith', skinType: 'III', package: 'The Essential Duo' });
  const [session, setSession] = useState(4);
  const totalSessions = 8;
  const [skinCheck, setSkinCheck] = useState({ rechecked: false, type: 'III', sunExposure: false });
  const [exposedAreas, setExposedAreas] = useState<string[]>([]);
  const [areaTreated, setAreaTreated] = useState('Underarms');

  // Mock previous session data (This would come from DB)
  const previousSession = {
    shotsAlex: 1250,
    shotsYag: 450
  };

  // Logic: Is the treatment safe?
  const isTreatmentBlocked = skinCheck.sunExposure && exposedAreas.includes(areaTreated);

  const handleSave = () => {
    if (!skinCheck.rechecked) {
      alert("Please confirm the Fitzpatrick Skin Type before saving.");
      return;
    }
    if (isTreatmentBlocked) {
      alert(`WARNING: Recent sun exposure reported on ${areaTreated}. Treatment postponed.`);
      return;
    }
    alert("Session Saved! Next Appointment: April 12, 2026");
  };

  const toggleExposedArea = (area: string) => {
    if (exposedAreas.includes(area)) {
      setExposedAreas(exposedAreas.filter(a => a !== area));
    } else {
      setExposedAreas([...exposedAreas, area]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 pb-20">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {patient.name}
            </h1>
            <p className="text-slate-500 mt-1">Baseline: Type <span className="font-semibold text-slate-800">{patient.skinType}</span></p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
              {patient.package}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
            <span>Session {session} of {totalSessions}</span>
            <span>{Math.round((session / totalSessions) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${(session / totalSessions) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Safety Check: Mandatory Re-Type & Sun Exposure */}
      <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3 ${isTreatmentBlocked ? 'bg-red-50 border-red-200' : ''}`}>
        <div className={`flex items-center gap-2 font-semibold ${isTreatmentBlocked ? 'text-red-700' : 'text-amber-800'}`}>
          <AlertTriangle className="w-5 h-5" />
          Mandatory Safety Check
        </div>
        
        <div className="space-y-3">
          {/* Sun Exposure Question */}
          <div className="bg-white p-3 rounded-lg border border-amber-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Sun className="w-4 h-4 text-orange-500" />
                Recent sun exposure / tanning?
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" name="sun" 
                    checked={skinCheck.sunExposure === true}
                    onChange={() => setSkinCheck({ ...skinCheck, sunExposure: true })}
                    className="w-4 h-4 text-red-600" 
                  />
                  <span className="text-sm font-bold text-red-600">YES</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" name="sun" 
                    checked={skinCheck.sunExposure === false}
                    onChange={() => {
                      setSkinCheck({ ...skinCheck, sunExposure: false });
                      setExposedAreas([]); // Clear areas if NO sun
                    }}
                    className="w-4 h-4 text-green-600" 
                  />
                  <span className="text-sm font-bold text-green-600">NO</span>
                </label>
              </div>
            </div>

            {/* If YES, Show Area Checklist */}
            {skinCheck.sunExposure && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Select Exposed Areas:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Face', 'Neck', 'Arms', 'Underarms', 'Legs', 'Back', 'Chest', 'Bikini'].map(area => (
                    <label key={area} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded">
                      <input 
                        type="checkbox" 
                        checked={exposedAreas.includes(area)}
                        onChange={() => toggleExposedArea(area)}
                        className="w-4 h-4 text-red-500 rounded border-slate-300"
                      />
                      <span className="text-sm text-slate-700">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skin Type Check */}
          <div className="flex items-center gap-4">
            <select 
              className="p-2 border border-amber-300 rounded bg-white text-sm"
              value={skinCheck.type}
              onChange={(e) => setSkinCheck({ ...skinCheck, type: e.target.value })}
            >
              <option value="I">Type I</option>
              <option value="II">Type II</option>
              <option value="III">Type III</option>
              <option value="IV">Type IV</option>
              <option value="V">Type V</option>
              <option value="VI">Type VI</option>
            </select>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={skinCheck.rechecked}
                onChange={(e) => setSkinCheck({ ...skinCheck, rechecked: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded" 
              />
              <span className="text-sm font-medium text-amber-900">I have examined the skin today.</span>
            </label>
          </div>
        </div>

        {isTreatmentBlocked && (
          <div className="text-red-600 text-sm font-bold flex items-center gap-2 mt-2 bg-red-100 p-2 rounded animate-pulse">
            🛑 STOP: Sun exposure detected on {areaTreated}. Treatment Blocked.
          </div>
        )}
      </div>

      {/* Treatment Form - Locked if Blocked or Unchecked */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-opacity ${(!skinCheck.rechecked || isTreatmentBlocked) ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Treatment Settings (Splendor X)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Area Treated</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-md bg-white"
              value={areaTreated}
              onChange={(e) => setAreaTreated(e.target.value)}
            >
              <option value="Underarms">Underarms</option>
              <option value="Bikini">Bikini / Brazilian</option>
              <option value="Legs">Full Legs</option>
              <option value="Back">Back</option>
              <option value="Face">Face</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Spot Size</label>
            <select className="w-full p-2 border border-slate-300 rounded-md bg-white">
              <option>18mm (Square)</option>
              <option>20mm (Square)</option>
              <option>24mm (Square)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fluence (J/cm²)</label>
            <input type="number" className="w-full p-2 border border-slate-300 rounded-md" placeholder="14" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Pulse Width (ms)</label>
            <input type="number" className="w-full p-2 border border-slate-300 rounded-md" placeholder="20" />
          </div>

          {/* New Clinical Fields (v2.5) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-slate-400" />
              Overlap (%)
            </label>
            <select className="w-full p-2 border border-slate-300 rounded-md bg-white">
              <option>10%</option>
              <option>15% (Recommended)</option>
              <option>20%</option>
              <option>25%</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-slate-400" />
              Cooling (Zimmer)
            </label>
            <select className="w-full p-2 border border-slate-300 rounded-md bg-white">
              <option>High (Level 5-6)</option>
              <option>Medium (Level 3-4)</option>
              <option>Low (Level 1-2)</option>
            </select>
          </div>

          {/* Shots Fired Section */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Alex (755nm)</label>
              <input type="number" className="w-full p-2 border border-slate-300 rounded-md" placeholder="0" />
              <p className="text-xs text-slate-400">Prev: {previousSession.shotsAlex}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nd:YAG (1064nm)</label>
              <input type="number" className="w-full p-2 border border-slate-300 rounded-md" placeholder="0" />
              <p className="text-xs text-slate-400">Prev: {previousSession.shotsYag}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
            Clinical Endpoint Reached?
            <span className="text-xs font-normal text-slate-500">(Must observe PFE/Erythema)</span>
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded border border-slate-200 hover:border-blue-300">
              <input type="radio" name="endpoint" className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-700">Mild Erythema</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded border border-slate-200 hover:border-blue-300">
              <input type="radio" name="endpoint" className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-slate-700">PFE (Edema)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded border border-slate-200 hover:border-red-300">
              <input type="radio" name="endpoint" className="w-4 h-4 text-red-600" />
              <span className="text-sm text-slate-700">None / Poor Response</span>
            </label>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium text-slate-700">Notes</label>
          <textarea className="w-full p-2 border border-slate-300 rounded-md h-24" placeholder="Patient reported mild sensitivity on left side..."></textarea>
        </div>

        <button 
          onClick={handleSave}
          disabled={!skinCheck.rechecked}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-5 h-5" />
          Log Session & Schedule Next
        </button>
      </div>

    </div>
  );
}
