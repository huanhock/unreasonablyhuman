import Anthropic from '@anthropic-ai/sdk';
import { clients, type MeetingNote } from '@/data/mock';

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

function parseJsonObject<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    throw new Error('Claude response did not include a JSON object');
  }

  return JSON.parse(cleaned.slice(start, end + 1)) as T;
}

export async function POST(request: Request) {
  try {
    const { notes } = (await request.json()) as { notes?: string };

    if (!notes?.trim()) {
      return Response.json({ error: 'notes is required' }, { status: 400 });
    }

    const clientNames = clients.map((client) => client.name).join(', ');
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 900,
      system: `Extract raw meeting notes into exactly one JSON object matching this TypeScript schema, with no markdown or commentary:

{
  "id": "string, create a stable short id if missing",
  "clientId": "string, use the matching known client id when possible",
  "clientName": "string, use one of the known client names when possible",
  "date": "YYYY-MM-DD",
  "location": "string",
  "topics": ["string"],
  "followUps": [{ "task": "string", "done": false }],
  "smallTalk": {
    "family": "string or omit",
    "holidays": "string or omit",
    "food": "string or omit",
    "hobbies": "string or omit"
  }
}

Known clients: ${clientNames}.`,
      messages: [{ role: 'user', content: notes }],
    });

    const extracted = parseJsonObject<MeetingNote>(textFromMessage(message));
    return Response.json({ extracted });
  } catch (error) {
    console.error('Failed to extract meeting note', error);
    return Response.json(
      { error: 'Failed to extract meeting note' },
      { status: 500 }
    );
  }
}
