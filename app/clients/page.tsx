'use client';

import { useMemo, useState } from 'react';
import ClientCard from '@/components/clients/ClientCard';
import { clients } from '@/data/mock';

export default function ClientsPage() {
  const [query, setQuery] = useState('');

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return clients;
    }

    return clients.filter((client) =>
      [client.name, client.company, client.status, client.needs]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query]);

  return (
    <div className="min-h-screen px-4 py-6">
      <header className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Relationships
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a1a2e]">Clients</h1>
      </header>

      <label className="mb-5 block">
        <span className="sr-only">Search clients</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients or companies"
          className="w-full rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-base text-[#1a1a2e] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
        />
      </label>

      <div className="space-y-3">
        {filteredClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>

      {filteredClients.length === 0 ? (
        <div className="glass p-5 text-center text-sm text-slate-600">
          No clients match that search.
        </div>
      ) : null}
    </div>
  );
}
