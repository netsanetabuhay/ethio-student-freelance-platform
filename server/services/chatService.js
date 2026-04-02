import ChatSession from '../models/ChatSession.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import CoinTransaction from '../models/CoinTransaction.js';
import Notification from '../models/Notification.js';
import { calculateChatExpiry } from '../utils/calculateExpiry.js';

export const startPaidChat = async (initiatorId, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }
    
    // Check post expiry
    if (post.expiresAt <= new Date()) {
        throw new Error('Post has expired');
    }
    
    if (post.postType !== 'tutor' && post.postType !== 'both') {
        throw new Error('This post does not offer tutoring');
    }
    
    if (post.status !== 'active') {
        throw new Error('Post is not active');
    }
    
    if (post.userId.toString() === initiatorId) {
        throw new Error('You cannot chat with yourself');
    }
    
    const initiator = await User.findById(initiatorId);
    if (!initiator) {
        throw new Error('User not found');
    }
    
    // Calculate total chat fee
    const systemFee = 5; // Fixed system fee
    const posterChatFee = post.chatFee || 0;
    const totalFee = systemFee + posterChatFee;
    
    if (initiator.coins < totalFee) {
        throw new Error(`Insufficient coins. Need ${totalFee}, have ${initiator.coins}`);
    }
    
    // Deduct total fee from initiator
    initiator.coins -= totalFee;
    await initiator.save();
    
    const expiresAt = calculateChatExpiry();
    
    const chatSession = await ChatSession.create({
        postId,
        initiatorId,
        recipientId: post.userId,
        source: 'paid_chat',
        chatFee: totalFee,
        expiresAt
    });
    
    // Record transaction for total fee
    await CoinTransaction.create({
        userId: initiator._id,
        type: 'chat_payment',
        amount: -totalFee,
        balance: initiator.coins,
        referenceId: chatSession._id,
        description: `Chat payment: ${systemFee} (system) + ${posterChatFee} (poster fee) for post: ${post.title}`
    });
    
    await Notification.create({
        userId: post.userId,
        type: 'chat_started',
        title: 'New Chat Request',
        message: `${initiator.name} wants to chat about your post: ${post.title}`,
        relatedId: chatSession._id
    });
    
    return chatSession;
};

export const sendMessage = async (chatSessionId, senderId, messageText) => {
    const chatSession = await ChatSession.findById(chatSessionId);
    if (!chatSession) {
        throw new Error('Chat session not found');
    }
    
    if (chatSession.expiresAt <= new Date()) {
        throw new Error('Chat session has expired');
    }
    
    if (chatSession.initiatorId.toString() !== senderId && 
        chatSession.recipientId.toString() !== senderId) {
        throw new Error('You are not part of this chat');
    }
    
    const message = await Message.create({
        chatSessionId,
        senderId,
        message: messageText
    });
    
    const recipientId = chatSession.initiatorId.toString() === senderId 
        ? chatSession.recipientId 
        : chatSession.initiatorId;
    
    await Notification.create({
        userId: recipientId,
        type: 'chat_started',
        title: 'New Message',
        message: `You have a new message in chat`,
        relatedId: chatSessionId
    });
    
    return message;
};

export const getChatMessages = async (chatSessionId, userId, page = 1, limit = 50) => {
    const chatSession = await ChatSession.findById(chatSessionId);
    if (!chatSession) {
        throw new Error('Chat session not found');
    }
    
    // Check if user is part of this chat
    if (chatSession.initiatorId.toString() !== userId && 
        chatSession.recipientId.toString() !== userId) {
        throw new Error('You are not part of this chat');
    }
    
    // Check if chat is expired
    const isExpired = chatSession.expiresAt <= new Date();
    
    if (isExpired) {
        throw new Error('Chat session has expired. Pay unlock fee to view history.');
    }
    
    const skip = (page - 1) * limit;
    
    const [messages, total] = await Promise.all([
        Message.find({ chatSessionId })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit),
        Message.countDocuments({ chatSessionId })
    ]);
    
    await Message.updateMany(
        { chatSessionId, senderId: { $ne: userId }, read: false },
        { read: true }
    );
    
    return {
        messages,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const getUserChatSessions = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    
    const [sessions, total] = await Promise.all([
        ChatSession.find({
            $or: [
                { initiatorId: userId },
                { recipientId: userId }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('postId', 'title')
            .populate('initiatorId', 'name profilePicture')
            .populate('recipientId', 'name profilePicture'),
        ChatSession.countDocuments({
            $or: [
                { initiatorId: userId },
                { recipientId: userId }
            ]
        })
    ]);
    
    // Mark expired sessions
    const now = new Date();
    const sessionsWithStatus = sessions.map(session => {
        const sessionObj = session.toObject();
        sessionObj.isExpired = session.expiresAt <= now;
        return sessionObj;
    });
    
    return {
        sessions: sessionsWithStatus,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// New function to unlock expired chat history
export const unlockExpiredChat = async (userId, chatSessionId) => {
    const chatSession = await ChatSession.findById(chatSessionId);
    if (!chatSession) {
        throw new Error('Chat session not found');
    }
    
    // Check if user is part of this chat
    if (chatSession.initiatorId.toString() !== userId && 
        chatSession.recipientId.toString() !== userId) {
        throw new Error('You are not part of this chat');
    }
    
    // Check if chat is already active
    if (chatSession.expiresAt > new Date()) {
        throw new Error('Chat session is still active');
    }
    
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const unlockFee = 5;
    
    if (user.coins < unlockFee) {
        throw new Error(`Insufficient coins. Need ${unlockFee}, have ${user.coins}`);
    }
    
    user.coins -= unlockFee;
    await user.save();
    
    // Extend chat expiry by 24 hours
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + 24);
    chatSession.expiresAt = newExpiry;
    await chatSession.save();
    
    await CoinTransaction.create({
        userId: user._id,
        type: 'chat_unlock',
        amount: -unlockFee,
        balance: user.coins,
        referenceId: chatSession._id,
        description: `Unlocked expired chat history`
    });
    
    return chatSession;
};