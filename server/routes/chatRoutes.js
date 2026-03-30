import express from 'express';
import {
    startChat,
    sendChatMessage,
    getMessages,
    getMyChatSessions
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';
import { checkChatExpiry } from '../middleware/checkChatExpiry.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Chat session routes
router.post('/start', startChat);
router.get('/sessions', getMyChatSessions);

// Message routes
router.post('/:chatSessionId/messages', sendChatMessage);
router.get('/:chatSessionId/messages', checkChatExpiry, getMessages);

export default router;