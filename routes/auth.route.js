
import express from 'express';
import { login , signup , logout ,getUserByToken, getUserById, getAvatars, getAvatarById, setAvatar, setupProfile} from '../controllers/auth.controller.js';
import { verifyToken ,verifyLike } from '../middleware/auth.middleware.js'; // Adjust the path as necessary



const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.get('/user', verifyToken, getUserByToken);
router.get('/user/:id',verifyLike, getUserById);
router.get('/logout', verifyToken, logout);
router.post('/setup-profile',verifyToken, setupProfile);

router.get('/avatars', getAvatars);
router.get('/avatar/:id', getAvatarById);
router.put('/avatar',verifyToken, setAvatar);

export default router;
