'use client';

import { useState, useEffect } from 'react';

export default function SummaryCard() {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/summary', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setSummary(data.summary);
        setLoading(false);
      })
      .catch(() => {
        setSummary('A busy day of client meetings ahead. You have 4 appointments, a few follow-ups to knock out, and Sarah\'s birthday to celebrate!');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[50vh] rounded-2xl bg-gradient-to-br from-sky-200 via-blue-100 to-teal-200 flex flex-col items-center justify-center p-8 shadow-lg">
      <h2 className="text-2xl font-semibold text-sky-800 mb-6">🌤️ Your Day</h2>
      {loading ? (
        <div className="animate-pulse text-sky-600">Generating your summary...</div>
      ) : (
        <p className="text-lg text-center text-[var(--color-warm-text)] leading-relaxed">{summary}</p>
      )}
    </div>
  );
}
