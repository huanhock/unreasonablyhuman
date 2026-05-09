import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientName?: string;
      company?: string;
      lastContacted?: string;
      preferences?: unknown;
      meetingHistory?: unknown;
    };

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 420,
      system:
        'Draft a warm 3-4 sentence re-engagement message from a relationship manager to a client. Reference shared history naturally, sound human, and avoid sounding salesy.',
      messages: [{ role: 'user', content: JSON.stringify(body, null, 2) }],
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
    console.error('Failed to generate check-in message', error);
    return Response.json(
      { error: 'Failed to generate check-in message' },
      { status: 500 }
    );
  }
}
