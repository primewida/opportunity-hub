import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import * as authController from '../controllers/auth.controller.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/google', authController.googleAuth);
router.post('/apple', authController.appleAuth);

export default router;
