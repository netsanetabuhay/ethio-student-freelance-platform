import express from 'express';
import {
    buyCoins,
    getBalance,
    getTransactionHistory,
    getTransactionSummaryStats,
    getMyPurchaseHistory,
    getMyPendingPurchases
} from '../controllers/coinController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All coin routes require authentication
router.use(protect);

// Coin routes
router.get('/balance', getBalance);
router.post('/buy', buyCoins);
router.get('/transactions', getTransactionHistory);
router.get('/transactions/summary', getTransactionSummaryStats);
router.get('/purchases', getMyPurchaseHistory);
router.get('/purchases/pending', getMyPendingPurchases);  // User sees only their own pending

export default router;