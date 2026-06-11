import express from 'express';
import { createSession, joinSession } from '../controllers/sessionController.js';
import { validateInternalSecret } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply internal secret authentication only to API routes (not public routes like /join/:sessionId)
router.post('/sessions', validateInternalSecret, createSession);
router.post('/sessions/:sessionId/join', validateInternalSecret, joinSession);

export default router;

