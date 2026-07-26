import express from 'express';
import { getJobs, getJobById, saveJob } from '../controllers/job.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJobById);
router.post('/:id/save', authenticate, saveJob);

export default router;
