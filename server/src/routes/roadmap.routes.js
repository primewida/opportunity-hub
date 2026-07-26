import { Router } from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  getRoadmaps,
  getRoadmapById,
  startRoadmap,
  completeStep,
  getMyProgress
} from '../controllers/roadmap.controller.js';

const router = Router();

router.get('/', optionalAuth, getRoadmaps);
router.get('/progress', authenticate, getMyProgress);
router.get('/:id', optionalAuth, getRoadmapById);
router.post('/:id/start', authenticate, startRoadmap);
router.post('/:id/steps/:stepId/complete', authenticate, completeStep);

export default router;
