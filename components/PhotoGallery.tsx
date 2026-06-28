"use client";

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Camera, Upload, X, ZoomIn, Loader2, ImageOff, Trash2 } from 'lucide-react';

type PhotoCategory = 'before' | 'after' | 'progress' | 'treatment_area';

type Photo = {
  id: string;
  storage_path: string;
  category: PhotoCategory;
  taken_at: string;
  notes: string | null;
  signedUrl?: string;
};

const CATEGORY_TABS: { value: PhotoCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'progress', label: 'Progress' },
  { value: 'treatment_area', label: 'Treatment Area' },
];

const CATEGORY_BADGE: Record<PhotoCategory, string> = {
  before:         'bg-red-50   text-red-700    border border-red-200',
  after:          'bg-green-50 text-green-700  border border-green-200',
  progress:       'bg-blue-50  text-blue-700   border border-blue-200',
  treatment_area: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function PhotoGallery({ patientId }: { patientId: string }) {
  const [photos, setPhotos]               = useState<Photo[]>([]);
  const [loading, setLoading]             = useState(true);
  const [uploading, setUploading]         = useState(false);
  const [activeFilter, setActiveFilter]   = useState<PhotoCategory | 'all'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showModal, setShowModal]         = useState(false);
  const [pendingFile, setPendingFile]     = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [newCategory, setNewCategory]     = useState<PhotoCategory>('progress');
  const [newNotes, setNewNotes]           = useState('');
  const [userRole, setUserRole]           = useState<string | null>(null);

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  // Fetch user role for delete permission check
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('users').select('role').eq('id', user.id).single()
        .then(({ data }) => setUserRole(data?.role ?? null));
    });
  }, []);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('patient_photos')
        .select('*')
        .eq('patient_id', patientId)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      if (!rows || rows.length === 0) { setPhotos([]); return; }

      // Batch-sign all URLs at once (24h expiry)
      const { data: signed } = await supabase.storage
        .from('patient-photos')
        .createSignedUrls(rows.map(r => r.storage_path), 86400);

      setPhotos(rows.map((row, i) => ({
        ...row,
        signedUrl: signed?.[i]?.signedUrl ?? undefined,
      })));
    } catch (err) {
      console.error('PhotoGallery fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  const handleFileChosen = (file: File) => {
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = e => setPendingPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    setShowModal(true);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    try {
      const ext  = pendingFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${patientId}/${Date.now()}.${ext}`;

      const { data: up, error: upErr } = await supabase.storage
        .from('patient-photos')
        .upload(path, pendingFile, { cacheControl: '3600', upsert: false });

      if (upErr) throw upErr;

      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbErr } = await supabase
        .from('patient_photos')
        .insert({
          patient_id:   patientId,
          storage_path: up.path,
          category:     newCategory,
          notes:        newNotes.trim() || null,
          taken_at:     new Date().toISOString(),
          uploaded_by:  user?.id ?? null,
        });

      if (dbErr) throw dbErr;

      closeModal();
      await fetchPhotos();
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err.message ?? 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Permanently delete this photo? This cannot be undone.')) return;
    await supabase.storage.from('patient-photos').remove([photo.storage_path]);
    await supabase.from('patient_photos').delete().eq('id', photo.id);
    setSelectedPhoto(null);
    await fetchPhotos();
  };

  const closeModal = () => {
    setShowModal(false);
    setPendingFile(null);
    setPendingPreview(null);
    setNewNotes('');
    setNewCategory('progress');
  };

  const filtered = activeFilter === 'all'
    ? photos
    : photos.filter(p => p.category === activeFilter);

  const countFor = (cat: PhotoCategory) => photos.filter(p => p.category === cat).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-slate-500" />
          <h2 className="font-bold text-slate-800">Patient Photos</h2>
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full ml-1">{photos.length}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Camera className="w-4 h-4" /> Take Photo
          </button>
          <button
            onClick={() => uploadRef.current?.click()}
            className="flex items-center gap-1.5 text-sm bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors border border-slate-200 font-medium"
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>

        {/* Camera input — opens back camera on tablet */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFileChosen(e.target.files[0]); e.target.value = ''; }} />
        {/* Gallery/file upload input */}
        <input ref={uploadRef} type="file" accept="image/*" className="hidden"
          onChange={e => { if (e.target.files?.[0]) handleFileChosen(e.target.files[0]); e.target.value = ''; }} />
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="flex gap-1.5 px-6 pt-4 pb-3 overflow-x-auto border-b border-slate-100">
        {CATEGORY_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              activeFilter === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && (
              <span className="ml-1.5 opacity-60">{countFor(tab.value as PhotoCategory)}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Photo Grid ── */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            <ImageOff className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {activeFilter === 'all' ? 'No photos yet' : `No "${activeFilter.replace('_', ' ')}" photos yet`}
            </p>
            <p className="text-xs mt-1 opacity-70">Use "Take Photo" on the tablet or "Upload" to add the first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(photo => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 hover:border-blue-400 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {photo.signedUrl ? (
                  <img src={photo.signedUrl} alt="Patient photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <ImageOff className="w-6 h-6 text-slate-300" />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                  <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all drop-shadow" />
                </div>
                {/* Category badge */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${CATEGORY_BADGE[photo.category]}`}>
                    {photo.category.replace('_', ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Upload Confirmation Modal ── */}
      {showModal && pendingPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Save Photo</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <img
              src={pendingPreview}
              alt="Preview"
              className="w-full rounded-xl object-contain max-h-60 bg-slate-100"
            />

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as PhotoCategory)}
                className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="before">Before</option>
                <option value="after">After</option>
                <option value="progress">Progress</option>
                <option value="treatment_area">Treatment Area</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes <span className="font-normal text-slate-400">(optional)</span></label>
              <input
                type="text"
                value={newNotes}
                onChange={e => setNewNotes(e.target.value)}
                placeholder="e.g. Left underarm, session 3"
                className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : 'Save Photo to Chart'}
            </button>
          </div>
        </div>
      )}

      {/* ── Full-size View Modal ── */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/92 z-50 flex flex-col items-center justify-center p-4 gap-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-7 h-7" />
            </button>

            {/* Photo */}
            {selectedPhoto.signedUrl ? (
              <img
                src={selectedPhoto.signedUrl}
                alt="Patient photo"
                className="w-full rounded-2xl object-contain max-h-[70vh] bg-black"
              />
            ) : (
              <div className="w-full h-64 bg-slate-800 rounded-2xl flex items-center justify-center">
                <ImageOff className="w-10 h-10 text-slate-500" />
              </div>
            )}

            {/* Meta row */}
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_BADGE[selectedPhoto.category]}`}>
                  {selectedPhoto.category.replace('_', ' ')}
                </span>
                <p className="text-sm text-white/60 mt-2">
                  {new Date(selectedPhoto.taken_at).toLocaleDateString('en-US', {
                    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>
                {selectedPhoto.notes && (
                  <p className="text-sm text-white/80 mt-1 italic">"{selectedPhoto.notes}"</p>
                )}
              </div>

              {/* Delete — admin only */}
              {userRole === 'admin' && (
                <button
                  onClick={() => handleDelete(selectedPhoto)}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 font-medium transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
