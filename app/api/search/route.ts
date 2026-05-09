import Anthropic from '@anthropic-ai/sdk';
import type { Client } from '@/lib/types';

interface SearchResult {
  id: string;
  reason: string;
}

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

function parseJsonArray(raw: string): SearchResult[] {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');

  if (start === -1 || end === -1 || end < start) {
    throw new Error('Claude response did not include a JSON array');
  }

  const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('Claude response was not a JSON array');
  }

  return parsed
    .filter(
      (item): item is SearchResult =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        'reason' in item &&
        typeof item.id === 'string' &&
        typeof item.reason === 'string'
    )
    .map((item) => ({ id: item.id, reason: item.reason }));
}

export async function POST(request: Request) {
  try {
    const { query, clients } = (await request.json()) as {
      query?: string;
      clients?: Client[];
    };

    if (!query?.trim()) {
      return Response.json({ error: 'query is required' }, { status: 400 });
    }

    if (!Array.isArray(clients)) {
      return Response.json({ error: 'clients must be an array' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system:
        'You are a client search assistant. Given a natural language query and client data, return a JSON array of matching client IDs with a brief reason why each matches. Return format: [{"id": "uuid", "reason": "string"}]. If no matches, return empty array. Return ONLY the JSON array, no markdown.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify({ query, clients }, null, 2),
        },
      ],
    });

    return Response.json({ results: parseJsonArray(textFromMessage(message)) });
  } catch (error) {
    console.error('Failed to search clients', error);
    return Response.json(
      { error: 'Failed to search clients' },
      { status: 500 }
    );
  }
}
