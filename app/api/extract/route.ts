import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { getClients } from '@/lib/db';
import type { MeetingNote } from '@/lib/types';

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

const SYSTEM_PROMPT = (clientNames: string) =>
  `Extract raw meeting notes (text or handwritten image) into exactly one JSON object matching this TypeScript schema, with no markdown or commentary:

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

Known clients: ${clientNames}.`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      notes?: string;
      image?: string;
      mimeType?: string;
    };

    const supabase = await createClient();
    const clients = await getClients(supabase);
    const clientNames = clients.map((client) => `${client.name} (id: ${client.id})`).join(', ');

    let userContent: Anthropic.Messages.ContentBlockParam[];

    if (body.image) {
      userContent = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: (body.mimeType || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
            data: body.image,
          },
        },
        {
          type: 'text',
          text: 'Extract structured meeting note data from this handwritten/typed note image.',
        },
      ];
    } else if (body.notes?.trim()) {
      userContent = [{ type: 'text', text: body.notes }];
    } else {
      return Response.json({ error: 'notes or image is required' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 900,
      system: SYSTEM_PROMPT(clientNames),
      messages: [{ role: 'user', content: userContent }],
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
