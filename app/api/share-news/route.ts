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
      headline?: string;
      source?: string;
      clientName?: string;
      shareNote?: string;
    };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system:
        'You are a relationship manager drafting a short, warm message to share a news article with a client. Keep it to 2-3 sentences — professional but friendly. Include why this article is relevant to them specifically. Do not include a subject line.',
      messages: [{ role: 'user', content: JSON.stringify(body, null, 2) }],
    });

    return Response.json({ draft: textFromMessage(message) });
  } catch (error) {
    console.error('Failed to generate share message', error);
    return Response.json(
      { error: 'Failed to generate share message' },
      { status: 500 }
    );
  }
}
