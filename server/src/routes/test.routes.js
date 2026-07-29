import { Router } from 'express';
import { getTestTypes, getQuestions, submitQuiz } from '../controllers/test.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/types', getTestTypes);
router.get('/questions', getQuestions);
router.post('/submit', authenticate, submitQuiz);

export default router;
