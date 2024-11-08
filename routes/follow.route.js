// routes/followRoutes.js
import express from 'express';
import { followToggle, getFollowers, getFollowing } from '../controllers/follow.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/toggle', verifyToken, followToggle); // Toggle follow/unfollow
router.get('/:userId/followers', getFollowers); // Get followers of a user
router.get('/:userId/following', getFollowing); // Get users that a user is following

export default router;
