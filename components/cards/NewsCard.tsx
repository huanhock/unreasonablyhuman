'use client';

import { useState } from 'react';
import type { NewsItem } from '@/lib/types';

export default function NewsCard({ news }: { news: NewsItem[] }) {
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(
    {}
  );
  const [loading, setLoading] = useState<
    Record<string, Record<string, boolean>>
  >({});

  async function handleShare(
    index: number,
    headline: string,
    source: string,
    clientName: string,
    shareNote: string
  ) {
    const key = String(index);

    setLoading((prev) => ({
      ...prev,
      [key]: { ...prev[key], [clientName]: true },
    }));

    try {
      const res = await fetch('/api/share-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, source, clientName, shareNote }),
      });

      const data = (await res.json()) as { draft?: string; error?: string };

      if (data.draft) {
        setDrafts((prev) => ({
          ...prev,
          [key]: { ...prev[key], [clientName]: data.draft as string },
        }));
      }
    } catch (err) {
      console.error('Failed to generate share message', err);
    } finally {
      setLoading((prev) => ({
        ...prev,
        [key]: { ...prev[key], [clientName]: false },
      }));
    }
  }

  return (
    <div className="min-h-[60vh] rounded-2xl bg-gradient-to-br from-emerald-200 via-green-100 to-lime-200 p-6 shadow-lg">
      <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
        📰 Industry News
      </h2>
      <div className="space-y-3">
        {news.map((item, i) => {
          const key = String(i);
          return (
            <div key={i} className="glass p-4">
              <p className="font-semibold text-[var(--color-warm-text)]">
                {item.headline}
              </p>
              <p className="text-xs text-[var(--color-warm-text)]/50 mb-1">
                {item.source}
              </p>
              <p className="text-sm text-[var(--color-warm-text)]/70">
                {item.shareNote}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {item.relevantClients.map((clientName) => {
                  const isLoading = loading[key]?.[clientName] ?? false;
                  const hasDraft = Boolean(drafts[key]?.[clientName]);

                  return (
                    <button
                      key={clientName}
                      onClick={() =>
                        handleShare(
                          i,
                          item.headline,
                          item.source,
                          clientName,
                          item.shareNote
                        )
                      }
                      disabled={isLoading || hasDraft}
                      className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {isLoading
                        ? 'Drafting...'
                        : `Share with ${clientName}`}
                    </button>
                  );
                })}
              </div>

              {drafts[key] &&
                Object.entries(drafts[key]).map(([clientName, draft]) => (
                  <div
                    key={clientName}
                    className="mt-2 p-3 bg-emerald-50 rounded-lg text-sm text-slate-700"
                  >
                    <p className="font-bold text-xs text-emerald-700 mb-1">
                      Draft for {clientName}
                    </p>
                    <p>{draft}</p>
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
