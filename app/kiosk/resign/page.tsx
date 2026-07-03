"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Search, User, ChevronRight, ChevronLeft, Loader2, CheckCircle } from 'lucide-react';
import ConsentSignStep, { ConsentCheckboxes, ServiceType } from '@/components/ConsentSignStep';
import { generateConsentSnapshot } from '@/lib/consentSnapshot';

export const dynamic = 'force-dynamic';

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  dob?: string;
  date_of_birth?: string;
  phone?: string;
  baseline_skin_type?: string;
};

/**
 * Re-Sign Consent flow — for existing patients who were onboarded before
 * digital consent capture existed (or whose paper consent needs to be
 * re-captured digitally for audit purposes).
 *
 * Unlike the main kiosk intake form, this does NOT create a new patient
 * record. It links a fresh, immutable consent_records row to the patient's
 * existing id, preserving their treatment/session history.
 *
 * Entry points:
 *  - Kiosk home ("Re-Sign a Consent" option), staff picks the patient.
 *  - Deep link from a patient chart's "Collect Consent Now" button:
 *    /kiosk/resign?patientId=<uuid>&returnTo=<chart-path>  (skips search step)
 */
export default function ResignConsentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <ResignConsentInner />
    </Suspense>
  );
}

function ResignConsentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkPatientId = searchParams.get('patientId');
  const returnTo = searchParams.get('returnTo');

  const [step, setStep] = useState<'search' | 'confirm' | 'consent' | 'done'>(
    deepLinkPatientId ? 'confirm' : 'search'
  );
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [consent, setConsent] = useState<ConsentCheckboxes>({
    risks: false, preCare: false, photos: false, payment: false,
  });
  const [signature, setSignature] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPatients() {
      try {
        setLoadingPatients(true);
        const { data, error } = await supabase
          .from('patients')
          .select('id, first_name, last_name, dob, date_of_birth, phone, baseline_skin_type')
          .order('last_name', { ascending: true });
        if (error) throw error;
        setPatients(data || []);

        if (deepLinkPatientId) {
          const match = (data || []).find((p) => p.id === deepLinkPatientId);
          if (match) setSelectedPatient(match);
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
      } finally {
        setLoadingPatients(false);
      }
    }
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name}`.toLowerCase().includes(query.toLowerCase()) ||
    (p.phone && p.phone.includes(query))
  );

  const patientDob = (p: Patient) => p.dob || p.date_of_birth;

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !serviceType) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const consentId = crypto.randomUUID();
      const signedAt = new Date().toISOString();
      const patientName = `${selectedPatient.first_name} ${selectedPatient.last_name}`;

      const consentHtml = generateConsentSnapshot({
        patientName,
        dob: patientDob(selectedPatient) || '',
        phone: selectedPatient.phone || '',
        email: '',
        serviceType: serviceType as ServiceType,
        signature,
        signedAt,
        consentId,
        checkboxes: consent,
        fitzpatrickType: selectedPatient.baseline_skin_type,
      });

      // Upload immutable HTML snapshot to Storage (same pattern as new intake)
      let storagePath: string | null = null;
      try {
        const fileName = `${consentId}.html`;
        const { error: uploadError } = await supabase.storage
          .from('consents')
          .upload(fileName, new Blob([consentHtml], { type: 'text/html' }), { contentType: 'text/html' });
        if (!uploadError) storagePath = fileName;
      } catch {
        console.warn('Consent storage upload failed, saving inline.');
      }

      const { error: insertError } = await supabase.from('consent_records').insert({
        id: consentId,
        patient_id: selectedPatient.id,
        patient_name: patientName,
        service_type: serviceType,
        signed_at: signedAt,
        signature,
        storage_path: storagePath,
        consent_html: storagePath ? null : consentHtml,
        checkboxes_json: consent,
        fitzpatrick_type: selectedPatient.baseline_skin_type || null,
        source: 're_sign', // distinguishes from original kiosk-intake consent for audit trail
      });

      if (insertError) throw insertError;

      // No localStorage caching — shared kiosk device, PHI must not persist locally.

      setStep('done');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : JSON.stringify(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    if (returnTo) {
      router.push(returnTo);
    } else {
      router.push('/kiosk');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Re-Sign Consent</h1>
          {!deepLinkPatientId && (
            <button
              onClick={() => router.push('/kiosk')}
              className="text-sm text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
        <p className="text-slate-500 text-sm -mt-4">
          For existing patients who don&apos;t have a consent form on file yet. This creates a new,
          legally signed consent record linked to their existing chart — no duplicate patient created.
        </p>

        {step === 'search' && (
          <>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-slate-300 rounded-xl leading-5 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-lg shadow-sm"
                placeholder="Search by name or phone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {loadingPatients ? (
                <div className="p-12 flex justify-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-lg font-medium text-slate-900">No patients found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                          {patient.first_name[0]}{patient.last_name[0]}
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-600">
                            {patient.first_name} {patient.last_name}
                          </h3>
                          <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                            {patientDob(patient) && <span>DOB: {new Date(patientDob(patient)!).toLocaleDateString()}</span>}
                            {patient.phone && <><span className="text-slate-300">•</span><span>{patient.phone}</span></>}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {step === 'confirm' && selectedPatient && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl">
                {selectedPatient.first_name[0]}{selectedPatient.last_name[0]}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedPatient.first_name} {selectedPatient.last_name}</h2>
                {patientDob(selectedPatient) && (
                  <p className="text-sm text-slate-500">DOB: {new Date(patientDob(selectedPatient)!).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Which service is this consent for?</label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'hair_removal', label: 'Laser Hair Removal' },
                  { value: 'tattoo_removal', label: 'Laser Tattoo Removal' },
                  { value: 'skin_treatment', label: 'Laser Skin Treatment' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setServiceType(opt.value as ServiceType)}
                    className={`text-left px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                      serviceType === opt.value
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {!deepLinkPatientId && (
                <button
                  onClick={() => { setStep('search'); setSelectedPatient(null); setServiceType(''); }}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-200 flex items-center justify-center gap-2 min-h-[52px]"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
              <button
                onClick={() => setStep('consent')}
                disabled={!serviceType}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed min-h-[52px]"
              >
                Continue to Consent
              </button>
            </div>
          </div>
        )}

        {step === 'consent' && selectedPatient && (
          <ConsentSignStep
            serviceType={serviceType}
            consent={consent}
            onConsentChange={setConsent}
            signature={signature}
            onSignatureChange={setSignature}
            onBack={() => setStep('confirm')}
            onSubmit={handleSubmit}
            submitting={submitting}
            submitError={submitError}
            submitLabel="Save Signed Consent"
          />
        )}

        {step === 'done' && selectedPatient && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Consent Saved</h2>
            <p className="text-slate-500">
              {selectedPatient.first_name} {selectedPatient.last_name} now has a signed consent on file.
            </p>
            <button
              onClick={handleDone}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              {returnTo ? 'Back to Chart' : 'Done'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
