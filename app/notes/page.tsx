'use client';

import { useMemo, useState } from 'react';
import NoteEntry from '@/components/notes/NoteEntry';
import { clients } from '@/data/mock';
import { getAllNotes } from '@/lib/store';

export default function NotesPage() {
  const [query, setQuery] = useState('');
  const mockNotes = useMemo(
    () => clients.flatMap((client) => client.meetingHistory),
    []
  );
  const allNotes = useMemo(() => getAllNotes(mockNotes), [mockNotes]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return allNotes;
    }

    return allNotes.filter((note) =>
      [
        note.clientName,
        note.location,
        note.topics.join(' '),
        note.followUps.map((followUp) => followUp.task).join(' '),
        note.smallTalk.family,
        note.smallTalk.holidays,
        note.smallTalk.food,
        note.smallTalk.hobbies,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [allNotes, query]);

  return (
    <div className="min-h-screen px-4 py-6">
      <header className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Memory
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[#1a1a2e]">
          Meeting Notes
        </h1>
      </header>

      <label className="mb-5 block">
        <span className="sr-only">Search meeting notes</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes, topics, or follow-ups"
          className="w-full rounded-2xl border border-white/70 bg-white/65 px-4 py-3 text-base text-[#1a1a2e] shadow-sm outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
        />
      </label>

      <div className="space-y-3">
        {filteredNotes.map((note) => (
          <NoteEntry key={note.id} note={note} />
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="glass p-5 text-center text-sm text-slate-600">
          No meeting notes match that search.
        </div>
      ) : null}
    </div>
  );
}
