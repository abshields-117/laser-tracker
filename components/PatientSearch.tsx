"use client";

import React, { useState } from 'react';
import { Search, User, ChevronRight } from 'lucide-react';

// Mock Data
const MOCK_PATIENTS = [
  { id: 1, name: 'Sarah Smith', dob: '1990-05-12', package: 'The Essential Duo', progress: 4, total: 8, lastVisit: 'Feb 14' },
  { id: 2, name: 'Mike Jones', dob: '1985-11-23', package: 'The Athlete\'s Back', progress: 2, total: 8, lastVisit: 'Jan 30' },
  { id: 3, name: 'Emily Blunt', dob: '1995-02-14', package: 'Total Body', progress: 7, total: 8, lastVisit: 'Feb 10' },
];

interface PatientSearchProps {
  onSelectPatient: (patientId: number) => void;
}

export default function PatientSearch({ onSelectPatient }: PatientSearchProps) {
  const [query, setQuery] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Patient Lookup</h1>
        <div className="text-sm text-slate-500">Today: Feb 15</div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by name or DOB..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {filteredPatients.map((patient) => (
          <div 
            key={patient.id}
            onClick={() => onSelectPatient(patient.id)}
            className="bg-white p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex justify-between items-center group"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {patient.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{patient.name}</h3>
                <div className="text-xs text-slate-500 flex gap-2">
                  <span>{patient.package}</span>
                  <span>•</span>
                  <span className={patient.progress === patient.total ? 'text-green-600 font-bold' : 'text-slate-500'}>
                    Session {patient.progress}/{patient.total}
                  </span>
                </div>
              </div>
            </div>
            
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No patients found.
          </div>
        )}
      </div>

    </div>
  );
}
