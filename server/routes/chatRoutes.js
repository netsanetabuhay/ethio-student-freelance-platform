import express from 'express';
import {
    startChat,
    sendChatMessage,
    getMessages,
    getMyChatSessions,
    unlockChatHistory
} from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Chat session routes
router.post('/start', startChat);
router.get('/sessions', getMyChatSessions);
router.post('/unlock/:chatSessionId', unlockChatHistory);

// Message routes
router.post('/:chatSessionId/messages', sendChatMessage);
router.get('/:chatSessionId/messages', getMessages);

export default router;