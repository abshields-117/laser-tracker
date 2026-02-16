"use client";

import React from 'react';
import { User, Activity, Calendar } from 'lucide-react';

export default function PatientPortal() {
  const patient = {
    name: "Patient View (Demo)",
    progress: 4,
    total: 8,
    nextAppt: "April 12, 2026",
    package: "Total Body Laser"
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Laser Portal</h1>
        <p className="text-sm text-slate-500">Welcome back, Sarah!</p>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Progress
            </h2>
            <p className="text-sm text-slate-500">{patient.package}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">{patient.progress}/{patient.total}</span>
            <span className="block text-xs text-slate-400 font-medium uppercase tracking-wide">Sessions</span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div className="bg-blue-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(patient.progress / patient.total) * 100}%` }}></div>
        </div>
        <p className="text-xs text-center text-slate-400">You're halfway there! ✨</p>
      </div>

      {/* Next Appt */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-6 border border-blue-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-blue-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Next Appointment
          </h3>
          <p className="text-blue-700 mt-1 font-medium">{patient.nextAppt}</p>
        </div>
        <button className="bg-white text-blue-600 font-bold px-4 py-2 rounded-lg text-sm shadow-sm hover:bg-blue-50 transition-colors">
          Reschedule
        </button>
      </div>

      {/* Forms & Consents */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide px-2">Required Actions</h3>
        
        <button className="w-full bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm flex justify-between items-center group transition-all text-left">
          <div>
            <span className="block font-semibold text-slate-800 group-hover:text-blue-600">Sign Treatment Consent</span>
            <span className="text-xs text-amber-500 font-medium">Pending Signature • Due Now</span>
          </div>
          <span className="text-slate-300 group-hover:text-blue-500">→</span>
        </button>

        <button className="w-full bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm flex justify-between items-center group transition-all text-left opacity-60">
          <div>
            <span className="block font-semibold text-slate-800">Post-Care Instructions</span>
            <span className="text-xs text-green-600 font-medium">Read & Acknowledged</span>
          </div>
          <span className="text-slate-300">✓</span>
        </button>
      </div>

    </div>
  );
}
