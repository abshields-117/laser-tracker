interface ConsentSnapshotData {
  patientName: string;
  dob: string;
  phone: string;
  email: string;
  serviceType: 'hair_removal' | 'tattoo_removal' | 'skin_treatment';
  treatmentAreas?: string;
  signature: string;
  signedAt: string; // ISO timestamp
  consentId: string; // UUID
  checkboxes: {
    risks: boolean;
    preCare: boolean;
    photos: boolean;
    payment: boolean;
    // tattoo only:
    incompleteRemoval?: boolean;
    inkColors?: boolean;
    paradoxicalDarkening?: boolean;
    insuranceCompliance?: boolean;
  };
  // Tattoo-specific fields
  tattooColors?: string;
  tattooAge?: string;
  tattooLocation?: string;
  tattooType?: string; // professional/amateur
  priorAttempts?: string;
  fitzpatrickType?: string;
}

export function generateConsentSnapshot(data: ConsentSnapshotData): string {
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getServiceColor = (type: ConsentSnapshotData['serviceType']) => {
    switch (type) {
      case 'hair_removal': return '#6A9FAE';
      case 'tattoo_removal': return '#7B5EA7';
      case 'skin_treatment': return '#6A9FAE';
    }
  };

  const getConsentText = (type: ConsentSnapshotData['serviceType']) => {
    if (type === 'hair_removal') {
      return {
        risks: "I understand the risks associated with laser hair removal, including but not limited to temporary redness, swelling, blistering, changes in pigmentation, and scarring. I have had the opportunity to ask questions and all my questions have been answered to my satisfaction.",
        preCare: "I confirm that I have followed all pre-care instructions provided by Harlan Esthetics, including avoiding sun exposure, tanning beds, and certain topical products.",
        photos: "I consent to the taking of clinical photographs before, during, and after my treatment for the purpose of medical record keeping and treatment evaluation. I understand that my identity will remain confidential.",
        payment: "I understand that payment is due at the time of service. I am responsible for all costs associated with my treatment, and I acknowledge that results may vary and are not guaranteed."
      };
    } else if (type === 'tattoo_removal') {
      return {
        risks: "I understand the risks associated with laser tattoo removal, including but not limited to temporary redness, swelling, blistering, scabbing, changes in pigmentation (hypopigmentation or hyperpigmentation), scarring, and allergic reactions to the ink. I have had the opportunity to ask questions and all my questions have been answered to my satisfaction.",
        preCare: "I confirm that I have followed all pre-care instructions provided by Harlan Esthetics, including avoiding sun exposure, tanning beds, and any products that may irritate the skin in the treatment area.",
        photos: "I consent to the taking of clinical photographs before, during, and after my treatment for the purpose of medical record keeping and treatment evaluation. I understand that my identity will remain confidential.",
        payment: "I understand that payment is due at the time of service. I am responsible for all costs associated with my treatment, and I acknowledge that results may vary and are not guaranteed.",
        incompleteRemoval: "I understand that complete removal of my tattoo may not be possible, and residual ink or 'ghosting' may remain.",
        inkColors: "I understand that certain ink colors (e.g., yellow, green, light blue) may be more resistant to removal and may require additional sessions.",
        paradoxicalDarkening: "I understand that in some cases, certain cosmetic tattoos (e.g., permanent makeup) may undergo paradoxical darkening, turning black or dark brown after treatment, which may be permanent.",
        insuranceCompliance: "I confirm that I have disclosed any pre-existing medical conditions, medications, or allergies to the staff at Harlan Esthetics. I understand that failure to disclose accurate information may impact the safety and efficacy of my treatment."
      };
    } else {
      return {
        risks: "I understand the risks associated with laser skin treatments, including but not limited to temporary redness, swelling, blistering, changes in pigmentation, and scarring. I have had the opportunity to ask questions and all my questions have been answered to my satisfaction.",
        preCare: "I confirm that I have followed all pre-care instructions provided by Harlan Esthetics, including avoiding sun exposure, tanning beds, and certain topical products.",
        photos: "I consent to the taking of clinical photographs before, during, and after my treatment for the purpose of medical record keeping and treatment evaluation. I understand that my identity will remain confidential.",
        payment: "I understand that payment is due at the time of service. I am responsible for all costs associated with my treatment, and I acknowledge that results may vary and are not guaranteed."
      };
    }
  };

  const consentText = getConsentText(data.serviceType);
  const serviceColor = getServiceColor(data.serviceType);
  const checkmark = '✓';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Harlan Esthetics - Signed Consent Document</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #3D4042;
      background: #f5f5f5;
      padding: 20px;
    }
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 14px;
      opacity: 0.95;
    }
    .warning {
      background: #FEE;
      border: 2px solid #D00;
      color: #D00;
      padding: 15px 20px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #3D4042;
      border-bottom: 3px solid ${serviceColor};
      padding-bottom: 8px;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      padding: 10px;
      background: #f9f9f9;
      border-left: 3px solid ${serviceColor};
    }
    .info-item label {
      font-size: 11px;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      display: block;
      margin-bottom: 3px;
    }
    .info-item .value {
      font-size: 14px;
      color: #3D4042;
      font-weight: 500;
    }
    .consent-item {
      margin-bottom: 20px;
      padding: 15px;
      background: #fafafa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
    }
    .consent-item-header {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .checkbox {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: 2px solid ${serviceColor};
      background: ${serviceColor};
      color: white;
      font-weight: bold;
      font-size: 16px;
      flex-shrink: 0;
      margin-right: 12px;
      border-radius: 4px;
    }
    .consent-item-title {
      font-weight: 600;
      color: #3D4042;
      font-size: 14px;
    }
    .consent-item-text {
      font-size: 13px;
      color: #555;
      line-height: 1.5;
      margin-left: 36px;
    }
    .signature-section {
      margin-top: 40px;
      padding: 25px;
      background: #f9f9f9;
      border: 2px dashed ${serviceColor};
      border-radius: 8px;
    }
    .signature-line {
      margin-top: 15px;
      padding: 15px 0;
      border-bottom: 2px solid #3D4042;
    }
    .signature-text {
      font-family: 'Brush Script MT', cursive, serif;
      font-size: 36px;
      font-style: italic;
      color: #3D4042;
      font-weight: 400;
    }
    .signature-date {
      margin-top: 10px;
      font-size: 13px;
      color: #666;
    }
    .footer {
      margin-top: 40px;
      padding: 20px;
      background: #f5f5f5;
      border-top: 3px solid #D4AF37;
      font-size: 11px;
      color: #666;
      line-height: 1.6;
    }
    .consent-id {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #3D4042;
      background: #fff;
      padding: 2px 6px;
      border-radius: 3px;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: ${serviceColor};
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.2s;
    }
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">🖨️ Print Document</button>
  
  <div class="container">
    <div class="header">
      <h1>HARLAN ESTHETICS</h1>
      <p>SIGNED CONSENT DOCUMENT</p>
    </div>
    
    <div class="warning">
      ⚠️ LEGALLY EXECUTED DOCUMENT — DO NOT ALTER OR MODIFY
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">Patient Information</div>
        <div class="info-grid">
          <div class="info-item">
            <label>Patient Name</label>
            <div class="value">${data.patientName}</div>
          </div>
          <div class="info-item">
            <label>Date of Birth</label>
            <div class="value">${data.dob}</div>
          </div>
          <div class="info-item">
            <label>Phone Number</label>
            <div class="value">${data.phone}</div>
          </div>
          <div class="info-item">
            <label>Email Address</label>
            <div class="value">${data.email}</div>
          </div>
        </div>
        <div class="info-item" style="grid-column: 1 / -1;">
          <label>Service Type</label>
          <div class="value">${data.serviceType.replace(/_/g, ' ').toUpperCase()}</div>
        </div>
        ${data.treatmentAreas ? `
        <div class="info-item" style="margin-top: 15px;">
          <label>Treatment Areas</label>
          <div class="value">${data.treatmentAreas}</div>
        </div>
        ` : ''}
        ${data.fitzpatrickType ? `
        <div class="info-item" style="margin-top: 15px;">
          <label>Fitzpatrick Skin Type</label>
          <div class="value">${data.fitzpatrickType}</div>
        </div>
        ` : ''}
      </div>

      ${data.serviceType === 'tattoo_removal' && (data.tattooColors || data.tattooAge || data.tattooLocation) ? `
      <div class="section">
        <div class="section-title">Tattoo Information</div>
        <div class="info-grid">
          ${data.tattooColors ? `
          <div class="info-item">
            <label>Tattoo Colors</label>
            <div class="value">${data.tattooColors}</div>
          </div>
          ` : ''}
          ${data.tattooAge ? `
          <div class="info-item">
            <label>Tattoo Age</label>
            <div class="value">${data.tattooAge}</div>
          </div>
          ` : ''}
          ${data.tattooLocation ? `
          <div class="info-item">
            <label>Tattoo Location</label>
            <div class="value">${data.tattooLocation}</div>
          </div>
          ` : ''}
          ${data.tattooType ? `
          <div class="info-item">
            <label>Tattoo Type</label>
            <div class="value">${data.tattooType}</div>
          </div>
          ` : ''}
          ${data.priorAttempts ? `
          <div class="info-item" style="grid-column: 1 / -1;">
            <label>Prior Removal Attempts</label>
            <div class="value">${data.priorAttempts}</div>
          </div>
          ` : ''}
        </div>
      </div>
      ` : ''}

      <div class="section">
        <div class="section-title">Consent & Acknowledgments</div>
        
        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.risks ? checkmark : ''}</div>
            <div class="consent-item-title">Risks & Disclosures</div>
          </div>
          <div class="consent-item-text">${consentText.risks}</div>
        </div>

        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.preCare ? checkmark : ''}</div>
            <div class="consent-item-title">Pre-Care Instructions</div>
          </div>
          <div class="consent-item-text">${consentText.preCare}</div>
        </div>

        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.photos ? checkmark : ''}</div>
            <div class="consent-item-title">Clinical Photography</div>
          </div>
          <div class="consent-item-text">${consentText.photos}</div>
        </div>

        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.payment ? checkmark : ''}</div>
            <div class="consent-item-title">Payment & Guarantees</div>
          </div>
          <div class="consent-item-text">${consentText.payment}</div>
        </div>

        ${data.serviceType === 'tattoo_removal' ? `
        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.incompleteRemoval ? checkmark : ''}</div>
            <div class="consent-item-title">Incomplete Removal Acknowledgment</div>
          </div>
          <div class="consent-item-text">${consentText.incompleteRemoval}</div>
        </div>

        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.inkColors ? checkmark : ''}</div>
            <div class="consent-item-title">Ink Color Resistance</div>
          </div>
          <div class="consent-item-text">${consentText.inkColors}</div>
        </div>

        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.paradoxicalDarkening ? checkmark : ''}</div>
            <div class="consent-item-title">Paradoxical Darkening (Cosmetic Tattoos)</div>
          </div>
          <div class="consent-item-text">${consentText.paradoxicalDarkening}</div>
        </div>

        <div class="consent-item">
          <div class="consent-item-header">
            <div class="checkbox">${data.checkboxes.insuranceCompliance ? checkmark : ''}</div>
            <div class="consent-item-title">Medical Disclosure & Compliance</div>
          </div>
          <div class="consent-item-text">${consentText.insuranceCompliance}</div>
        </div>
        ` : ''}
      </div>

      <div class="signature-section">
        <div class="section-title" style="border-color: ${serviceColor}; margin-bottom: 10px;">Electronic Signature</div>
        <p style="font-size: 13px; color: #666; margin-bottom: 15px;">
          By typing my name below, I acknowledge that this electronic signature has the same legal effect as a handwritten signature.
        </p>
        <div class="signature-line">
          <div class="signature-text">${data.signature}</div>
        </div>
        <div class="signature-date">
          <strong>Signed:</strong> ${formatDate(data.signedAt)}
        </div>
      </div>
    </div>

    <div class="footer">
      This document was electronically signed via the Harlan Esthetics Laser Tracker Patient Intake System.<br>
      <strong>Consent ID:</strong> <span class="consent-id">${data.consentId}</span> | 
      <strong>Signed:</strong> ${formatDate(data.signedAt)} | 
      Retained per Harlan Dental LLC Liability Policy 0100208711-3
    </div>
  </div>
</body>
</html>`;
}
