const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const DIM = '\x1b[2m';

function timestamp(): string {
  return new Date().toISOString();
}

function prefix(level: string, color: string): string {
  return `${DIM}[${timestamp()}]${RESET} ${color}${level}${RESET}`;
}

export const logger = {
  info(msg: string, ...args: unknown[]): void {
    console.log(`${prefix('INFO ', CYAN)} ${msg}`, ...args);
  },
  success(msg: string, ...args: unknown[]): void {
    console.log(`${prefix('  OK ', GREEN)} ${msg}`, ...args);
  },
  warn(msg: string, ...args: unknown[]): void {
    console.warn(`${prefix('WARN ', YELLOW)} ${msg}`, ...args);
  },
  error(msg: string, ...args: unknown[]): void {
    console.error(`${prefix('ERROR', RED)} ${msg}`, ...args);
  },
};
