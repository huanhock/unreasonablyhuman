import { createClient } from '@/lib/supabase/server';
import { clients as mockClients, todayCalendar, todayTodos } from '@/data/mock';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const { count } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true });
  if (count && count > 0) {
    return Response.json({ message: 'Already seeded', count });
  }

  const clientIdMap = new Map<string, string>();

  for (const client of mockClients) {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: user.id,
        name: client.name,
        company: client.company,
        status: client.status,
        birthday: client.birthday,
        how_we_met: client.howWeMet,
        needs: client.needs,
        how_helped: client.howHelped,
        plans: client.plans,
        budget: client.budget,
        last_contacted: client.lastContacted,
        preferences: client.preferences,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to insert client', client.name, error);
      continue;
    }
    clientIdMap.set(client.id, data.id);

    for (const note of client.meetingHistory) {
      await supabase.from('meeting_notes').insert({
        user_id: user.id,
        client_id: data.id,
        client_name: note.clientName,
        date: note.date,
        location: note.location,
        topics: note.topics,
        follow_ups: note.followUps,
        small_talk: note.smallTalk,
      });
    }
  }

  const today = new Date().toISOString().split('T')[0];
  for (const event of todayCalendar) {
    await supabase.from('calendar_events').insert({
      user_id: user.id,
      client_id: event.clientId ? clientIdMap.get(event.clientId) || null : null,
      title: event.title,
      time: event.time,
      location: event.location,
      date: today,
    });
  }

  for (const todo of todayTodos) {
    await supabase.from('todos').insert({
      user_id: user.id,
      client_id: clientIdMap.get(todo.clientId) || null,
      client_name: todo.clientName,
      task: todo.task,
      done: false,
      suggested_time: todo.suggestedTime || '',
    });
  }

  return Response.json({ message: 'Seeded successfully', clients: mockClients.length });
}
