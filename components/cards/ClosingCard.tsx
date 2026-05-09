'use client';

import { useState, useEffect } from 'react';

export default function ClosingCard({ userName }: { userName: string }) {
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <div className="min-h-[70vh] rounded-2xl bg-gradient-to-br from-purple-200 via-rose-200 to-amber-200 flex flex-col items-center justify-center p-8 shadow-lg">
      <p className="text-4xl font-light leading-tight text-center text-[var(--color-warm-text)]">
        Have a great day,
      </p>
      <p className="text-4xl font-semibold mt-2 text-center text-[var(--color-warm-text)]">
        {userName}
      </p>
      <p className="mt-6 text-[var(--color-warm-text)]/60 flex items-center gap-2">
        📅 {today}
      </p>
    </div>
  );
}
