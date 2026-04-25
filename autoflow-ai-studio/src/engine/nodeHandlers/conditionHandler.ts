import type { ConditionConfig } from '../../types/workflow';

export interface ConditionResult {
  input: string;
  matched: boolean;
}

export async function conditionHandler(
  input: string,
  config: ConditionConfig
): Promise<ConditionResult> {
  if (!input) {
    return { input: '', matched: false };
  }

  const keyword = config.keyword ?? '';
  if (!keyword.trim()) {
    throw new Error('Condition node requires a keyword to check.');
  }

  const haystack = config.caseSensitive ? input : input.toLowerCase();
  const needle = config.caseSensitive ? keyword : keyword.toLowerCase();
  const matched = haystack.includes(needle);

  return { input, matched };
}
