"use client";

import React from 'react';
import IntakeForm from '@/components/IntakeForm';

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="bg-slate-900 p-4 text-center border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white">Harlan Esthetics</h1>
        <p className="text-xs text-slate-400 mt-1">Patient Intake Portal</p>
      </div>
      
      <div className="flex-1 bg-slate-50 overflow-auto">
        <IntakeForm />
      </div>
    </div>
  );
}
