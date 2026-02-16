"use client";

import React, { useState } from 'react';
import { User, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';

const MOCK_QUEUE = [
  { id: 4, name: 'Jessica Walters', dob: '1992-06-15', status: 'Pending Intake', notes: 'New enrollment. Needs GFE.' },
  { id: 5, name: 'David Kim', dob: '1988-09-02', status: 'Review Treatments', notes: 'Adverse reaction reported (mild edema).' },
];

export default function MedicalDirectorDashboard() {
  const [queue, setQueue] = useState(MOCK_QUEUE);

  const handleApprove = (id: number) => {
    setQueue(queue.filter(p => p.id !== id));
    alert(`Patient #${id} Approved & Signed Off by Medical Director.`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-8 h-8 text-blue-400" />
          Medical Director Oversight
        </h1>
        <p className="text-slate-400 mt-1">Dr. Alison Shields, DDS • License #12345</p>
      </div>

      {/* Action Queue */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Pending Review Queue ({queue.length})
        </h2>

        {queue.length === 0 ? (
          <div className="bg-green-50 p-8 rounded-xl text-center border border-green-200">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-800 font-medium">All caught up! No charts pending review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {queue.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                  <p className="text-sm text-slate-500 mb-2">DOB: {item.dob}</p>
                  <div className="flex gap-2 mb-2">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-semibold uppercase">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 mt-2">
                    <span className="font-semibold">Clinical Note:</span> {item.notes}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded">
                    View Full Chart
                  </button>
                  <button 
                    onClick={() => handleApprove(item.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Sign & Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Random Audit Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
        <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-500" />
          Monthly Audit (Compliance)
        </h3>
        <p className="text-sm text-slate-600 mb-4">Randomly select 10% of active charts for quality assurance review.</p>
        <button className="text-sm bg-white border border-slate-300 hover:bg-slate-100 px-4 py-2 rounded font-medium text-slate-700">
          Generate Audit List
        </button>
      </div>

    </div>
  );
}
