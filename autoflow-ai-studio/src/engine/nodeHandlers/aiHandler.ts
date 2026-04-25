import type { AIConfig } from '../../types/workflow';
import { callOpenAI } from '../../lib/openai';

export async function aiHandler(
  input: string,
  config: AIConfig
): Promise<string> {
  if (!input) throw new Error('AI node received empty input.');

  return callOpenAI(input, config.mode, {
    maxWords: config.maxWords,
    tone: config.tone,
  });
}
