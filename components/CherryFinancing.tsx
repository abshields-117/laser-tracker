"use client";

import { useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    _hw: any;
  }
}

export default function CherryFinancing() {
  const [showWidget, setShowWidget] = useState(false);

  if (!showWidget) {
    return (
      <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-2">Interested in flexible monthly payments?</h3>
        <p className="text-slate-600 mb-6">
          Apply with Cherry in seconds without impacting your credit score. 
          Get approved for high-ticket laser and esthetic packages instantly.
        </p>
        <button
          onClick={() => setShowWidget(true)}
          className="w-full py-4 bg-[#D4AF37] hover:bg-[#b5952f] text-white text-lg font-bold rounded-lg shadow-md transition-colors"
        >
          See if you qualify
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full">
      <Script 
        src="https://files.withcherry.com/widgets/widget.js" 
        strategy="lazyOnload"
        onLoad={() => {
          if (window._hw) {
            window._hw("init", {
              debug: false,
              variables: {
                slug: 'harlan-esthetics',
                name: 'Harlan Esthetics',
                images: '',
                customLogo: '',
                defaultPurchaseAmount: 750,
                customImage: 'http://harlandental.flywheelsites.com/wp-content/uploads/2026/02/logoFINAL.png',
                imageCategory: 'medspa',
                language: 'en',
              },
              styles: {
                primaryColor: '#D4AF37', // Soft Gold
                secondaryColor: '#D4AF3710',
                fontFamily: 'Montserrat',
                headerFontFamily: 'Montserrat',
              }
            }, ['hero','calculator','howitworks','faq']);
          }
        }}
      />
      {/* The widget injects elements into these divs */}
      <div id="hero"></div>
      <div id="calculator"></div>
      <div id="howitworks"></div>
      <div id="faq"></div>
    </div>
  );
}
