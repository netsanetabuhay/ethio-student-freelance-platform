import ChatSession from '../models/ChatSession.js';

export const checkChatExpiry = async (req, res, next) => {
    try {
        const { chatSessionId } = req.params;
        
        const chatSession = await ChatSession.findById(chatSessionId);
        
        if (!chatSession) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found'
            });
        }
        
        if (chatSession.expiresAt <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Chat session has expired (24 hours limit)'
            });
        }
        
        req.chatSession = chatSession;
        next();
    } catch (error) {
        console.error('Check chat expiry error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};