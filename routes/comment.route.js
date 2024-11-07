import express from 'express';
import { addComment, getCommentsByPost, editComment, deleteComment } from '../controllers/comment.controller.js';
import { verifyToken ,verifyLike} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:postId', verifyToken, addComment);
router.get('/:postId',verifyLike, getCommentsByPost);
router.put('/:commentId', verifyToken, editComment);
router.delete('/:commentId', verifyToken, deleteComment);

export default router;
