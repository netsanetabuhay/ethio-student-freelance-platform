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
    
    const chatFee = post.chatFee;
    
    if (initiator.coins < chatFee) {
        throw new Error(`Insufficient coins. Need ${chatFee}, have ${initiator.coins}`);
    }
    
    initiator.coins -= chatFee;
    await initiator.save();
    
    const expiresAt = calculateChatExpiry();
    
    const chatSession = await ChatSession.create({
        postId,
        initiatorId,
        recipientId: post.userId,
        source: 'paid_chat',
        chatFee,
        expiresAt
    });
    
    await CoinTransaction.create({
        userId: initiator._id,
        type: 'chat_payment',
        amount: -chatFee,
        balance: initiator.coins,
        referenceId: chatSession._id,
        description: `Paid chat with post: ${post.title}`
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
    
    if (chatSession.initiatorId.toString() !== userId && 
        chatSession.recipientId.toString() !== userId) {
        throw new Error('You are not part of this chat');
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
    
    return {
        sessions,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};