"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, CheckCircle, Clock, FileText, Loader2, AlertTriangle, ChevronDown, ChevronUp, Shield, Shuffle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PatientSearch from './PatientSearch';
import { Users } from 'lucide-react';

const MEDICAL_LABELS: Record<string, string> = {
  selfTanner: 'Self tanner in last 7 days',
  sunExposure: 'Prolonged sun exposure (last 4 weeks)',
  accutane: 'Accutane in last 6 months',
  pregnant: 'Currently pregnant or breastfeeding',
  recentBirth: 'Given birth in last 12 months',
  photosensitive: 'Photosensitive meds / retinol / retin-a',
  antibiotics: 'Currently taking antibiotics',
  herpesSimplex: 'History of Herpes Simplex',
  keloids: 'History of keloid scarring',
  tattoos: 'Tattoos/permanent makeup in treatment area',
  cancer: 'History of skin cancer',
};

export default function MedicalDirectorDashboard() {
  const router = useRouter();
  const [queue, setQueue] = useState<any[]>([]);
  const [auditQueue, setAuditQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditLoading, setAuditLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'audit' | 'all'>('pending');

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
      setQueue(queue.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error approving patient:', err);
      alert('Failed to approve patient.');
    }
  };

  const generateRandomAudit = async () => {
    try {
      setAuditLoading(true);
      // Fetch all cleared patients with at least one treatment
      const { data: allPatients, error } = await supabase
        .from('patients')
        .select('*')
        .eq('medical_clearance_status', true);

      if (error) throw error;
      if (!allPatients || allPatients.length === 0) {
        setAuditQueue([]);
        setAuditLoading(false);
        return;
      }

      // Select ~10% randomly (minimum 1)
      const auditCount = Math.max(1, Math.ceil(allPatients.length * 0.10));
      const shuffled = [...allPatients].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, auditCount);

      // Fetch latest treatment for each selected patient
      const enriched = await Promise.all(selected.map(async (patient) => {
        const { data: treatments } = await supabase
          .from('treatments')
          .select('*')
          .eq('patient_id', patient.id)
          .order('session_number', { ascending: false })
          .limit(1);
        return { ...patient, latestTreatment: treatments?.[0] || null };
      }));

      setAuditQueue(enriched);
    } catch (err) {
      console.error('Error generating audit:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAuditSignOff = (id: string) => {
    setAuditQueue(auditQueue.filter(p => p.id !== id));
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderMedicalHistory = (history: any) => {
    if (!history || typeof history !== 'object') return <p className="text-sm text-slate-400 italic">No medical history recorded.</p>;

    const flagged = Object.entries(history).filter(([key, val]) => val === true && key !== 'medications');
    const medications = history.medications;

    return (
      <div className="space-y-3">
        {flagged.length > 0 ? (
          <div className="space-y-1">
            {flagged.map(([key]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 font-medium">{MEDICAL_LABELS[key] || key}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span>No medical contraindications flagged</span>
          </div>
        )}
        {medications && medications.trim() !== '' && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <span className="block text-xs font-semibold text-blue-800 uppercase mb-1">Current Medications</span>
            <p className="text-sm text-blue-900">{medications}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-400" />
          Medical Director Oversight
        </h1>
        <p className="text-slate-400 mt-1">Review intake forms and sign off on new patients</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Clock className="w-4 h-4" />
          Pending Intakes ({queue.length})
        </button>
        <button
          onClick={() => { setActiveTab('audit'); if (auditQueue.length === 0) generateRandomAudit(); }}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'audit' ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Shuffle className="w-4 h-4" />
          Random Chart Audit
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all whitespace-nowrap ${activeTab === 'all' ? 'bg-teal-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
          <Users className="w-4 h-4" />
          All Patients
        </button>
      </div>

      {/* ===== PENDING INTAKES TAB ===== */}
      {activeTab === 'pending' && (
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
              <div key={item.id} className="hover:bg-slate-50/50 transition-colors">
                {/* Patient Summary Row */}
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                          {item.first_name?.[0]}{item.last_name?.[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {item.first_name} {item.last_name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            DOB: {item.dob ? new Date(item.dob + 'T00:00:00').toLocaleDateString() : 'N/A'}
                            {item.phone && <> • {item.phone}</>}
                            {item.email && <> • {item.email}</>}
                          </p>
                        </div>
                      </div>

                      {/* Quick Badges */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Pending Review
                        </span>
                        {item.baseline_skin_type && (
                          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Fitzpatrick: Type {item.baseline_skin_type}
                          </span>
                        )}
                        {item.ethnic_background && (
                          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                            {item.ethnic_background}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button 
                        onClick={() => toggleExpand(item.id)}
                        className="px-4 py-2 text-sm text-slate-600 font-medium hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-2 justify-center"
                      >
                        <FileText className="w-4 h-4" />
                        Intake Details
                        {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => router.push(`/patients/${item.id}`)}
                        className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg border border-blue-200"
                      >
                        View Full Chart
                      </button>
                      <button 
                        onClick={() => handleApprove(item.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 justify-center"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve & Sign Off
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Intake Details */}
                {expandedId === item.id && (
                  <div className="px-6 pb-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      
                      {/* Left: Demographics */}
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <User className="w-4 h-4 text-slate-400" />
                          Patient Demographics
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="block text-xs text-slate-500 font-semibold uppercase">Name</span>
                            <span className="text-slate-900 font-medium">{item.first_name} {item.last_name}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 font-semibold uppercase">DOB</span>
                            <span className="text-slate-900 font-medium">{item.dob ? new Date(item.dob + 'T00:00:00').toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 font-semibold uppercase">Phone</span>
                            <span className="text-slate-900 font-medium">{item.phone || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 font-semibold uppercase">Email</span>
                            <span className="text-slate-900 font-medium">{item.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 font-semibold uppercase">Ethnic Background</span>
                            <span className="text-slate-900 font-medium">{item.ethnic_background || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="block text-xs text-slate-500 font-semibold uppercase">Skin Type</span>
                            <span className="text-slate-900 font-medium">Fitzpatrick Type {item.baseline_skin_type || 'N/A'}</span>
                          </div>
                        </div>
                        <div>
                          <span className="block text-xs text-slate-500 font-semibold uppercase mb-1">Intake Submitted</span>
                          <span className="text-slate-900 text-sm font-medium">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Right: Medical History */}
                      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                        <h4 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          Medical History & Contraindications
                        </h4>
                        {renderMedicalHistory(item.medical_history_json)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* ===== ALL PATIENTS TAB ===== */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 md:p-6 overflow-hidden">
          <PatientSearch onSelectPatient={(id) => router.push(`/patients/${id}`)} />
        </div>
      )}

      {/* ===== RANDOM CHART AUDIT TAB ===== */}
      {activeTab === 'audit' && (
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-purple-50 border-b border-purple-100 p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-purple-900 flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-purple-500" />
                Random Chart Audit (10% Sample)
              </h2>
              <p className="text-xs text-purple-600 mt-1">Randomly selected approved patients for chart review and sign-off.</p>
            </div>
            <button
              onClick={generateRandomAudit}
              disabled={auditLoading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {auditLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              New Sample
            </button>
          </div>

          {auditLoading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : auditQueue.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-lg font-medium">No approved patients to audit yet.</p>
              <p className="text-sm">Patients will appear here once they have been approved and treated.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {auditQueue.map((item) => (
                <div key={item.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                          {item.first_name?.[0]}{item.last_name?.[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {item.first_name} {item.last_name}
                          </h3>
                          <p className="text-sm text-slate-500">
                            DOB: {item.dob ? new Date(item.dob + 'T00:00:00').toLocaleDateString() : 'N/A'}
                            {item.phone && <> • {item.phone}</>}
                          </p>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.baseline_skin_type && (
                          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Type {item.baseline_skin_type}
                          </span>
                        )}
                        {item.latestTreatment ? (
                          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full">
                            Last Tx: Session #{item.latestTreatment.session_number} — {new Date(item.latestTreatment.treatment_date).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-1 rounded-full">
                            No treatments yet
                          </span>
                        )}
                        {item.latestTreatment?.fluence_jcm2 && (
                          <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded-full">
                            {item.latestTreatment.fluence_jcm2} J/cm²
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button 
                        onClick={() => router.push(`/patients/${item.id}`)}
                        className="px-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg border border-blue-200 flex items-center gap-2 justify-center"
                      >
                        <Eye className="w-4 h-4" /> Review Full Chart
                      </button>
                      <button 
                        onClick={() => handleAuditSignOff(item.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 justify-center"
                      >
                        <CheckCircle className="w-4 h-4" /> Chart Reviewed ✓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
