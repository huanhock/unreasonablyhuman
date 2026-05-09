import Anthropic from '@anthropic-ai/sdk';
import {
  birthdaysToday,
  birthdaysUpcoming,
  staleClients,
  todayCalendar,
  todayTodos,
} from '@/data/mock';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST() {
  try {
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
              birthdaysToday,
              birthdaysUpcoming,
              staleClients,
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
