'use client';

import { useState, useEffect } from 'react';
import { USER_NAME } from '@/data/mock';

export default function GreetingCard() {
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }));
  }, []);

  return (
    <div className="min-h-[70vh] rounded-2xl bg-gradient-to-br from-amber-200 via-rose-200 to-purple-200 flex flex-col items-center justify-center p-8 shadow-lg">
      <p className="text-5xl font-light leading-tight text-center text-[var(--color-warm-text)]">
        Good Morning,
      </p>
      <p className="text-5xl font-semibold mt-2 text-center text-[var(--color-warm-text)]">
        {USER_NAME}
      </p>
      <p className="mt-6 text-[var(--color-warm-text)]/60 flex items-center gap-2">
        📅 {today}
      </p>
    </div>
  );
}
