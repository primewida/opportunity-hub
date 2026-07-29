import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import {
  getFeed,
  getTrending,
  getGroups,
  getMyGroups,
  joinGroup,
  leaveGroup,
  getGroupPosts,
  createPost,
  addComment,
  voteOnPost
} from '../controllers/community.controller.js';

const router = express.Router();

router.get('/feed', optionalAuth, getFeed);
router.get('/trending', getTrending);
router.get('/groups', optionalAuth, getGroups);
router.get('/groups/mine', authenticate, getMyGroups);
router.post('/groups/:id/join', authenticate, joinGroup);
router.delete('/groups/:id/leave', authenticate, leaveGroup);
router.get('/groups/:id/posts', getGroupPosts);
router.post('/groups/:id/posts', authenticate, createPost);
router.post('/posts/:id/comments', authenticate, addComment);
router.post('/posts/:id/vote', authenticate, voteOnPost);

export default router;
