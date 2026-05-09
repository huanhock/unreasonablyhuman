import type { MeetingNote } from './types';

export function getAllNotes(dbNotes: MeetingNote[]): MeetingNote[] {
  return dbNotes.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
