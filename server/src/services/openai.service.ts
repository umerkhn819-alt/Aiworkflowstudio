import type { AIRunOptions } from '../types';

// ─── Raw OpenAI chat completions call ────────────────────────────────────────

async function fetchOpenAI(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const baseUrl = (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, '');
  const model = process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `OpenAI API error: ${res.status}`);
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> };
  const content = data.choices[0]?.message?.content?.trim() ?? '';
  if (!content) throw new Error('OpenAI returned an empty response.');
  return content;
}

// ─── Build system prompts matching frontend openai.ts exactly ─────────────────

function buildSystemPrompt(nodeType: string, options: AIRunOptions): string {
  switch (nodeType) {
    case 'summarize':
      return `You are a concise summarizer. Summarize the given text${
        options.maxWords ? ` in at most ${options.maxWords} words` : ''
      }. Return only the summary, no preamble.`;

    case 'rewrite':
      return `You are an expert writer. Rewrite the given text to be more engaging and polished${
        options.tone ? ` with a ${options.tone} tone` : ''
      }. Return only the rewritten text, no preamble.`;

    case 'translate':
      return `You are a professional translator. Translate the following text to ${
        options.targetLanguage ?? 'Spanish'
      }. Return only the translated text, no preamble or explanation.`;

    case 'custom': {
      const sp = options.systemPrompt?.trim() ?? '';
      if (!sp) throw new Error('AI Custom node requires a system prompt.');
      return sp;
    }

    default:
      throw new Error(`Unknown nodeType: ${nodeType}`);
  }
}

// ─── Public service function ──────────────────────────────────────────────────

export async function runOpenAI(
  nodeType: string,
  input: string,
  options: AIRunOptions
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured on the server.');

  const systemPrompt = buildSystemPrompt(nodeType, options);

  try {
    return await fetchOpenAI(apiKey, systemPrompt, input);
  } catch (err) {
    if (err instanceof Error && err.message.includes('401')) {
      throw new Error('Invalid API key. Check OPENAI_API_KEY in your server .env file.');
    }
    throw err;
  }
}
