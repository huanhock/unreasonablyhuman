'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CalendarEvent } from '@/lib/types';
import { readStream } from '@/lib/stream';

type ActionState = {
  loading: 'prep' | 'draft' | null;
  response: string | null;
};

function extractClientName(title: string): string {
  const parts = title.split(' — ');
  return parts.length > 1 ? parts[1].trim() : title;
}

export default function CalendarCard({ events }: { events: CalendarEvent[] }) {
  const [states, setStates] = useState<Record<number, ActionState>>({});

  function getState(i: number): ActionState {
    return states[i] ?? { loading: null, response: null };
  }

  async function handlePrep(i: number, title: string) {
    const clientName = extractClientName(title);
    setStates(prev => ({ ...prev, [i]: { loading: 'prep', response: null } }));
    try {
      const res = await fetch('/api/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName }),
      });
      await readStream(res, (text) => {
        setStates(prev => ({ ...prev, [i]: { loading: 'prep', response: text } }));
      });
    } catch {
      setStates(prev => ({ ...prev, [i]: { loading: null, response: 'Could not generate prep.' } }));
      return;
    }
    setStates(prev => ({ ...prev, [i]: { ...prev[i], loading: null } }));
  }

  async function handleDraft(i: number, title: string) {
    const clientName = extractClientName(title);
    setStates(prev => ({ ...prev, [i]: { loading: 'draft', response: null } }));
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName }),
      });
      await readStream(res, (text) => {
        setStates(prev => ({ ...prev, [i]: { loading: 'draft', response: text } }));
      });
    } catch {
      setStates(prev => ({ ...prev, [i]: { loading: null, response: 'Could not generate message.' } }));
      return;
    }
    setStates(prev => ({ ...prev, [i]: { ...prev[i], loading: null } }));
  }

  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-teal-200 via-cyan-100 to-sky-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-teal-800 mb-4">📅 Calendar</h2>
      <div className="space-y-3">
        {events.map((event, i) =>
          event.clientId ? (
            <Link key={i} href={`/clients/${event.clientId}`}>
              <div className="glass p-4 hover:bg-white/30 transition cursor-pointer">
                <p className="font-semibold text-[var(--color-warm-text)]">{event.title}</p>
                <p className="text-sm text-[var(--color-warm-text)]/70">{event.time} · {event.location}</p>
                <p className="text-xs text-teal-600 font-medium mt-1 text-right">View client →</p>
                <div
                  className="flex gap-2 mt-2"
                  onClick={(e) => e.preventDefault()}
                >
                  <button
                    onClick={(e) => { e.preventDefault(); handlePrep(i, event.title); }}
                    disabled={getState(i).loading !== null}
                    className="text-xs px-3 py-1 rounded-full font-semibold bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50"
                  >
                    {getState(i).loading === 'prep' ? 'Preparing…' : '✨ Prep'}
                  </button>
                  <button
                    onClick={(e) => { e.preventDefault(); handleDraft(i, event.title); }}
                    disabled={getState(i).loading !== null}
                    className="text-xs px-3 py-1 rounded-full font-semibold bg-teal-100 text-teal-700 hover:bg-teal-200 disabled:opacity-50"
                  >
                    {getState(i).loading === 'draft' ? 'Drafting…' : '💬 Draft'}
                  </button>
                </div>
                {getState(i).response && (
                  <p className="text-xs text-slate-600 mt-2 whitespace-pre-line bg-white/50 rounded-xl p-3">
                    {getState(i).response}
                  </p>
                )}
              </div>
            </Link>
          ) : (
            <div key={i} className="glass p-4">
              <p className="font-semibold text-[var(--color-warm-text)]">{event.title}</p>
              <p className="text-sm text-[var(--color-warm-text)]/70">{event.time} · {event.location}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
