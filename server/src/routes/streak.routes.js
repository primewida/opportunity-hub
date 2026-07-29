import express from 'express';
import * as streakController from '../controllers/streak.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, streakController.getStreak);
router.put('/goals', authenticate, streakController.updateGoals);
router.post('/log-activity', authenticate, streakController.logActivity);

export default router;
