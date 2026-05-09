import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { getClients, getCalendarEvents, getTodos, getBirthdaysToday, getBirthdaysUpcoming, getStaleClients } from '@/lib/db';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const [clients, todayCalendar, todayTodos] = await Promise.all([
      getClients(supabase),
      getCalendarEvents(supabase, today),
      getTodos(supabase, false),
    ]);

    const birthdaysToday = getBirthdaysToday(clients);
    const birthdaysUpcoming = getBirthdaysUpcoming(clients);
    const staleClients = getStaleClients(clients);

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 220,
      system:
        'You write warm, concise morning relationship-management briefings. Summarize the day in 2-3 sentences, optimistic and human, with no headers or bullet points.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify(
            {
              todayCalendar,
              todayTodos,
              birthdaysToday: birthdaysToday.map(c => ({ name: c.name, company: c.company })),
              birthdaysUpcoming: birthdaysUpcoming.map(c => ({ name: c.name, company: c.company, birthday: c.birthday })),
              staleClients: staleClients.map(c => ({ name: c.name, company: c.company, lastContacted: c.lastContacted })),
            },
            null,
            2
          ),
        },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Failed to generate summary', error);
    return Response.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
