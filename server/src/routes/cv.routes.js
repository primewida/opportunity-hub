import { Router } from 'express';
import { getTemplates, generateCV } from '../controllers/cv.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/templates', getTemplates);
router.post('/generate', authenticate, generateCV);

export default router;
