import express from 'express';
import * as applicationController from '../controllers/application.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, applicationController.getApplications);
router.post('/', authenticate, applicationController.createApplication);
router.put('/:id', authenticate, applicationController.updateApplication);
router.delete('/:id', authenticate, applicationController.deleteApplication);

export default router;
