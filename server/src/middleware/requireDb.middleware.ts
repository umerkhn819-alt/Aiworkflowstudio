import type { Request, Response, NextFunction } from 'express';
import { isConnected } from '../db/connection';

export function requireDb(_req: Request, res: Response, next: NextFunction): void {
  if (!isConnected()) {
    res.status(503).json({
      error: 'Database unavailable',
      message:
        'MongoDB is not connected. Set MONGO_URI in your server .env file and restart.',
    });
    return;
  }
  next();
}
