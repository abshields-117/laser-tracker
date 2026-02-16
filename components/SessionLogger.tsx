"use client";

import React, { useState } from 'react';
import { Save, Calendar, User, Zap, AlertTriangle, Sun } from 'lucide-react';

export default function SessionLogger() {
  const [patient] = useState({ name: 'Sarah Smith', skinType: 'III', package: 'The Essential Duo' });
  const [session, setSession] = useState(4);
  const totalSessions = 8;
  const [skinCheck, setSkinCheck] = useState({ rechecked: false, type: 'III', sunExposure: false });

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
    if (skinCheck.sunExposure) {
      alert("WARNING: Recent sun exposure reported. Treatment may need to be postponed.");
      return;
    }
    alert("Session Saved! Next Appointment: April 12, 2026");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      
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
      <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col gap-3 ${skinCheck.sunExposure ? 'bg-red-50 border-red-200' : ''}`}>
        <div className={`flex items-center gap-2 font-semibold ${skinCheck.sunExposure ? 'text-red-700' : 'text-amber-800'}`}>
          <AlertTriangle className="w-5 h-5" />
          Mandatory Safety Check
        </div>
        
        <div className="space-y-3">
          {/* Sun Exposure Question */}
          <div className="bg-white p-3 rounded-lg border border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Sun className="w-4 h-4 text-orange-500" />
              Has the patient had recent sun exposure / tanning?
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="sun" 
                  checked={skinCheck.sunExposure === true}
                  onChange={() => setSkinCheck({ ...skinCheck, sunExposure: true })}
                  className="w-4 h-4 text-red-600" 
                />
                <span className="text-sm font-bold text-red-600">YES</span>
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="sun" 
                  checked={skinCheck.sunExposure === false}
                  onChange={() => setSkinCheck({ ...skinCheck, sunExposure: false })}
                  className="w-4 h-4 text-green-600" 
                />
                <span className="text-sm font-bold text-green-600">NO</span>
              </label>
            </div>
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

        {skinCheck.sunExposure && (
          <div className="text-red-600 text-sm font-bold flex items-center gap-2 mt-2 bg-red-100 p-2 rounded">
            🛑 STOP: Treatment contraindicated. Consult Medical Director.
          </div>
        )}
      </div>

      {/* Treatment Form - Locked if Sun Exposure is YES or Checkbox is unchecked */}
      <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-opacity ${(!skinCheck.rechecked || skinCheck.sunExposure) ? 'opacity-50 pointer-events-none' : ''}`}>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Treatment Settings (Splendor X)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Area Treated</label>
            <select className="w-full p-2 border border-slate-300 rounded-md bg-white">
              <option>Underarms</option>
              <option>Brazilian</option>
              <option>Full Legs</option>
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

          {/* New Shots Fired Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Total Shots (Alex)</label>
            <input type="number" className="w-full p-2 border border-slate-300 rounded-md" placeholder="0" />
            <p className="text-xs text-slate-500">Previous: {previousSession.shotsAlex}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Total Shots (Nd:YAG)</label>
            <input type="number" className="w-full p-2 border border-slate-300 rounded-md" placeholder="0" />
            <p className="text-xs text-slate-500">Previous: {previousSession.shotsYag}</p>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <label className="text-sm font-medium text-slate-700">Skin Reaction</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-slate-600">Mild Erythema (Redness)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" />
              <span className="text-sm text-slate-600">PFE (Edema)</span>
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
