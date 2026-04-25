import type { DelayConfig } from '../../types/workflow';

export async function delayHandler(
  input: string,
  config: DelayConfig
): Promise<string> {
  const seconds = Math.max(0.5, Math.min(config.seconds ?? 1, 10));
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  return input;
}
