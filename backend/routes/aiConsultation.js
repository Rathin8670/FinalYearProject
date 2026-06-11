import express from 'express';
import { startAiConsultation } from '../controllers/aiConsultationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/start', authenticateToken, startAiConsultation);

export default router;
