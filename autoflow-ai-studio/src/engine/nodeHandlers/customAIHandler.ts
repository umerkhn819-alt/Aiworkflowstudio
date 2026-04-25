import type { CustomAIConfig } from '../../types/workflow';
import { callOpenAICustom } from '../../lib/openai';

export async function customAIHandler(
  input: string,
  config: CustomAIConfig
): Promise<string> {
  if (!input) throw new Error('AI Custom node received empty input.');
  return callOpenAICustom(input, config.systemPrompt ?? '');
}
