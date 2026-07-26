import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as userController from '../controllers/user.controller.js';
import { updateProfileSchema, profileSetupSchema, updateSkillsSchema, updateInterestsSchema } from '../schemas/user.schema.js';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getMe);
router.put('/me', validate(updateProfileSchema), userController.updateMe);
router.post('/me/complete-onboarding', userController.completeOnboarding);
router.post('/me/profile-setup', validate(profileSetupSchema), userController.profileSetup);

router.get('/me/skills', userController.getUserSkills);
router.post('/me/skills', validate(updateSkillsSchema), userController.updateUserSkills);

router.get('/me/interests', userController.getUserInterests);
router.post('/me/interests', validate(updateInterestsSchema), userController.updateUserInterests);

router.get('/:id', userController.getPublicProfile);

export default router;
