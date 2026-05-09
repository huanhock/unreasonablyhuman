'use client';

import { useState } from 'react';
import type { Client } from '@/lib/types';
import { readStream } from '@/lib/stream';

export default function CheckinsCard({ staleClients }: { staleClients: Client[] }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDraft(client: Client) {
    setLoadingId(client.id);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          company: client.company,
          lastContacted: client.lastContacted,
          preferences: client.preferences,
          meetingHistory: client.meetingHistory,
        }),
      });
      await readStream(res, (text) => {
        setDrafts(prev => ({ ...prev, [client.id]: text }));
      });
    } catch {
      setDrafts(prev => ({ ...prev, [client.id]: 'Could not generate message.' }));
    }
    setLoadingId(null);
  }

  if (staleClients.length === 0) return null;

  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-amber-800 mb-4">👋 Check-ins</h2>
      <p className="text-sm text-amber-700/70 mb-4">Clients you haven&apos;t reached out to in a while</p>
      <div className="space-y-3">
        {staleClients.map(client => (
          <div key={client.id} className="glass p-4">
            <p className="font-semibold text-[var(--color-warm-text)]">{client.name}</p>
            <p className="text-sm text-[var(--color-warm-text)]/70">
              {client.company} · Last contact: {client.lastContacted}
            </p>
            {drafts[client.id] ? (
              <p className="mt-2 text-sm text-[var(--color-warm-text)]/80 whitespace-pre-line">{drafts[client.id]}</p>
            ) : (
              <button
                onClick={() => handleDraft(client)}
                disabled={loadingId === client.id}
                className="mt-2 px-4 py-1.5 bg-amber-500 text-white rounded-full text-sm hover:bg-amber-600 disabled:opacity-50"
              >
                {loadingId === client.id ? 'Drafting...' : '💬 Draft re-engagement message'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
