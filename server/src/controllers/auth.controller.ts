import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

function signToken(userId: string, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return jwt.sign({ userId, email }, secret, { expiresIn: TOKEN_EXPIRY });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters.' });
    return;
  }

  try {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: 'An account with that email already exists.' });
      return;
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ email, password: hash });

    const token = signToken(user._id.toString(), user.email);
    logger.success(`[Auth] Registered new user: ${user.email}`);

    res.status(201).json({
      token,
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed.';
    logger.error(`[Auth] Register error: ${message}`);
    res.status(500).json({ error: message });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'email and password are required.' });
    return;
  }

  try {
    // +password re-includes the field excluded by select:false in the schema
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signToken(user._id.toString(), user.email);
    logger.success(`[Auth] Login: ${user.email}`);

    res.status(200).json({
      token,
      user: { id: user._id.toString(), email: user.email },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed.';
    logger.error(`[Auth] Login error: ${message}`);
    res.status(500).json({ error: message });
  }
}
