import express from 'express';
import * as leaderboardController from '../controllers/leaderboard.controller.js';

const router = express.Router();

router.get('/', leaderboardController.getLeaderboard);

export default router;
