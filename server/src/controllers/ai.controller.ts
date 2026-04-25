import type { Request, Response } from 'express';
import { runOpenAI } from '../services/openai.service';
import { runMock } from '../services/mock.service';
import { logger } from '../utils/logger';
import type { AINodeType, AIRunOptions, AIRunResponse } from '../types';

const VALID_NODE_TYPES: AINodeType[] = ['summarize', 'rewrite', 'translate', 'custom'];

export async function runAINode(req: Request, res: Response): Promise<void> {
  const { nodeType, input, options = {} } = req.body as {
    nodeType: unknown;
    input: unknown;
    options?: AIRunOptions;
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  if (!nodeType || typeof nodeType !== 'string') {
    res.status(400).json({ error: 'Missing required field: nodeType' });
    return;
  }
  if (!VALID_NODE_TYPES.includes(nodeType as AINodeType)) {
    res.status(400).json({
      error: `Invalid nodeType "${nodeType}". Must be one of: ${VALID_NODE_TYPES.join(', ')}`,
    });
    return;
  }
  if (!input || typeof input !== 'string' || !input.trim()) {
    res.status(400).json({ error: 'Missing required field: input (must be a non-empty string)' });
    return;
  }

  logger.info(`[AI] ${nodeType} request received — input length: ${input.length}`);

  const hasKey = !!process.env.OPENAI_API_KEY;

  // ── Execute ───────────────────────────────────────────────────────────────────
  try {
    let result: string;
    let mode: AIRunResponse['mode'];

    if (hasKey) {
      logger.info(`[AI] using openai (nodeType=${nodeType})`);
      result = await runOpenAI(nodeType, input.trim(), options);
      mode = 'openai';
      logger.success(`[AI] openai response received — length: ${result.length}`);
    } else {
      logger.warn(`[AI] OPENAI_API_KEY not set — using mock fallback (nodeType=${nodeType})`);
      result = runMock(nodeType, input.trim(), options);
      mode = 'mock';
      logger.success(`[AI] mock response generated`);
    }

    const response: AIRunResponse = { result, mode };
    res.status(200).json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`[AI] error during ${nodeType}: ${message}`);
    res.status(500).json({ error: message });
  }
}

export function healthCheck(_req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mode: process.env.OPENAI_API_KEY ? 'openai' : 'mock',
  });
}
