export async function readStream(
  response: Response,
  onChunk: (text: string) => void
): Promise<string> {
  if (!response.ok || !response.body) {
    throw new Error('Stream failed');
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onChunk(full);
  }
  return full;
}
