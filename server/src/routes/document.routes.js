import express from 'express';
import * as documentController from '../controllers/document.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, documentController.getDocuments);
router.post('/', authenticate, documentController.uploadDocument);
router.get('/storage', authenticate, documentController.getStorageUsage);
router.get('/:id', authenticate, documentController.getDocument);
router.put('/:id', authenticate, documentController.updateDocument);
router.delete('/:id', authenticate, documentController.deleteDocument);

export default router;
