"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, CheckCircle, Clock, FileText, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MedicalDirectorDashboard() {
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingIntakes();
  }, []);

  async function fetchPendingIntakes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('medical_clearance_status', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQueue(data || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update({ medical_clearance_status: true })
        .eq('id', id);

      if (error) throw error;
      
      // Remove from queue locally
      setQueue(queue.filter(p => p.id !== id));
      alert(`Patient Approved & Signed Off.`);
    } catch (err) {
      console.error('Error approving patient:', err);
      alert('Failed to approve patient.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="w-8 h-8 text-blue-400" />
          Medical Director Oversight
        </h1>
        <p className="text-slate-400 mt-1">Pending Intakes & Consents</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Patients Awaiting Sign-off ({queue.length})
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm">No new patients waiting for review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {queue.map((item) => (
              <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-slate-900">
                        {item.first_name} {item.last_name}
                      </h3>
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Pending
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1 space-y-1">
                      <p>DOB: {new Date(item.date_of_birth).toLocaleDateString()}</p>
                      <p className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Signed consent on file.
                      </p>
                      {item.photosensitive_meds && (
                         <p className="text-red-500 font-medium">⚠️ Flagged for Photosensitive Meds</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => router.push(`/patients/${item.id}`)}
                      className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded"
                    >
                      View Full Chart
                    </button>
                    <button 
                      onClick={() => handleApprove(item.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 justify-center"
                    >
                      <CheckCircle className="w-4 h-4" /> Sign Off
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
