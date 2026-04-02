import express from 'express';
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../utils/upload.js';

const router = express.Router();

// Public routes
router.post('/register', uploadSingle, register);
router.post('/login', login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadSingle, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;