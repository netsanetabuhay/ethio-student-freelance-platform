import {
    startChatValidation,
    sendMessageValidation,
    getMessagesValidation
} from '../validation/chatValidation.js';
import {
    startPaidChat,
    sendMessage,
    getChatMessages,
    getUserChatSessions
} from '../services/chatService.js';
import { checkPostExpiry } from '../middleware/checkPostExpiry.js';

export const startChat = async (req, res) => {
    try {
        const data = req.body;
        
        const { error } = startChatValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const { postId } = data;
        
        // Check if post exists and is active
        const post = await checkPostExpiry(postId);
        
        const chatSession = await startPaidChat(req.user.id, postId);
        
        res.status(201).json({
            success: true,
            data: chatSession
        });
    } catch (error) {
        console.error('Start chat error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const sendChatMessage = async (req, res) => {
    try {
        const { chatSessionId } = req.params;
        const data = req.body;
        
        const { error } = sendMessageValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const { message } = data;
        
        const newMessage = await sendMessage(chatSessionId, req.user.id, message);
        
        res.status(201).json({
            success: true,
            data: newMessage
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { chatSessionId } = req.params;
        const { error, value } = getMessagesValidation(req.query);
        
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const { page, limit } = value;
        
        const result = await getChatMessages(chatSessionId, req.user.id, page, limit);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyChatSessions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await getUserChatSessions(req.user.id, page, limit);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get chat sessions error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};