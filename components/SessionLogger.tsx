"use client";

import React, { useState } from 'react';
import { Save, Calendar, User, Zap } from 'lucide-react';

export default function SessionLogger() {
  const [patient] = useState({ name: 'Sarah Smith', skinType: 'III', package: 'The Essential Duo' });
  const [session, setSession] = useState(4);
  const totalSessions = 8;

  const handleSave = () => {
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
            <p className="text-slate-500 mt-1">Fitzpatrick Type: <span className="font-semibold text-slate-800">{patient.skinType}</span></p>
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

      {/* Treatment Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-5 h-5" />
          Log Session & Schedule Next
        </button>
      </div>

    </div>
  );
}
