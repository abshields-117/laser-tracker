"use client";

import React, { useState } from 'react';
import IntakeForm from '@/components/IntakeForm';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function KioskPage() {
  const router = useRouter();
  const [taps, setTaps] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  // Triple-tap the header to reveal sign-out — keeps it hidden from patients
  const handleHeaderTap = () => {
    const next = taps + 1;
    setTaps(next);
    if (next >= 3) {
      setShowConfirm(true);
      setTaps(0);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header — triple-tap to reveal sign-out */}
      <div
        className="bg-slate-900 p-4 text-center border-b border-slate-800 select-none"
        onPointerDown={handleHeaderTap}
      >
        <h1 className="text-xl font-bold tracking-tight text-white">Harlan Esthetics</h1>
        <p className="text-xs text-slate-400 mt-1">Patient Intake Portal</p>
      </div>

      <div className="flex-1 bg-slate-50 overflow-auto">
        <IntakeForm />
      </div>

      {/* Sign-out confirm — only shown after triple-tap */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 text-center">
            <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 text-slate-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Staff Sign Out</h2>
              <p className="text-sm text-slate-500 mt-1">This will sign out the kiosk account and return to the login screen.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setTaps(0); }}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
