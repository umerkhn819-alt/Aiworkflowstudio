import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db/connection';
import { requireDb } from './middleware/requireDb.middleware';
import aiRouter from './routes/ai.routes';
import authRouter from './routes/auth.routes';
import workflowRouter from './routes/workflow.routes';
import { logger } from './utils/logger';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '2mb' }));

// ─── Request logger middleware ────────────────────────────────────────────────

app.use((req, _res, next) => {
  logger.info(`→ ${req.method} ${req.path}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

// AI routes — always available (no DB needed)
app.use('/api', aiRouter);

// Auth + workflow routes — return 503 gracefully if MongoDB isn't connected
app.use('/api', requireDb, authRouter);
app.use('/api', requireDb, workflowRouter);

// ─── 404 handler ─────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Connect to MongoDB then start ───────────────────────────────────────────

async function start() {
  // connectDB returns false if not configured — server still starts
  await connectDB();

  app.listen(PORT, () => {
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    logger.success(`AutoFlow backend running at http://localhost:${PORT}`);
    logger.info(`AI mode:  ${hasOpenAI ? 'OpenAI (live)' : 'Mock (no OPENAI_API_KEY set)'}`);
    logger.info('Endpoints:');
    logger.info(`  GET  http://localhost:${PORT}/api/health`);
    logger.info(`  POST http://localhost:${PORT}/api/ai/run`);
    logger.info(`  POST http://localhost:${PORT}/api/auth/register`);
    logger.info(`  POST http://localhost:${PORT}/api/auth/login`);
    logger.info(`  GET  http://localhost:${PORT}/api/workflows          (JWT required)`);
    logger.info(`  POST http://localhost:${PORT}/api/workflows          (JWT required)`);
    logger.info(`  GET  http://localhost:${PORT}/api/workflows/:id      (JWT required)`);
    logger.info(`  PUT  http://localhost:${PORT}/api/workflows/:id      (JWT required)`);
    logger.info(`  DEL  http://localhost:${PORT}/api/workflows/:id      (JWT required)`);
  });
}

start();
