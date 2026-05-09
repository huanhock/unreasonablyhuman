'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SeedPrompt() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSeed() {
    setLoading(true);
    try {
      await fetch('/api/seed', { method: 'POST' });
      router.refresh();
    } catch {
      alert('Failed to load demo data. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="glass p-6 text-center">
      <h2 className="text-xl font-bold text-[#1a1a2e]">Welcome to UnreasonablyHuman</h2>
      <p className="mt-2 text-sm text-slate-600">
        Your account is set up! Load demo data to explore the app, or start adding your own clients.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Loading demo data...' : '✨ Load Demo Data'}
        </button>
      </div>
    </div>
  );
}
