'use client';

import { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { MeetingNote } from '@/data/mock';
import { saveNote } from '@/lib/store';
import NoteInput from '@/components/scan/NoteInput';
import ExtractedForm from '@/components/scan/ExtractedForm';

function fireConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  const colors = ['#f97316', '#fb923c', '#f43f5e', '#a855f7', '#facc15', '#34d399'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors,
      startVelocity: 30,
      gravity: 0.8,
    });
  }, 300);
}

export default function ScanPage() {
  const [rawNotes, setRawNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<MeetingNote | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  function todayDate() {
    return new Date().toISOString().split('T')[0];
  }

  async function handleExtract() {
    setLoading(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: rawNotes }),
      });
      const data = await res.json();
      const note = data.extracted;
      if (!note.date || note.date === 'unknown') {
        note.date = todayDate();
      }
      setExtracted(note);
    } catch {
      alert('Extraction failed. Please try again.');
    }
    setLoading(false);
  }

  async function handleExtractImage(file: File) {
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type }),
      });
      const data = await res.json();
      const note = data.extracted;
      if (!note.date || note.date === 'unknown') {
        note.date = todayDate();
      }
      setExtracted(note);
    } catch {
      alert('Extraction failed. Please try again.');
    }
    setLoading(false);
  }

  const handleSave = useCallback(() => {
    if (extracted) {
      saveNote(extracted);
      setShowSuccess(true);
      fireConfetti();
      setTimeout(() => {
        setShowSuccess(false);
        setRawNotes('');
        setExtracted(null);
      }, 2500);
    }
  }, [extracted]);

  function handleReset() {
    setRawNotes('');
    setExtracted(null);
    setShowSuccess(false);
  }

  return (
    <div className="min-h-screen px-4 py-6 relative">
      <header className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Capture
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a1a2e]">Extract Meeting Notes</h1>
      </header>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 mx-6 shadow-2xl text-center animate-bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#1a1a2e]">Notes Saved!</h2>
            <p className="mt-2 text-slate-500">Your meeting notes have been captured and organized.</p>
            <div className="mt-4 inline-block px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              +1 meeting captured
            </div>
          </div>
        </div>
      )}

      {!extracted && !showSuccess ? (
        <NoteInput
          value={rawNotes}
          onChange={setRawNotes}
          onExtract={handleExtract}
          onExtractImage={handleExtractImage}
          loading={loading}
        />
      ) : !showSuccess ? (
        <ExtractedForm
          data={extracted!}
          onChange={setExtracted}
          onSave={handleSave}
          onReset={handleReset}
        />
      ) : null}
    </div>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
