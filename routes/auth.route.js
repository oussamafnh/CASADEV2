
import express from 'express';
import { signup } from '../controllers/auth.controller.js';
import express from 'express';
import { googleAuth, googleCallback, googleRedirect, githubAuth, githubCallback, githubRedirect, logout } from './controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);

// Google Authentication Routes
router.get('/auth/google', googleAuth);
router.get('/auth/google/callback', googleCallback, googleRedirect);

// GitHub Authentication Routes
router.get('/auth/github', githubAuth);
router.get('/auth/github/callback', githubCallback, githubRedirect);

// Logout Route
router.get('/auth/logout', logout);

export default router;
