"use client";

import React, { useState } from 'react';
import { Save, AlertTriangle, CheckCircle, FileText, ChevronRight } from 'lucide-react';

export default function IntakeForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', email: '', phone: '',
    skinType: 'III', // Patient self-selects (Tech confirms later)
    medical: {
      accutane: false,
      sunExposure: false,
      pregnant: false,
      herpesSimplex: false,
      keloids: false,
      tattoos: false,
      cancer: false,
      medications: ''
    },
    consent: {
      risks: false,
      photos: false,
      payment: false,
      cancellation: false
    },
    signature: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    alert("Intake Form Submitted! Thank you, " + formData.firstName);
    // Here we would save to Supabase
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Patient Intake</h1>
        <div className="flex justify-center gap-2 mt-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 w-8 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-2">Step {step} of 3</p>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Your Details
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">First Name</label>
              <input 
                type="text" className="w-full p-2 border rounded-md" 
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Last Name</label>
              <input 
                type="text" className="w-full p-2 border rounded-md" 
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
            <input 
              type="date" className="w-full p-2 border rounded-md" 
              value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input 
                type="email" className="w-full p-2 border rounded-md" 
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input 
                type="tel" className="w-full p-2 border rounded-md" 
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <button onClick={handleNext} className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
            Next: Medical History <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Medical History (Contraindications) */}
      {step === 2 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Medical Safety Check
          </h2>
          <p className="text-sm text-slate-500">Please answer honestly for your safety.</p>

          <div className="space-y-3">
            {[
              { key: 'accutane', label: 'Have you taken Accutane in the last 6 months?' },
              { key: 'sunExposure', label: 'Have you had active sun exposure/tanning in the last 4 weeks?' },
              { key: 'pregnant', label: 'Are you currently pregnant or breastfeeding?' },
              { key: 'herpesSimplex', label: 'Do you have a history of cold sores (Herpes Simplex)?' },
              { key: 'keloids', label: 'Do you have a history of keloid scarring?' },
              { key: 'tattoos', label: 'Do you have tattoos or permanent makeup in the treatment area?' }
            ].map(item => (
              <label key={item.key} className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input 
                  type="checkbox" className="mt-1 w-5 h-5 text-blue-600 rounded"
                  // @ts-ignore
                  checked={formData.medical[item.key]}
                  // @ts-ignore
                  onChange={e => setFormData({...formData, medical: {...formData.medical, [item.key]: e.target.checked}})}
                />
                <span className="text-sm text-slate-700">{item.label}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Current Medications</label>
            <textarea 
              className="w-full p-2 border rounded-md h-20 text-sm" 
              placeholder="List all medications, vitamins, and supplements..."
              value={formData.medical.medications}
              onChange={e => setFormData({...formData, medical: {...formData.medical, medications: e.target.value}})}
            ></textarea>
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-200">Back</button>
            <button onClick={handleNext} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Next: Consent</button>
          </div>
        </div>
      )}

      {/* Step 3: Consent & Signature */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Consent & Sign
          </h2>

          <div className="h-40 overflow-y-auto p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600 space-y-2">
            <p><strong>1. Risks:</strong> I understand laser hair removal may cause redness, swelling, blistering, or changes in skin pigment.</p>
            <p><strong>2. Results:</strong> I understand that multiple sessions are required and permanent reduction is not guaranteed.</p>
            <p><strong>3. Financial:</strong> I understand payment is due at time of service and packages are non-refundable.</p>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" className="w-4 h-4 text-blue-600"
                checked={formData.consent.risks}
                onChange={e => setFormData({...formData, consent: {...formData.consent, risks: e.target.checked}})}
              />
              <span className="text-sm text-slate-700">I have read and accept the risks.</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" className="w-4 h-4 text-blue-600"
                checked={formData.consent.payment}
                onChange={e => setFormData({...formData, consent: {...formData.consent, payment: e.target.checked}})}
              />
              <span className="text-sm text-slate-700">I agree to the financial policy.</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Digital Signature</label>
            <input 
              type="text" 
              className="w-full p-3 border-b-2 border-slate-300 bg-slate-50 focus:border-blue-500 outline-none font-serif italic text-lg"
              placeholder="Type your full name to sign"
              value={formData.signature}
              onChange={e => setFormData({...formData, signature: e.target.value})}
            />
            <p className="text-xs text-slate-400 mt-1">By typing your name, you agree this is a legal signature.</p>
          </div>

          <div className="flex gap-4 mt-4">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-200">Back</button>
            <button 
              onClick={handleSubmit} 
              disabled={!formData.signature || !formData.consent.risks}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Submit Intake
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
