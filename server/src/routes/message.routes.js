import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getConversations, getMessages, sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:id', authenticate, getMessages);
router.post('/send/:userId', authenticate, sendMessage);

export default router;
