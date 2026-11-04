import { config } from '../config.js';

const URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGroq(system, user) {
  if (!config.GROQ_API_KEY) throw new Error('GROQ_API_KEY not set');
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${config.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: config.GROQ_MODEL,
      max_tokens: 300,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Groq responded ${res.status}`);
  const text = (await res.json()).choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned no content');
  return text;
}
