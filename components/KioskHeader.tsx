"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { LogOut, FileSignature } from 'lucide-react';

export default function KioskHeader() {
  const router = useRouter();
  const [taps, setTaps] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <>
      <div
        className="bg-slate-900 p-4 text-center border-b border-slate-800 select-none relative"
        onPointerDown={handleHeaderTap}
      >
        <h1 className="text-xl font-bold tracking-tight text-white">Harlan Esthetics</h1>
        <p className="text-xs text-slate-400 mt-1">Patient Intake Portal</p>
        <button
          onClick={(e) => { e.stopPropagation(); router.push('/kiosk/resign'); }}
          className="absolute right-3 top-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <FileSignature className="w-3.5 h-3.5" />
          Re-Sign Consent
        </button>
      </div>

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
    </>
  );
}
