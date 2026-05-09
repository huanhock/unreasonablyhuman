import { MeetingNote } from '@/data/mock';

const STORAGE_KEY = 'unreasonablyhuman_notes';

export function getSavedNotes(): MeetingNote[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveNote(note: MeetingNote): void {
  const existing = getSavedNotes();
  existing.unshift(note);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
}

export function getAllNotes(mockNotes: MeetingNote[]): MeetingNote[] {
  const saved = getSavedNotes();
  return [...saved, ...mockNotes].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
