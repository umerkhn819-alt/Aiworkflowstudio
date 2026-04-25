import { Router } from 'express';
import { runAINode, healthCheck } from '../controllers/ai.controller';

const router = Router();

router.get('/health', healthCheck);
router.post('/ai/run', runAINode);

export default router;
