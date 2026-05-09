import { SupabaseClient } from '@supabase/supabase-js';
import type { Client, MeetingNote, CalendarEvent, Todo } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNote(row: Record<string, any>): MeetingNote {
  return {
    id: row.id,
    clientId: row.client_id || '',
    clientName: row.client_name || '',
    date: row.date || '',
    location: row.location || '',
    topics: row.topics || [],
    followUps: row.follow_ups || [],
    smallTalk: row.small_talk || {},
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClient(row: Record<string, any>, meetingHistory: MeetingNote[]): Client {
  return {
    id: row.id,
    name: row.name,
    company: row.company || '',
    status: row.status || 'warm',
    howWeMet: row.how_we_met || '',
    lastContacted: row.last_contacted || '',
    birthday: row.birthday || '',
    needs: row.needs || '',
    howHelped: row.how_helped || '',
    plans: row.plans || '',
    preferences: row.preferences || { family: [], holidays: [], food: [], hobbies: [] },
    budget: row.budget || '$$',
    meetingHistory,
  };
}

export async function getProfile(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data;
}

export async function getClients(supabase: SupabaseClient): Promise<Client[]> {
  const { data: rows } = await supabase.from('clients').select('*').order('name');
  if (!rows) return [];

  const { data: notes } = await supabase.from('meeting_notes').select('*').order('date', { ascending: false });
  const notesByClient = new Map<string, MeetingNote[]>();
  for (const row of notes || []) {
    const note = mapNote(row);
    const list = notesByClient.get(row.client_id) || [];
    list.push(note);
    notesByClient.set(row.client_id, list);
  }

  return rows.map(row => mapClient(row, notesByClient.get(row.id) || []));
}

export async function getClient(supabase: SupabaseClient, id: string): Promise<Client | null> {
  const { data: row } = await supabase.from('clients').select('*').eq('id', id).single();
  if (!row) return null;

  const { data: notes } = await supabase
    .from('meeting_notes')
    .select('*')
    .eq('client_id', id)
    .order('date', { ascending: false });

  return mapClient(row, (notes || []).map(mapNote));
}

export async function getMeetingNotes(supabase: SupabaseClient): Promise<MeetingNote[]> {
  const { data } = await supabase
    .from('meeting_notes')
    .select('*')
    .order('date', { ascending: false });
  return (data || []).map(mapNote);
}

export async function getCalendarEvents(supabase: SupabaseClient, date?: string): Promise<CalendarEvent[]> {
  let query = supabase.from('calendar_events').select('*').order('time');
  if (date) query = query.eq('date', date);
  const { data } = await query;
  return (data || []).map(row => ({
    time: row.time,
    title: row.title,
    location: row.location || '',
    clientId: row.client_id || undefined,
  }));
}

export async function getTodos(supabase: SupabaseClient, doneFilter?: boolean): Promise<Todo[]> {
  let query = supabase.from('todos').select('*').order('created_at');
  if (doneFilter !== undefined) query = query.eq('done', doneFilter);
  const { data } = await query;
  return (data || []).map(row => ({
    id: row.id,
    task: row.task,
    clientId: row.client_id || '',
    clientName: row.client_name || '',
    suggestedTime: row.suggested_time || undefined,
    done: row.done || false,
  }));
}

export async function saveMeetingNote(supabase: SupabaseClient, note: MeetingNote) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('meeting_notes').insert({
    user_id: user.id,
    client_id: note.clientId || null,
    client_name: note.clientName,
    date: note.date,
    location: note.location,
    topics: note.topics,
    follow_ups: note.followUps,
    small_talk: note.smallTalk,
  });
  if (error) throw error;
}

export async function updateClient(supabase: SupabaseClient, id: string, updates: Partial<Client>) {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.howWeMet !== undefined) dbUpdates.how_we_met = updates.howWeMet;
  if (updates.needs !== undefined) dbUpdates.needs = updates.needs;
  if (updates.howHelped !== undefined) dbUpdates.how_helped = updates.howHelped;
  if (updates.plans !== undefined) dbUpdates.plans = updates.plans;
  if (updates.preferences !== undefined) dbUpdates.preferences = updates.preferences;
  if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
  if (updates.lastContacted !== undefined) dbUpdates.last_contacted = updates.lastContacted;
  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase.from('clients').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

export async function toggleTodo(supabase: SupabaseClient, id: string, done: boolean) {
  const { error } = await supabase.from('todos').update({ done }).eq('id', id);
  if (error) throw error;
}

export async function updateTodoTask(supabase: SupabaseClient, id: string, task: string) {
  const { error } = await supabase.from('todos').update({ task }).eq('id', id);
  if (error) throw error;
}

export function getBirthdaysToday(clients: Client[]): Client[] {
  const now = new Date();
  const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return clients.filter(c => c.birthday === todayStr);
}

export function getBirthdaysUpcoming(clients: Client[]): Client[] {
  const now = new Date();
  const todayStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return clients.filter(c => {
    if (!c.birthday || c.birthday === todayStr) return false;
    const [month, day] = c.birthday.split('-').map(Number);
    const bday = new Date(now.getFullYear(), month - 1, day);
    const diffDays = Math.ceil((bday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 14;
  });
}

export function getStaleClients(clients: Client[]): Client[] {
  return clients.filter(c => {
    if (!c.lastContacted) return false;
    const last = new Date(c.lastContacted);
    const diffMonths = (new Date().getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return diffMonths >= 3;
  });
}
