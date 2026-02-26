"use client";

import React, { useState } from 'react';
import { Save, Calendar, User, Zap, AlertTriangle, Sun, Gauge, Thermometer, Edit2, Check } from 'lucide-react';

const PACKAGES = [
  { group: "Female Packages", items: ["Smooth Face & Neck", "The Essential Duo", "The College Prep", "The Full Leg", "The Total Body"] },
  { group: "Men's Packages", items: ["The Clean Neck", "The Athlete's Back", "Upper Body Complete"] },
  { group: "Other", items: ["Other (Please specify)"] }
];

const STANDARD_AREAS = ['Underarms', 'Bikini / Brazilian', 'Full Legs', 'Back', 'Face', 'Neck', 'Arms', 'Chest'];

export default function SessionLogger() {
  const [patient, setPatient] = useState({ name: 'Sarah Smith', skinType: 'III' });
  const [session, setSession] = useState(4);
  const [totalSessions, setTotalSessions] = useState(8);
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  
  const [selectedPackage, setSelectedPackage] = useState('The Essential Duo');
  const [otherPackage, setOtherPackage] = useState('');
  
  const [skinCheck, setSkinCheck] = useState({ rechecked: false, type: 'III', sunExposure: false });
  const [exposedAreas, setExposedAreas] = useState<string[]>([]);
  
  // Area Treated is now an array + other
  const [treatedAreas, setTreatedAreas] = useState<string[]>(['Underarms']);
  const [otherTreatedArea, setOtherTreatedArea] = useState('');

  // Mock previous session data (This would come from DB)
  const previousSession = {
    shotsAlex: 1250,
    shotsYag: 450
  };

  const handleSave = () => {
    if (!skinCheck.rechecked) {
      alert("Please confirm the Fitzpatrick Skin Type before saving.");
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

  const toggleTreatedArea = (area: string) => {
    if (treatedAreas.includes(area)) {
      setTreatedAreas(treatedAreas.filter(a => a !== area));
    } else {
      setTreatedAreas([...treatedAreas, area]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 pb-20">
      
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              {patient.name}
            </h1>
            <p className="text-slate-500 mt-1">Baseline: Type <span className="font-semibold text-slate-800">{patient.skinType}</span></p>
          </div>
          <div className="text-right w-1/2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Package Type</label>
            <select 
              className="w-full p-2 border border-slate-300 rounded-md bg-white text-sm font-semibold text-blue-700"
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
            >
              {PACKAGES.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {selectedPackage === 'Other (Please specify)' && (
              <input 
                type="text" 
                placeholder="Specify package..." 
                className="w-full mt-2 p-2 border border-slate-300 rounded-md text-sm text-slate-900"
                value={otherPackage}
                onChange={(e) => setOtherPackage(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex justify-between items-center mb-2">
            {isEditingProgress ? (
              <div className="flex items-center gap-2">
                <input 
                  type="number" className="w-16 p-1 text-center border rounded text-slate-900 text-sm" 
                  value={session} onChange={(e) => setSession(Number(e.target.value))}
                />
                <span className="text-slate-500">of</span>
                <input 
                  type="number" className="w-16 p-1 text-center border rounded text-slate-900 text-sm" 
                  value={totalSessions} onChange={(e) => setTotalSessions(Number(e.target.value))}
                />
                <button onClick={() => setIsEditingProgress(false)} className="p-1 text-green-600 hover:bg-green-100 rounded">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-700">Session {session} of {totalSessions}</span>
                <button onClick={() => setIsEditingProgress(true)} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="text-sm font-medium text-slate-600">{Math.round((session / totalSessions) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min((session / totalSessions) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Safety Check: Mandatory Re-Type & Sun Exposure */}
      <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3`}>
        <div className={`flex items-center gap-2 font-semibold text-amber-800`}>
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
                <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Select Exposed Areas (Proceed with Caution):</p>
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
              className="p-2 border border-amber-300 rounded bg-white text-sm text-slate-900"
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

        {skinCheck.sunExposure && (
          <div className="text-amber-700 text-sm font-medium flex items-center gap-2 mt-2 bg-amber-100 p-2 rounded">
            ⚠️ Sun exposure reported. Adjust settings accordingly or postpone if indicated.
          </div>
        )}
      </div>

      {/* Treatment Form - Locked if Unchecked */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-opacity ${(!skinCheck.rechecked) ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Treatment Settings (Splendor X)
        </h2>
        
        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <label className="block text-sm font-semibold text-slate-800 mb-3">Areas Treated Today:</label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {STANDARD_AREAS.map(area => (
              <label key={area} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={treatedAreas.includes(area)}
                  onChange={() => toggleTreatedArea(area)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300"
                />
                <span className="text-sm text-slate-700">{area}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={treatedAreas.includes('Other')}
                onChange={() => toggleTreatedArea('Other')}
                className="w-4 h-4 text-blue-600 rounded border-slate-300"
              />
              <span className="text-sm text-slate-700">Other (Specify)</span>
            </label>
          </div>
          {treatedAreas.includes('Other') && (
            <input 
              type="text" 
              placeholder="E.g., Hands, Feet, Happy Trail..." 
              className="w-full p-2 border border-slate-300 rounded-md text-sm text-slate-900 mt-1"
              value={otherTreatedArea}
              onChange={(e) => setOtherTreatedArea(e.target.value)}
            />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Spot Size</label>
            <select className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900">
              <option>18mm (Square)</option>
              <option>20mm (Square)</option>
              <option>24mm (Square)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Fluence (J/cm²)</label>
            <input type="number" className="w-full p-2 border border-slate-300 rounded-md text-slate-900" placeholder="14" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Pulse Width (ms)</label>
            <input type="number" className="w-full p-2 border border-slate-300 rounded-md text-slate-900" placeholder="20" />
          </div>

          {/* New Clinical Fields (v2.5) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-slate-400" />
              Overlap (%)
            </label>
            <select className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900">
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
            <select className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900">
              <option>High (Level 5-6)</option>
              <option>Medium (Level 3-4)</option>
              <option>Low (Level 1-2)</option>
            </select>
          </div>

          {/* Shots Fired Section */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Alex (755nm)</label>
              <input type="number" className="w-full p-2 border border-slate-300 rounded-md text-slate-900" placeholder="0" />
              <p className="text-xs text-slate-400">Prev: {previousSession.shotsAlex}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Nd:YAG (1064nm)</label>
              <input type="number" className="w-full p-2 border border-slate-300 rounded-md text-slate-900" placeholder="0" />
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
          <textarea className="w-full p-2 border border-slate-300 rounded-md h-24 text-slate-900" placeholder="Patient reported mild sensitivity on left side..."></textarea>
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
