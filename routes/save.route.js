import express from 'express';
import { toggleSave, getSavedPosts } from '../controllers/save.controller.js';
import {verifyToken} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:postId/save', verifyToken, toggleSave);
router.get('/saved_posts', verifyToken, getSavedPosts);

export default router;