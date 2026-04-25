import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  listWorkflows,
  createWorkflow,
  getWorkflow,
  updateWorkflow,
  deleteWorkflow,
} from '../controllers/workflow.controller';
import type { AuthRequest } from '../types';

const router = Router();

// Adapter so Express's router typing accepts our AuthRequest handlers
type AuthHandler = (req: AuthRequest, res: Response, next: NextFunction) => void;
function auth(fn: AuthHandler) {
  return (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthRequest, res, next);
}

// All workflow routes require a valid JWT — authMiddleware adds req.userId
router.use(auth(authMiddleware));

router.get('/workflows', auth(listWorkflows));
router.post('/workflows', auth(createWorkflow));
router.get('/workflows/:id', auth(getWorkflow));
router.put('/workflows/:id', auth(updateWorkflow));
router.delete('/workflows/:id', auth(deleteWorkflow));

export default router;
