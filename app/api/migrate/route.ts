import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const oldText = 'Send comparison of 83(b) election strategies';
  const newText = 'Send comparison of pre-IPO secondary fund options';

  // Update todos — try exact match then fuzzy
  const { data: todosUpdated } = await supabase
    .from('todos')
    .update({ task: newText })
    .ilike('task', '%83(b)%')
    .select('*');

  // Update meeting_notes follow_ups (jsonb)
  const { data: notes } = await supabase
    .from('meeting_notes')
    .select('id, follow_ups');

  let notesUpdated = 0;
  for (const note of notes || []) {
    const followUps = note.follow_ups as { task: string; done: boolean }[];
    const hasOld = followUps?.some(f => f.task === oldText);
    if (hasOld) {
      const updated = followUps.map(f =>
        f.task === oldText ? { ...f, task: newText } : f
      );
      await supabase.from('meeting_notes').update({ follow_ups: updated }).eq('id', note.id);
      notesUpdated++;
    }
  }

  return Response.json({ todosUpdated: todosUpdated?.length ?? 0, notesUpdated });
}
