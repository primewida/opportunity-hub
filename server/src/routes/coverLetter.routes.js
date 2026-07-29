import { Router } from 'express';
import { generateCoverLetter } from '../controllers/coverLetter.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/generate', authenticate, generateCoverLetter);

export default router;
