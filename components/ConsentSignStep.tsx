"use client";

import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

export type ServiceType = 'hair_removal' | 'tattoo_removal' | 'skin_treatment';

export interface ConsentCheckboxes {
  risks: boolean;
  preCare: boolean;
  photos: boolean;
  payment: boolean;
}

interface ConsentSignStepProps {
  serviceType: ServiceType | '';
  consent: ConsentCheckboxes;
  onConsentChange: (consent: ConsentCheckboxes) => void;
  signature: string;
  onSignatureChange: (signature: string) => void;
  onBack?: () => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string | null;
  submitLabel?: string;
}

/**
 * Shared consent review + digital signature UI.
 * Used by the new-patient kiosk intake flow AND the existing-patient
 * "Re-Sign Consent" flow, so the legal text and required-fields logic
 * only live in one place.
 */
export default function ConsentSignStep({
  serviceType,
  consent,
  onConsentChange,
  signature,
  onSignatureChange,
  onBack,
  onSubmit,
  submitting,
  submitError,
  submitLabel = 'Submit',
}: ConsentSignStepProps) {
  const allChecked = consent.risks && consent.preCare && consent.photos && consent.payment;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-500" />
        Consent &amp; Sign
      </h2>

      <div className="max-h-[280px] overflow-y-auto p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-2">
        {serviceType === 'hair_removal' && (
          <>
            <p><strong>1. RISKS:</strong> I understand laser hair removal may cause temporary redness, swelling, blistering, or changes in skin pigmentation. Rare risks include burns or scarring.</p>
            <p><strong>2. RESULTS:</strong> Multiple sessions are required. Permanent hair reduction (not complete removal) is not guaranteed. Individual results vary.</p>
            <p><strong>3. PRE/POST CARE:</strong> I agree to avoid sun exposure, tanning beds, and self-tanners for 4 weeks before and after each treatment. I will notify staff of any medication changes.</p>
            <p><strong>4. PHOTOS:</strong> I consent to before/after photos for clinical documentation. These will not be used publicly without separate written authorization.</p>
            <p><strong>5. FINANCIAL:</strong> Payment is due at time of service. Packages are non-refundable. Missed appointments without 24-hour notice may be charged a $50 cancellation fee.</p>
          </>
        )}
        {serviceType === 'tattoo_removal' && (
          <>
            <p><strong>1. RISKS:</strong> Laser tattoo removal may cause redness, swelling, blistering, scabbing, and pigment changes (lightening or darkening). Rare risks include scarring and permanent skin texture changes.</p>
            <p><strong>2. INCOMPLETE REMOVAL:</strong> Complete removal is NOT guaranteed. Results vary by ink color, depth, age, and skin type. 6–15+ sessions are typically required.</p>
            <p><strong>3. INK COLORS:</strong> Black/dark blue inks respond best. Red, green, yellow, and light colors are significantly harder to remove and may not fully clear.</p>
            <p><strong>4. PARADOXICAL DARKENING:</strong> Certain inks (white, flesh-tone, iron oxide) may darken upon laser exposure. This risk has been explained to me.</p>
            <p><strong>5. PRE/POST CARE:</strong> Keep treated area clean, protected from sun, and moisturized. Do not pick or scratch treated skin. Notify staff of any medication changes.</p>
            <p><strong>6. PHOTOS:</strong> I consent to before/after photos for clinical documentation. These will not be used publicly without separate written authorization.</p>
            <p><strong>7. FINANCIAL:</strong> Payment is due at time of service. Packages are non-refundable.</p>
            <p><strong>8. INSURANCE:</strong> I understand a signed consent form is required by the provider&apos;s liability insurance (Policy 0100208711-3) for this service.</p>
          </>
        )}
        {serviceType === 'skin_treatment' && (
          <>
            <p><strong>1. RISKS:</strong> Pico laser skin treatments may cause temporary redness, swelling, darkening of targeted spots, or pigment changes. Rare risks include blistering or scarring.</p>
            <p><strong>2. RESULTS:</strong> Results vary by individual, skin type, and condition treated. Multiple sessions may be required. Results are not guaranteed.</p>
            <p><strong>3. PRE/POST CARE:</strong> Avoid sun for 4 weeks before and after treatment. No retinol or active exfoliants for 5 days prior. Use SPF 30+ daily after treatment.</p>
            <p><strong>4. PHOTOS:</strong> I consent to before/after photos for clinical documentation. These will not be used publicly without separate written authorization.</p>
            <p><strong>5. FINANCIAL:</strong> Payment is due at time of service. Packages are non-refundable.</p>
          </>
        )}
        {!serviceType && (
          <p className="italic text-slate-400">Select a service type to view the consent terms.</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox" className="w-6 h-6 text-blue-600"
            checked={consent.risks}
            onChange={e => onConsentChange({ ...consent, risks: e.target.checked })}
          />
          <span className="text-sm text-slate-700">I have read and understand all risks listed above</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox" className="w-6 h-6 text-blue-600"
            checked={consent.preCare}
            onChange={e => onConsentChange({ ...consent, preCare: e.target.checked })}
          />
          <span className="text-sm text-slate-700">I agree to follow all pre/post care instructions</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox" className="w-6 h-6 text-blue-600"
            checked={consent.photos}
            onChange={e => onConsentChange({ ...consent, photos: e.target.checked })}
          />
          <span className="text-sm text-slate-700">I consent to clinical photography</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox" className="w-6 h-6 text-blue-600"
            checked={consent.payment}
            onChange={e => onConsentChange({ ...consent, payment: e.target.checked })}
          />
          <span className="text-sm text-slate-700">I agree to the financial policy</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Digital Signature</label>
        <input
          type="text"
          className="w-full p-3 border-b-2 border-slate-300 bg-slate-50 focus:border-blue-500 outline-none font-serif italic text-lg text-slate-900 text-base"
          placeholder="Type your full name to sign"
          value={signature}
          onChange={e => onSignatureChange(e.target.value)}
        />
        <p className="text-xs text-slate-400 mt-1">By typing your name, you agree this is a legal signature.</p>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
          {submitError}
        </div>
      )}

      <div className="flex gap-4 mt-4">
        {onBack && (
          <button onClick={onBack} disabled={submitting} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50 min-h-[52px]">
            Back
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={!signature || !allChecked || submitting || !serviceType}
          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px]"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : submitLabel}
        </button>
      </div>
    </div>
  );
}
