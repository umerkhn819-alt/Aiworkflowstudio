import type { NodeData } from '../../types/workflow';

export async function inputHandler(
  _input: string,
  config: NodeData['config']
): Promise<string> {
  const cfg = config as { value?: string };
  const value = cfg.value?.trim() ?? '';
  if (!value) {
    throw new Error('Input node has no text. Please enter some text first.');
  }
  return value;
}
