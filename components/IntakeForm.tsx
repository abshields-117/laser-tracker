"use client";

import React, { useState } from 'react';
import { Save, AlertTriangle, CheckCircle, FileText, ChevronRight, Zap, Sparkles } from 'lucide-react';

export default function IntakeForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    serviceType: '',
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
      medications: '',
      // Tattoo-specific fields
      tattooColors: [] as string[],
      tattooAge: '',
      priorRemoval: '',
      tattooType: ''
    },
    consent: {
      risks: false,
      photos: false,
      prePostCare: false,
      payment: false
    },
    signature: ''
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = () => {
    alert("Intake Form Submitted! Thank you, " + formData.firstName);
    // Here we would save to Supabase
  };

  const toggleTattooColor = (color: string) => {
    const colors = formData.medical.tattooColors;
    if (colors.includes(color)) {
      setFormData({
        ...formData,
        medical: {
          ...formData.medical,
          tattooColors: colors.filter(c => c !== color)
        }
      });
    } else {
      setFormData({
        ...formData,
        medical: {
          ...formData.medical,
          tattooColors: [...colors, color]
        }
      });
    }
  };

  // Check if all consent checkboxes are checked
  const allConsentsChecked = formData.consent.risks && 
                             formData.consent.photos && 
                             formData.consent.prePostCare && 
                             formData.consent.payment;

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Patient Intake</h1>
        <div className="flex justify-center gap-2 mt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 w-8 rounded-full ${step >= i ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-2">Step {step} of 4</p>
      </div>

      {/* Step 1: Service Type Selection */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Select Your Service
          </h2>
          <p className="text-sm text-slate-500">Choose the treatment you're here for today.</p>
          
          <div className="space-y-3">
            {/* Laser Hair Removal */}
            <button
              onClick={() => {
                setFormData({...formData, serviceType: 'hair_removal'});
                handleNext();
              }}
              className="w-full p-5 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-400 transition-all text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Laser Hair Removal</h3>
                <p className="text-sm text-slate-600">Permanent hair reduction treatment</p>
              </div>
            </button>

            {/* Laser Tattoo Removal */}
            <button
              onClick={() => {
                setFormData({...formData, serviceType: 'tattoo_removal'});
                handleNext();
              }}
              className="w-full p-5 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-400 transition-all text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Laser Tattoo Removal</h3>
                <p className="text-sm text-slate-600">Advanced PicoKing laser tattoo removal</p>
              </div>
            </button>

            {/* Laser Skin Treatment */}
            <button
              onClick={() => {
                setFormData({...formData, serviceType: 'skin_treatment'});
                handleNext();
              }}
              className="w-full p-5 bg-teal-50 border-2 border-teal-200 rounded-xl hover:bg-teal-100 hover:border-teal-400 transition-all text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-lg">Laser Skin Treatment</h3>
                <p className="text-sm text-slate-600">Pico facials, pigment removal, carbon peel</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Personal Info */}
      {step === 2 && (
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

          <div className="flex gap-4 mt-4">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-200">Back</button>
            <button onClick={handleNext} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2">
              Next: Medical History <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Medical History (Contraindications) */}
      {step === 3 && (
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

          {/* Tattoo-specific questions */}
          {formData.serviceType === 'tattoo_removal' && (
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-4">
              <h3 className="font-semibold text-slate-800 text-sm">Tattoo Information</h3>
              
              {/* Tattoo Colors */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">What color(s) is the tattoo?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Black', 'Blue', 'Red', 'Green', 'Yellow', 'Multi-color'].map(color => (
                    <label key={color} className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 rounded hover:bg-white">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-purple-600 rounded"
                        checked={formData.medical.tattooColors.includes(color)}
                        onChange={() => toggleTattooColor(color)}
                      />
                      <span className="text-sm text-slate-700">{color}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tattoo Age */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">How old is the tattoo?</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-sm"
                  value={formData.medical.tattooAge}
                  onChange={e => setFormData({...formData, medical: {...formData.medical, tattooAge: e.target.value}})}
                >
                  <option value="">Select...</option>
                  <option value="<1">Less than 1 year</option>
                  <option value="1-3">1–3 years</option>
                  <option value="3-5">3–5 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>

              {/* Prior Removal */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Has the tattoo had any prior removal attempts?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priorRemoval"
                      className="w-4 h-4 text-purple-600"
                      checked={formData.medical.priorRemoval === 'yes'}
                      onChange={() => setFormData({...formData, medical: {...formData.medical, priorRemoval: 'yes'}})}
                    />
                    <span className="text-sm text-slate-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="priorRemoval"
                      className="w-4 h-4 text-purple-600"
                      checked={formData.medical.priorRemoval === 'no'}
                      onChange={() => setFormData({...formData, medical: {...formData.medical, priorRemoval: 'no'}})}
                    />
                    <span className="text-sm text-slate-700">No</span>
                  </label>
                </div>
              </div>

              {/* Tattoo Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Is the tattoo professionally done or amateur (self/stick-and-poke)?</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-md bg-white text-sm"
                  value={formData.medical.tattooType}
                  onChange={e => setFormData({...formData, medical: {...formData.medical, tattooType: e.target.value}})}
                >
                  <option value="">Select...</option>
                  <option value="professional">Professional</option>
                  <option value="amateur">Amateur (self/stick-and-poke)</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button onClick={handleBack} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-lg font-semibold hover:bg-slate-200">Back</button>
            <button onClick={handleNext} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">Next: Consent</button>
          </div>
        </div>
      )}

      {/* Step 4: Consent & Signature */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Consent & Sign
          </h2>

          {/* Consent text based on service type */}
          <div className="h-64 overflow-y-auto p-4 bg-slate-50 rounded border border-slate-200 text-xs text-slate-700 space-y-3">
            {formData.serviceType === 'hair_removal' && (
              <>
                <p><strong>1. Risks:</strong> I understand laser hair removal may cause temporary redness, swelling, blistering, or changes in skin pigmentation. I understand rare risks include burns or scarring.</p>
                <p><strong>2. Results:</strong> I understand multiple sessions are required and permanent hair reduction (not complete removal) is not guaranteed. Individual results vary.</p>
                <p><strong>3. Pre/Post Care:</strong> I agree to avoid sun exposure, tanning beds, and self-tanners for 4 weeks before and after each treatment. I will notify staff of any medication changes.</p>
                <p><strong>4. Photos:</strong> I consent to before/after photos for clinical documentation purposes.</p>
                <p><strong>5. Financial:</strong> I understand payment is due at time of service and packages are non-refundable.</p>
              </>
            )}

            {formData.serviceType === 'tattoo_removal' && (
              <>
                <p><strong>1. Risks:</strong> I understand laser tattoo removal may cause temporary redness, swelling, blistering, scabbing, and changes in skin pigmentation (lightening or darkening). I understand rare risks include scarring, infection, and permanent skin texture changes.</p>
                <p><strong>2. Incomplete Removal:</strong> I understand that complete tattoo removal is NOT guaranteed. Results vary significantly based on ink color, ink depth, tattoo age, skin type, and whether the tattoo is professional or amateur. Multiple sessions (typically 6–15 or more) are required.</p>
                <p><strong>3. Ink Colors:</strong> I understand that black and dark blue inks respond best to treatment. Red, green, yellow, and other light colors are significantly more difficult to remove and may require additional sessions or may not fully clear.</p>
                <p><strong>4. Paradoxical Darkening:</strong> I understand that certain inks containing iron oxide (often found in flesh-toned, white, or cosmetic tattoos) may darken after laser treatment. If this occurs, alternative treatment options will be discussed.</p>
                <p><strong>5. Pre/Post Care:</strong> I agree to keep the treated area clean, protected from sun exposure, and moisturized as instructed. I understand I must avoid picking or scratching treated skin. I will notify staff of any medication changes.</p>
                <p><strong>6. Photos:</strong> I consent to before/after photos for clinical documentation purposes.</p>
                <p><strong>7. Financial:</strong> I understand payment is due at time of service. Packages are non-refundable.</p>
                <p><strong>8. Insurance Acknowledgment:</strong> I understand a signed consent form is required by my provider's liability insurance for laser tattoo removal services.</p>
              </>
            )}

            {formData.serviceType === 'skin_treatment' && (
              <>
                <p><strong>1. Risks:</strong> I understand Pico laser skin treatments may cause temporary redness, swelling, darkening of targeted spots, or changes in skin pigmentation. Rare risks include blistering or scarring.</p>
                <p><strong>2. Results:</strong> I understand results vary by individual, skin type, and condition being treated. Multiple sessions may be required. Results are not guaranteed.</p>
                <p><strong>3. Pre/Post Care:</strong> I agree to avoid sun exposure for 4 weeks before and after treatment. I will not use retinol or active exfoliants for 5 days prior. I will use SPF 30+ daily after treatment.</p>
                <p><strong>4. Photos:</strong> I consent to before/after photos for clinical documentation purposes.</p>
                <p><strong>5. Financial:</strong> I understand payment is due at time of service and packages are non-refundable.</p>
              </>
            )}
          </div>

          {/* Required checkboxes */}
          <div className="space-y-2">
            <label className="flex items-start gap-2">
              <input 
                type="checkbox" className="mt-1 w-4 h-4 text-blue-600"
                checked={formData.consent.risks}
                onChange={e => setFormData({...formData, consent: {...formData.consent, risks: e.target.checked}})}
              />
              <span className="text-sm text-slate-700">I have read and understand all risks listed above.</span>
            </label>
            <label className="flex items-start gap-2">
              <input 
                type="checkbox" className="mt-1 w-4 h-4 text-blue-600"
                checked={formData.consent.prePostCare}
                onChange={e => setFormData({...formData, consent: {...formData.consent, prePostCare: e.target.checked}})}
              />
              <span className="text-sm text-slate-700">I agree to the pre/post care instructions.</span>
            </label>
            <label className="flex items-start gap-2">
              <input 
                type="checkbox" className="mt-1 w-4 h-4 text-blue-600"
                checked={formData.consent.photos}
                onChange={e => setFormData({...formData, consent: {...formData.consent, photos: e.target.checked}})}
              />
              <span className="text-sm text-slate-700">I consent to clinical photography.</span>
            </label>
            <label className="flex items-start gap-2">
              <input 
                type="checkbox" className="mt-1 w-4 h-4 text-blue-600"
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
              disabled={!formData.signature || !allConsentsChecked}
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
