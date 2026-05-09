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

function textFromMessage(message: Anthropic.Messages.Message): string {
  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();
}

export async function POST() {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
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

    return Response.json({ summary: textFromMessage(message) });
  } catch (error) {
    console.error('Failed to generate summary', error);
    return Response.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
