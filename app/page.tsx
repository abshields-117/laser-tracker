"use client";

import React, { useState } from 'react';
import SessionLogger from '@/components/SessionLogger';
import PatientSearch from '@/components/PatientSearch';

export default function Home() {
  const [view, setView] = useState<'search' | 'logger'>('search');
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      
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
            className="mb-4 mx-6 text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1"
          >
            ← Back to Search
          </button>
          <SessionLogger />
        </div>
      )}

    </main>
  );
}
