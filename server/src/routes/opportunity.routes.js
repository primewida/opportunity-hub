import express from 'express';
import { getOpportunities, getFeed, getOpportunityById, saveOpportunity, unsaveOpportunity, getSavedOpportunities } from '../controllers/opportunity.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getOpportunities);
router.get('/feed', authenticate, getFeed);
router.get('/saved', authenticate, getSavedOpportunities);
router.get('/:id', optionalAuth, getOpportunityById);
router.post('/:id/save', authenticate, saveOpportunity);
router.delete('/:id/unsave', authenticate, unsaveOpportunity);

export default router;
