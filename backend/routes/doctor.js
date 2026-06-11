import express from 'express';
import { getAllDoctors, getDoctorById, createDoctor, searchDoctors } from '../controllers/doctorController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllDoctors);
router.get('/search', searchDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.post('/', authenticateToken, createDoctor);

export default router;

