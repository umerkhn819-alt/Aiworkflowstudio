import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.warn('MONGO_URI not set — workflow/auth routes will return 503.');
    logger.warn('To enable persistence: add MONGO_URI to your .env file.');
    return false;
  }

  try {
    await mongoose.connect(uri);
    logger.success(`MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(`MongoDB connection failed: ${message}`);
    logger.warn('Workflow/auth routes will return 503 until DB is available.');
    return false;
  }
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
