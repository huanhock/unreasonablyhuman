'use client';

import { useState } from 'react';
import type { MeetingNote } from '@/data/mock';

const personalNoteLabels = [
  ['family', 'Family', '👨‍👩‍👧‍👦'],
  ['holidays', 'Holidays', '✈️'],
  ['food', 'Food', '🍽️'],
  ['hobbies', 'Hobbies', '🎨'],
] as const;

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
}

interface NoteEntryProps {
  note: MeetingNote;
}

export default function NoteEntry({ note }: NoteEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const followUpCount = note.followUps.length;
  const personalNotes = personalNoteLabels.filter(
    ([key]) => note.smallTalk[key]
  );

  return (
    <article className="glass overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="w-full p-4 text-left transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-300"
        aria-expanded={expanded}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-[#1a1a2e]">
              {note.clientName}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {formatDate(note.date)} · {note.location}
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
            {followUpCount} follow-up{followUpCount === 1 ? '' : 's'}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {note.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {topic}
            </span>
          ))}
        </div>
      </button>

      {expanded ? (
        <div className="border-t border-white/60 px-4 pb-4 pt-3">
          <div className="space-y-2">
            {note.followUps.map((followUp) => (
              <label
                key={followUp.task}
                className="flex items-start gap-3 rounded-xl bg-white/45 p-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  defaultChecked={followUp.done}
                  className="mt-0.5 size-4 rounded border-orange-200 text-orange-500 accent-orange-500"
                />
                <span>{followUp.task}</span>
              </label>
            ))}
          </div>

          {personalNotes.length > 0 ? (
            <div className="mt-4 grid gap-2">
              {personalNotes.map(([key, label, emoji]) => (
                <div
                  key={key}
                  className="rounded-xl bg-white/45 p-3 text-sm text-slate-700"
                >
                  <span className="font-semibold text-slate-800">
                    {emoji} {label}:{' '}
                  </span>
                  {note.smallTalk[key]}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
