"use client";

import { useState } from "react";
import Script from "next/script";
import { QRCodeSVG } from "qrcode.react";
import { Smartphone } from "lucide-react";

const CHERRY_APPLICATION_URL = "https://pay.withcherry.com/harlan-esthetics";

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

        {/* Scan-to-apply — lets the patient use their own phone instead of
            entering financial info on the shared kiosk iPad. */}
        <div className="flex flex-col items-center gap-3 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Smartphone className="w-4 h-4 text-[#D4AF37]" />
            Scan with your phone to apply privately
          </div>
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <QRCodeSVG value={CHERRY_APPLICATION_URL} size={140} level="M" />
          </div>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Prefer to apply here instead? Tap below to open Cherry on this iPad.
          </p>
        </div>

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
