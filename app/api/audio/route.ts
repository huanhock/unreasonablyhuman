import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { getProfile, getClients, getCalendarEvents, getTodos, getBirthdaysToday, getBirthdaysUpcoming, getStaleClients } from '@/lib/db';
import { todayNews } from '@/data/mock';

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

function pcmToWav(pcmData: Buffer, sampleRate: number, numChannels: number, bitsPerSample: number): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, headerSize);

  return buffer;
}

export async function POST() {
  try {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const [profile, clients, todayCalendar, todayTodos] = await Promise.all([
      getProfile(supabase),
      getClients(supabase),
      getCalendarEvents(supabase, today),
      getTodos(supabase, false),
    ]);

    const userName = profile?.display_name || 'there';
    const birthdaysToday = getBirthdaysToday(clients);
    const birthdaysUpcoming = getBirthdaysUpcoming(clients);
    const staleClients = getStaleClients(clients);

    const narration = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 520,
      system:
        'You are a warm friendly narrator, conversational, like talking to a friend over coffee, no headers or formatting, just spoken words. Write about 200 words.',
      messages: [
        {
          role: 'user',
          content: JSON.stringify(
            {
              USER_NAME: userName,
              todayCalendar,
              todayTodos,
              birthdaysToday: birthdaysToday.map(c => ({ name: c.name, company: c.company })),
              birthdaysUpcoming: birthdaysUpcoming.map(c => ({ name: c.name, company: c.company, birthday: c.birthday })),
              staleClients: staleClients.map(c => ({ name: c.name, company: c.company, lastContacted: c.lastContacted })),
              todayNews,
            },
            null,
            2
          ),
        },
      ],
    });

    const script = textFromMessage(narration);

    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: script }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: 'Kore',
                },
              },
            },
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini TTS error:', errorText);
      throw new Error(`Gemini TTS failed: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const audioBase64 = geminiData.candidates[0].content.parts[0].inlineData.data;
    const pcmBuffer = Buffer.from(audioBase64, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer, 24000, 1, 16);

    return new Response(new Uint8Array(wavBuffer), {
      headers: {
        'Content-Type': 'audio/wav',
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
