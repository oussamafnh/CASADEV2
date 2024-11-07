import express from 'express';
import {getPostCountByUser, createPost , getAllPostsPaginated,getMyPosts, getLatestPostsPaginated , getPostsByUser ,getMostLikedPosts , getPostById , editPost ,deletePost} from '../controllers/post.controller.js';
import { likePost, unlikePost, getPostLikes } from '../controllers/like.controller.js';
import { verifyToken, verifyLike , checkIsAuthor } from '../middleware/auth.middleware.js';


const router = express.Router();

router.post('/create', verifyToken, createPost);
router.get('', verifyLike,getAllPostsPaginated);
router.get('/latest',verifyLike, getLatestPostsPaginated);
router.get('/author/:userId',verifyLike, getPostsByUser);
router.get("/myposts", verifyToken, getMyPosts);

router.get('/count/:userId', getPostCountByUser);



router.post('/:postId/like', verifyToken, likePost);
router.delete('/:postId/unlike', verifyToken, unlikePost);
router.get('/:postId/likes', getPostLikes);


router.get('/mostliked',verifyLike, getMostLikedPosts);


router.get('/:id',verifyLike, getPostById);
router.put('/:id/edit', verifyToken, editPost);


router.delete('/delete/:postId', verifyToken, deletePost);



export default router;
