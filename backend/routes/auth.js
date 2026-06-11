import express from 'express';
import { signup, signin, signout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/signin', signin);

// Protected route (requires authentication)
router.post('/signout', authenticateToken, signout);

export default router;

