import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function textFromMessage(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      clientName?: string;
      company?: string;
      lastContacted?: string;
      preferences?: unknown;
      meetingHistory?: unknown;
    };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 420,
      system:
        'Draft a warm 3-4 sentence re-engagement message from a relationship manager to a client. Reference shared history naturally, sound human, and avoid sounding salesy.',
      messages: [{ role: 'user', content: JSON.stringify(body, null, 2) }],
    });

    return Response.json({ message: textFromMessage(message) });
  } catch (error) {
    console.error('Failed to generate check-in message', error);
    return Response.json(
      { error: 'Failed to generate check-in message' },
      { status: 500 }
    );
  }
}
