import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getSkills,
  getSkillGap
} from '../controllers/skill.controller.js';

const router = Router();

router.get('/', getSkills);
router.get('/gap/:opportunityId', authenticate, getSkillGap);

export default router;
