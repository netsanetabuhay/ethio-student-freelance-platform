import express from 'express';
import {
    unlock,
    purchase,
    download,
    checkUnlockStatus
} from '../controllers/materialController.js';
import { protect } from '../middleware/auth.js';
import { checkPostExpiry } from '../middleware/checkPostExpiry.js';

const router = express.Router();

// All material routes require authentication
router.use(protect);

// Material routes
router.post('/unlock', unlock);
router.post('/purchase', purchase);
router.get('/check/:postId', checkUnlockStatus);
router.get('/download/:purchaseId', download);

export default router;