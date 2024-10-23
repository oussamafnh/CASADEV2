import express from 'express';
import { createPost , getAllPostsPaginated, getLatestPostsPaginated , getPostsByUser ,getMostLikedPosts , getPostById , editPost } from '../controllers/post.controller.js';
import { likePost, unlikePost, getPostLikes } from '../controllers/like.controller.js';
import { verifyToken, verifyLike , checkIsAuthor } from '../middleware/auth.middleware.js'; // Adjust the path as necessary


const router = express.Router();

router.post('/create', verifyToken, createPost);
router.get('', verifyLike,getAllPostsPaginated);
router.get('/latest',verifyLike, getLatestPostsPaginated);
router.get('/author/:userId', getPostsByUser);

router.post('/:postId/like', verifyToken, likePost);
router.delete('/:postId/unlike', verifyToken, unlikePost);
router.get('/:postId/likes', getPostLikes);


router.get('/mostliked',verifyLike, getMostLikedPosts);


router.get('/:id',verifyLike, getPostById);
router.put('/:id/edit', verifyToken, checkIsAuthor, editPost);

export default router;
