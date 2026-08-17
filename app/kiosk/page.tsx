import React from 'react';
import IntakeForm from '@/components/IntakeForm';
import KioskHeader from '@/components/KioskHeader';

export const dynamic = 'force-dynamic';

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <KioskHeader />
      <div className="flex-1 bg-slate-50 overflow-auto">
        <IntakeForm />
      </div>
    </div>
  );
}
