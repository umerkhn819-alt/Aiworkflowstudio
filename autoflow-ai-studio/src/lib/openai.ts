import { callMockAI, callMockAICustom, callMockAITranslate } from './mockAI';

type BackendNodeType = 'summarize' | 'rewrite' | 'custom' | 'translate';

interface BackendAIRunBody {
  nodeType: BackendNodeType;
  input: string;
  options?: {
    maxWords?: number;
    tone?: string;
    systemPrompt?: string;
    targetLanguage?: string;
  };
}

interface BackendAIRunResponse {
  result?: string;
  error?: string;
}

function getBackendBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  return (fromEnv ?? 'http://localhost:5000').replace(/\/$/, '');
}

async function fetchBackendAI(body: BackendAIRunBody): Promise<string> {
  const res = await fetch(`${getBackendBaseUrl()}/api/ai/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as BackendAIRunResponse));
    throw new Error(err?.error || `AI API error: ${res.status}`);
  }

  const data = (await res.json()) as BackendAIRunResponse;
  const result = data.result?.trim() ?? '';
  if (!result) throw new Error('AI API returned an empty response.');
  return result;
}

export async function callOpenAI(
  prompt: string,
  mode: 'summarize' | 'rewrite',
  options: { maxWords?: number; tone?: string } = {}
): Promise<string> {
  try {
    return await fetchBackendAI({
      nodeType: mode,
      input: prompt,
      options: {
        maxWords: options.maxWords,
        tone: options.tone,
      },
    });
  } catch (err) {
    // Keep demo mode resilient if backend is unavailable or misconfigured.
    console.warn('[AI] Falling back to mock summarize/rewrite:', err);
    return callMockAI(prompt, mode);
  }
}

export async function callOpenAICustom(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  if (!systemPrompt.trim()) {
    throw new Error('AI Custom node requires a system prompt. Please enter one.');
  }

  try {
    return await fetchBackendAI({
      nodeType: 'custom',
      input: prompt,
      options: { systemPrompt },
    });
  } catch (err) {
    console.warn('[AI] Falling back to mock custom AI:', err);
    return callMockAICustom(prompt, systemPrompt);
  }
}

export async function callOpenAITranslate(
  prompt: string,
  targetLanguage: string
): Promise<string> {
  try {
    return await fetchBackendAI({
      nodeType: 'translate',
      input: prompt,
      options: { targetLanguage },
    });
  } catch (err) {
    console.warn('[AI] Falling back to mock translate:', err);
    return callMockAITranslate(prompt, targetLanguage);
  }
}
