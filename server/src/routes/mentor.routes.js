import express from 'express';
import { getMentors, getMentorById } from '../controllers/mentor.controller.js';

const router = express.Router();

router.get('/', getMentors);
router.get('/:id', getMentorById);

export default router;
