'use client';

import { useState } from 'react';
import { birthdaysToday, birthdaysUpcoming, Client } from '@/data/mock';

export default function BirthdaysCard() {
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleSuggest(client: Client) {
    setLoadingId(client.id);
    try {
      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: client.name,
          preferences: client.preferences,
          budget: client.budget,
          occasion: birthdaysToday.includes(client) ? 'birthday today' : 'birthday upcoming',
        }),
      });
      const data = await res.json();
      setSuggestions(prev => ({ ...prev, [client.id]: data.suggestion }));
    } catch {
      setSuggestions(prev => ({ ...prev, [client.id]: 'Could not generate suggestion.' }));
    }
    setLoadingId(null);
  }

  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-rose-200 via-orange-100 to-amber-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-rose-800 mb-4">🎂 Birthdays</h2>
      {birthdaysToday.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-rose-700 mb-2">TODAY</p>
          {birthdaysToday.map(client => (
            <div key={client.id} className="glass p-4 mb-2">
              <p className="font-semibold text-[var(--color-warm-text)]">{client.name} 🎉</p>
              <p className="text-sm text-[var(--color-warm-text)]/70">{client.company}</p>
              {suggestions[client.id] ? (
                <p className="mt-2 text-sm text-[var(--color-warm-text)]/80 whitespace-pre-line">{suggestions[client.id]}</p>
              ) : (
                <button
                  onClick={() => handleSuggest(client)}
                  disabled={loadingId === client.id}
                  className="mt-2 px-4 py-1.5 bg-rose-500 text-white rounded-full text-sm hover:bg-rose-600 disabled:opacity-50"
                >
                  {loadingId === client.id ? 'Thinking...' : '✨ Suggest gift & message'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {birthdaysUpcoming.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-rose-700 mb-2">UPCOMING</p>
          {birthdaysUpcoming.map(client => (
            <div key={client.id} className="glass p-4 mb-2">
              <p className="font-semibold text-[var(--color-warm-text)]">{client.name}</p>
              <p className="text-sm text-[var(--color-warm-text)]/70">{client.company} · {client.birthday}</p>
              {suggestions[client.id] ? (
                <p className="mt-2 text-sm text-[var(--color-warm-text)]/80 whitespace-pre-line">{suggestions[client.id]}</p>
              ) : (
                <button
                  onClick={() => handleSuggest(client)}
                  disabled={loadingId === client.id}
                  className="mt-2 px-4 py-1.5 bg-orange-400 text-white rounded-full text-sm hover:bg-orange-500 disabled:opacity-50"
                >
                  {loadingId === client.id ? 'Thinking...' : '🎁 Plan ahead'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
