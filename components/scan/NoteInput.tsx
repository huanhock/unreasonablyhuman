'use client';

import { useRef, useState } from 'react';

interface NoteInputProps {
  value: string;
  onChange: (v: string) => void;
  onExtract: () => void;
  onExtractImage: (file: File) => void;
  loading: boolean;
}

export default function NoteInput({ value, onChange, onExtract, onExtractImage, loading }: NoteInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            mode === 'text' ? 'bg-orange-500 text-white' : 'bg-white/60 text-slate-600 ring-1 ring-white/80'
          }`}
        >
          ✍️ Type Notes
        </button>
        <button
          onClick={() => setMode('image')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            mode === 'image' ? 'bg-orange-500 text-white' : 'bg-white/60 text-slate-600 ring-1 ring-white/80'
          }`}
        >
          📷 Photo / Upload
        </button>
      </div>

      {mode === 'text' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste or type your meeting notes here...

Example:
Met with Sarah Chen at The Roastery for coffee. Discussed Q3 portfolio — she wants to increase allocation to AI stocks. Mentioned her daughter won a science fair. She's finalizing Osaka trip plans for July. Need to send her the updated fund prospectus by Friday.`}
          className="w-full h-64 p-4 rounded-xl border-2 border-orange-200 bg-white focus:border-orange-400 focus:outline-none resize-none text-sm"
        />
      ) : (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Meeting notes" className="w-full rounded-xl border-2 border-orange-200" />
              <button
                onClick={() => { setPreview(null); setSelectedFile(null); }}
                className="absolute top-2 right-2 bg-white/80 rounded-full px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-white"
              >
                ✕ Remove
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full h-48 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50/50 flex flex-col items-center justify-center gap-2 hover:bg-orange-50 transition"
            >
              <span className="text-4xl">📷</span>
              <span className="text-sm text-slate-600 font-medium">Tap to take a photo or upload an image</span>
              <span className="text-xs text-slate-400">Supports handwritten or typed notes</span>
            </button>
          )}
        </div>
      )}

      <button
        onClick={() => {
          if (mode === 'image' && selectedFile) {
            onExtractImage(selectedFile);
          } else {
            onExtract();
          }
        }}
        disabled={loading || (mode === 'text' ? !value.trim() : !selectedFile)}
        className="mt-4 w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-semibold text-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {loading ? '✨ Extracting with AI...' : '✨ Extract with AI'}
      </button>
    </div>
  );
}
