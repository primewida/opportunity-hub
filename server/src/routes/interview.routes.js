import { Router } from 'express';
import { getCategories, getQuestions } from '../controllers/interview.controller.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/questions', getQuestions);

export default router;
