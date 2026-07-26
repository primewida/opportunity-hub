import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getCourses,
  getCourseById,
  getRecommendedCourses
} from '../controllers/course.controller.js';

const router = Router();

router.get('/', getCourses);
router.get('/recommendations', authenticate, getRecommendedCourses);
router.get('/:id', getCourseById);

export default router;
