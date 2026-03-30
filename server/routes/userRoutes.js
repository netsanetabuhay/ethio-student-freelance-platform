import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getCoinBalance
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/coins', protect, getCoinBalance);

export default router;