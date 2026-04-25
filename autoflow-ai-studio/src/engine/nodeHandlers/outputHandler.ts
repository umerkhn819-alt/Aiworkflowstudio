export async function outputHandler(input: string): Promise<string> {
  if (!input && input !== '') {
    throw new Error('Output node received no input. Make sure it is connected to an upstream node.');
  }
  return input;
}
