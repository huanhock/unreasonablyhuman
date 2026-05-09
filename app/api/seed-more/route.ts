import { createClient } from '@/lib/supabase/server';
import { clients as mockClients } from '@/data/mock';

const newClientIds = ['david-tan', 'rachel-kim', 'ahmed-hassan', 'emma-wright', 'kevin-nakamura'];

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const newClients = mockClients.filter(c => newClientIds.includes(c.id));
  let inserted = 0;

  for (const client of newClients) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', client.name)
      .maybeSingle();

    if (existing) continue;

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

    inserted++;
  }

  return Response.json({ message: `Added ${inserted} new clients`, inserted });
}
