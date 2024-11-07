import express from 'express';
import { addComment, getCommentsByPost, editComment, deleteComment } from '../controllers/comment.controller.js';
import { verifyToken ,verifyLike} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:postId', verifyToken, addComment); // Add a comment
router.get('/:postId',verifyLike, getCommentsByPost); // Get comments for a post
router.put('/:commentId', verifyToken, editComment); // Edit a comment
router.delete('/:commentId', verifyToken, deleteComment); // Delete a comment

export default router;
