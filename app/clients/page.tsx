'use client';

import { useMemo, useState, useEffect } from 'react';
import ClientCard from '@/components/clients/ClientCard';
import type { Client } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { getClients } from '@/lib/db';

type SearchMode = 'keyword' | 'ai';
type SortMode = 'name' | 'status' | 'recent';

const statusOrder: Record<string, number> = { hot: 0, warm: 1, cold: 2 };

interface AiSearchResult {
  id: string;
  reason: string;
}

export default function ClientsPage() {
  const [query, setQuery] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState<SearchMode>('keyword');
  const [sortMode, setSortMode] = useState<SortMode>('name');
  const [aiResults, setAiResults] = useState<AiSearchResult[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHasSearched, setAiHasSearched] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    getClients(supabase).then((data) => {
      setClients(data);
      setLoading(false);
    });
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    let result = clients;
    if (normalizedQuery) {
      result = result.filter((client) =>
        [client.name, client.company, client.status, client.needs]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    return [...result].sort((a, b) => {
      if (sortMode === 'status') {
        return (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
      }
      if (sortMode === 'recent') {
        return new Date(b.lastContacted).getTime() - new Date(a.lastContacted).getTime();
      }
      return a.name.localeCompare(b.name);
    });
  }, [query, clients, sortMode]);

  const aiMatchedClients = useMemo(
    () =>
      aiResults
        .map((result) => ({
          result,
          client: clients.find((client) => client.id === result.id),
        }))
        .filter(
          (match): match is { result: AiSearchResult; client: Client } =>
            Boolean(match.client)
        ),
    [aiResults, clients]
  );

  async function runAiSearch() {
    const trimmedQuery = query.trim();

    if (!trimmedQuery || aiLoading) {
      return;
    }

    setAiLoading(true);
    setAiHasSearched(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmedQuery, clients }),
      });

      if (!response.ok) {
        throw new Error('AI search failed');
      }

      const data = (await response.json()) as { results?: AiSearchResult[] };
      setAiResults(data.results ?? []);
    } catch (error) {
      console.error('AI search failed', error);
      setAiResults([]);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-6">
      <header className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Relationships
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a1a2e]">Clients</h1>
      </header>

      <div className="mb-4 flex gap-2">
        {[
          ['keyword', 'Search'],
          ['ai', 'Ask AI'],
        ].map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSearchMode(mode as SearchMode)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              searchMode === mode
                ? 'bg-orange-500 text-white'
                : 'bg-white/60 text-slate-600 ring-1 ring-white/80 hover:bg-white/80'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {searchMode === 'keyword' && (
        <div className="mb-4 flex gap-2">
          {([
            ['name', 'A–Z'],
            ['status', 'Hot → Cold'],
            ['recent', 'Recent'],
          ] as const).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSortMode(mode)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                sortMode === mode
                  ? 'bg-slate-700 text-white'
                  : 'bg-white/60 text-slate-500 ring-1 ring-white/80 hover:bg-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <label className="mb-5 block">
        <span className="sr-only">Search clients</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (searchMode === 'ai' && event.key === 'Enter') {
              void runAiSearch();
            }
          }}
          placeholder={
            searchMode === 'ai'
              ? "Ask anything... e.g. 'who likes golf?'"
              : 'Search clients or companies'
          }
          className="w-full rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-base text-[#1a1a2e] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
        />
      </label>

      {loading || aiLoading ? (
        <div className="glass p-5 text-center text-sm text-slate-600 animate-pulse">
          {aiLoading ? 'Searching with AI...' : 'Loading clients...'}
        </div>
      ) : searchMode === 'ai' ? (
        <div className="space-y-3">
          {aiMatchedClients.map(({ client, result }) => (
            <div key={client.id}>
              <ClientCard client={client} />
              <div className="text-xs text-orange-700 bg-orange-50 rounded-full px-3 py-1 mt-1 inline-block">
                {result.reason}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}

      {!loading && searchMode === 'keyword' && filteredClients.length === 0 ? (
        <div className="glass p-5 text-center text-sm text-slate-600">
          No clients match that search.
        </div>
      ) : null}

      {!loading &&
      !aiLoading &&
      searchMode === 'ai' &&
      query.trim() &&
      aiResults.length === 0 ? (
        <div className="glass p-5 text-center text-sm text-slate-600">
          {aiHasSearched
            ? 'No clients matched that AI search.'
            : 'Press Enter to search with AI.'}
        </div>
      ) : null}
    </div>
  );
}
