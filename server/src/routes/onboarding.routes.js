import express from 'express';
import { 
  getOnboardingStatus, completeOnboarding, updateProfile, setInterests, setSkills 
} from '../controllers/onboarding.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', authenticate, getOnboardingStatus);
router.post('/complete', authenticate, completeOnboarding);
router.put('/profile', authenticate, updateProfile);
router.put('/interests', authenticate, setInterests);
router.put('/skills', authenticate, setSkills);

export default router;
