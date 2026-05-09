import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import {
  USER_NAME,
  birthdaysToday,
  birthdaysUpcoming,
  staleClients,
  todayCalendar,
  todayNews,
  todayTodos,
} from '@/data/mock';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    const narration = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 520,
      system:
        'You are a warm friendly narrator, conversational, like talking to a friend over coffee, no headers or formatting, just spoken words. Write about 200 words.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify(
            {
              USER_NAME,
              todayCalendar,
              todayTodos,
              birthdaysToday,
              birthdaysUpcoming,
              staleClients,
              todayNews,
            },
            null,
            2
          ),
        },
      ],
    });

    const script = textFromMessage(narration);
    const speech = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: script,
    });
    const audio = await speech.arrayBuffer();

    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Failed to generate audio brief', error);
    return Response.json(
      { error: 'Failed to generate audio brief' },
      { status: 500 }
    );
  }
}
