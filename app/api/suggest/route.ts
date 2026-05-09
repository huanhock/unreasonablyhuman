import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const budgetLabels: Record<string, string> = {
  $: 'under $30',
  $$: '$30-100',
  $$$: '$100-300',
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientName?: string;
      preferences?: unknown;
      budget?: string;
      occasion?: string;
    };

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 520,
      system:
        'You are a thoughtful relationship manager. Suggest 2-3 personalized gift ideas and include a warm birthday message draft. Be specific, tasteful, and concise.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify(
            {
              clientName: body.clientName,
              preferences: body.preferences,
              budget: budgetLabels[body.budget ?? ''] ?? body.budget,
              occasion: body.occasion,
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
    console.error('Failed to generate suggestion', error);
    return Response.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
