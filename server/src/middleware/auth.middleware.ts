import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../types';

interface JwtPayload {
  userId: string;
  email: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided. Include Authorization: Bearer <token>' });
    return;
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET not set.' });
    return;
  }

  try {
    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch (err) {
    const expired = err instanceof jwt.TokenExpiredError;
    res.status(401).json({
      error: expired ? 'Token expired. Please log in again.' : 'Invalid token.',
    });
  }
}
