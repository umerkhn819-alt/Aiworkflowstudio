import type { TranslateConfig } from '../../types/workflow';
import { callOpenAITranslate } from '../../lib/openai';

export async function translateHandler(
  input: string,
  config: TranslateConfig
): Promise<string> {
  if (!input) throw new Error('Translate node received empty input.');
  const lang = config.targetLanguage ?? 'Spanish';
  return callOpenAITranslate(input, lang);
}
