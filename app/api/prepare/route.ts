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
      needs?: string;
      howHelped?: string;
      plans?: string;
      preferences?: unknown;
      meetingHistory?: unknown;
    };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system:
        'You are an expert relationship manager preparing for a client meeting. Generate a concise meeting prep brief with: 1) Key talking points based on recent history, 2) Personal touches to mention (family, hobbies, food preferences), 3) Open follow-ups to address, 4) One conversation starter suggestion. Be warm, specific, and actionable. Use short bullet points, no headers.',
      messages: [{ role: 'user', content: JSON.stringify(body, null, 2) }],
    });

    return Response.json({ brief: textFromMessage(message) });
  } catch (error) {
    console.error('Failed to generate meeting prep', error);
    return Response.json(
      { error: 'Failed to generate meeting prep' },
      { status: 500 }
    );
  }
}
