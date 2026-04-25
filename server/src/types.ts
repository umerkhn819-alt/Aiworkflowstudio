import type { Request } from 'express';

export type AINodeType = 'summarize' | 'rewrite' | 'translate' | 'custom';

// Extended Express Request that carries the authenticated user's id
// Set by auth.middleware.ts after JWT verification
export interface AuthRequest extends Request {
  userId: string;
}

export interface AIRunOptions {
  maxWords?: number;
  tone?: string;
  targetLanguage?: string;
  systemPrompt?: string;
}

export interface AIRunRequest {
  nodeType: AINodeType;
  input: string;
  options?: AIRunOptions;
}

export interface AIRunResponse {
  result: string;
  mode: 'openai' | 'mock';
}
