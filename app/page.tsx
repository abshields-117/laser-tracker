"use client";

import React, { useState } from 'react';
import SessionLogger from '@/components/SessionLogger';
import PatientSearch from '@/components/PatientSearch';
import MedicalDirectorDashboard from '@/components/MedicalDirectorDashboard';
import PatientPortal from '@/components/PatientPortal';
import IntakeForm from '@/components/IntakeForm';
import { User, Activity, ShieldCheck, LogOut, FileText } from 'lucide-react';

export default function Home() {
  const [view, setView] = useState<'home' | 'search' | 'logger' | 'md' | 'patient' | 'intake'>('home');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  // Role Switcher (Simulated Login)
  if (view === 'home') {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Harlan Laser Tracker</h1>
            <p className="mt-2 text-slate-400">Select your role to continue.</p>
          </div>
          
          <div className="grid gap-4">
            <button 
              onClick={() => setView('search')}
              className="w-full p-6 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all group flex items-center gap-4 text-left"
            >
              <div className="bg-blue-500/10 p-3 rounded-lg group-hover:bg-blue-500/20">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <span className="block text-lg font-semibold text-white">Staff / Tech</span>
                <span className="text-sm text-slate-400">Log treatments & lookup patients</span>
              </div>
            </button>

            <button 
              onClick={() => setView('md')}
              className="w-full p-6 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all group flex items-center gap-4 text-left"
            >
              <div className="bg-amber-500/10 p-3 rounded-lg group-hover:bg-amber-500/20">
                <ShieldCheck className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="block text-lg font-semibold text-white">Medical Director</span>
                <span className="text-sm text-slate-400">Review charts & approve safety</span>
              </div>
            </button>

            <button 
              onClick={() => setView('intake')}
              className="w-full p-6 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all group flex items-center gap-4 text-left"
            >
              <div className="bg-purple-500/10 p-3 rounded-lg group-hover:bg-purple-500/20">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <span className="block text-lg font-semibold text-white">New Patient Intake</span>
                <span className="text-sm text-slate-400">Fill History & Sign Consent</span>
              </div>
            </button>

            <button 
              onClick={() => setView('patient')}
              className="w-full p-6 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all group flex items-center gap-4 text-left"
            >
              <div className="bg-green-500/10 p-3 rounded-lg group-hover:bg-green-500/20">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <span className="block text-lg font-semibold text-white">My Portal (Demo)</span>
                <span className="text-sm text-slate-400">View progress & next appt</span>
              </div>
            </button>
          </div>
          
          <p className="text-center text-xs text-slate-600 mt-8">v2.4 Beta • HIPAA Compliant Prototype</p>
        </div>
      </main>
    );
  }

  // App Layout for other views
  return (
    <main className="min-h-screen bg-slate-50 relative">
      
      {/* Top Nav (Logout) */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setView('home')}
          className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-slate-100 border border-slate-200 text-slate-500"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {view === 'search' && (
        <PatientSearch onSelectPatient={(id) => {
          setSelectedPatientId(id);
          setView('logger');
        }} />
      )}

      {view === 'logger' && (
        <div>
          <button 
            onClick={() => setView('search')}
            className="absolute top-4 right-4 text-sm text-blue-600 font-medium hover:text-blue-800 z-50"
          >
            Switch Patient
          </button>
          <SessionLogger />
        </div>
      )}

      {view === 'md' && <MedicalDirectorDashboard />}
      
      {view === 'patient' && <PatientPortal />}

      {view === 'intake' && <IntakeForm />}

    </main>
  );
}
