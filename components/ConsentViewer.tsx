"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ConsentViewerProps {
  consentId?: string;
  consentHtml?: string;
  patientId?: string;  // look up consent by patient_id
  patientName: string;
  onClose: () => void;
}

export default function ConsentViewer({ consentId, consentHtml, patientId, patientName, onClose }: ConsentViewerProps) {
  const [html, setHtml] = useState<string | null>(consentHtml || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (consentHtml) { setHtml(consentHtml); return; }
    if (consentId) { loadConsentById(consentId); return; }
    if (patientId) { loadConsentByPatient(patientId); return; }
  }, [consentId, consentHtml, patientId]);

  const loadConsentByPatient = async (pid: string) => {
    setLoading(true);
    setError(null);
    try {
      // Get most recent consent record for this patient
      const { data, error: dbError } = await supabase
        .from('consent_records')
        .select('id, storage_path, consent_html')
        .eq('patient_id', pid)
        .order('signed_at', { ascending: false })
        .limit(1)
        .single();

      if (dbError || !data) throw new Error('No consent record found for this patient.');

      // Try storage first, then inline, then localStorage
      if (data.storage_path) {
        const { data: blob } = await supabase.storage.from('consents').download(data.storage_path);
        if (blob) { setHtml(await blob.text()); return; }
      }
      if (data.consent_html) { setHtml(data.consent_html); return; }
      const local = localStorage.getItem(`consent_${data.id}`);
      if (local) { setHtml(local); return; }
      throw new Error('Consent document not found in storage or database.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load consent.');
    } finally {
      setLoading(false);
    }
  };

  const loadConsentById = async (cid: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: blob } = await supabase.storage.from('consents').download(`${cid}.html`);
      if (blob) { setHtml(await blob.text()); return; }
      const local = localStorage.getItem(`consent_${cid}`);
      if (local) { setHtml(local); return; }
      throw new Error('Consent not found.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load consent.');
    } finally {
      setLoading(false);
    }
  };

  // Legacy method kept for compat
  const loadConsent = async () => {
    if (!consentId) return;
    setLoading(true);
    setError(null);
    try {
      const storedHtml = localStorage.getItem(`consent_${consentId}`);
      
      if (!storedHtml) {
        // Try loading from consent_records
        const records = JSON.parse(localStorage.getItem('consent_records') || '[]');
        const record = records.find((r: any) => r.id === consentId);
        
        if (record && record.consent_html) {
          setHtml(record.consent_html);
        } else {
          throw new Error('Consent document not found');
        }
      } else {
        setHtml(storedHtml);
      }
    } catch (err) {
      console.error('Error loading consent:', err);
      setError('Failed to load consent document. It may have been deleted or is not available.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleDownload = () => {
    if (!html) return;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const date = new Date().toISOString().split('T')[0];
    const filename = `consent_${patientName.replace(/\s+/g, '_')}_${date}.html`;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Signed Consent Document</h2>
            <p className="text-sm text-slate-600">{patientName}</p>
            {consentId && (
              <p className="text-xs text-slate-500 font-mono mt-1">ID: {consentId}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!html || loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Print consent document"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            
            <button
              onClick={handleDownload}
              disabled={!html || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Download consent document"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-200 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-slate-600">Loading consent document...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Document</h3>
                <p className="text-slate-600">{error}</p>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
          
          {html && !loading && !error && (
            <iframe
              ref={iframeRef}
              srcDoc={html}
              className="w-full h-full border-0"
              title="Consent Document"
              sandbox="allow-same-origin allow-scripts"
            />
          )}
        </div>
      </div>
    </div>
  );
}
