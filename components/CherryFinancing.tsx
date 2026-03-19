"use client";

import { useState } from "react";
import Script from "next/script";

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
    <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 w-full min-h-[400px]">
      <Script id="cherry-widget-init" strategy="afterInteractive">
        {`
          (function (w, d, s, o, f, js, fjs) {
              w[o] = w[o] || function () {
                  (w[o].q = w[o].q || []).push(arguments);
              };
              (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
              js.id = o;
              js.src = f;
              js.async = 1;
              fjs.parentNode.insertBefore(js, fjs);
          })(window, document, "script", "_hw", "https://files.withcherry.com/widgets/widget.js");
          
          _hw("init", {
              debug: false,
              variables: {
                  slug: 'harlan-esthetics',
                  name: 'Harlan Esthetics', 
                  images: '',
                  customLogo: 'http://harlandental.flywheelsites.com/wp-content/uploads/2026/03/he_site_icon_512_medium.png',
                  defaultPurchaseAmount: 1000,
                  customImage: 'http://harlandental.flywheelsites.com/wp-content/uploads/2026/02/logoFINAL.png', 
                  imageCategory: 'medspa',
                  language: 'en',
              },
              styles: {
                  primaryColor: '#d4af37',
                  secondaryColor: '#d4af3710',
                  fontFamily: 'Montserrat',
                  headerFontFamily: 'Montserrat',
              }
          }, ['hero','calculator','howitworks','faq']);
        `}
      </Script>
      <div id="all"></div>
      <div id="hero"></div>
      <div id="calculator"></div>
      <div id="howitworks"></div>
      <div id="testimony"></div>
      <div id="faq"></div>
    </div>
  );
}
