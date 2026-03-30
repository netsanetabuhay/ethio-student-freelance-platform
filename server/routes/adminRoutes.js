import express from 'express';
import {
    getAllUsers,
    getUserById,
    suspendUser,
    activateUser,
    getPendingCoinPurchases,
    verifyCoinPurchaseRequest,
    getAllPosts,
    deletePost,
    getPlatformStats
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/activate', activateUser);

// Coin purchase management
router.get('/coin-purchases/pending', getPendingCoinPurchases);
router.put('/coin-purchases/:id/verify', verifyCoinPurchaseRequest);

// Post management
router.get('/posts', getAllPosts);
router.delete('/posts/:id', deletePost);

// Statistics
router.get('/stats', getPlatformStats);

export default router;