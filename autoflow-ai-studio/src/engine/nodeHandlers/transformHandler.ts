import type { TransformConfig } from '../../types/workflow';

export async function transformHandler(
  input: string,
  config: TransformConfig
): Promise<string> {
  if (!input) throw new Error('Transform node received empty input.');

  switch (config.operation) {
    case 'uppercase':
      return input.toUpperCase();
    case 'lowercase':
      return input.toLowerCase();
    case 'trim':
      return input.trim();
    case 'reverse':
      return input.split('').reverse().join('');
    case 'replace': {
      const find = config.find ?? '';
      const replaceWith = config.replace ?? '';
      if (!find) throw new Error('Replace operation requires a "Find" value.');
      return input.split(find).join(replaceWith);
    }
    default:
      return input;
  }
}
