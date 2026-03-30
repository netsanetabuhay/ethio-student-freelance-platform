import cron from 'node-cron';
import Post from '../models/Post.js';
import ChatSession from '../models/ChatSession.js';
import MaterialUnlock from '../models/MaterialUnlock.js';
import Notification from '../models/Notification.js';

// Check and expire posts
export const expirePosts = async () => {
    try {
        const expiredPosts = await Post.find({
            status: 'active',
            expiresAt: { $lte: new Date() }
        });
        
        for (const post of expiredPosts) {
            post.status = 'expired';
            await post.save();
            
            await Notification.create({
                userId: post.userId,
                type: 'post_expired',
                title: 'Post Expired',
                message: `Your post "${post.title}" has expired`,
                relatedId: post._id
            });
        }
        
        if (expiredPosts.length > 0) {
            console.log(`Expired ${expiredPosts.length} posts`);
        }
        
        return expiredPosts.length;
    } catch (error) {
        console.error('Expire posts error:', error);
        return 0;
    }
};

// Check and expire chat sessions
export const expireChatSessions = async () => {
    try {
        const expiredChats = await ChatSession.find({
            expiresAt: { $lte: new Date() }
        });
        
        for (const chat of expiredChats) {
            await Notification.create({
                userId: chat.initiatorId,
                type: 'chat_expiring',
                title: 'Chat Expired',
                message: 'Your chat session has expired',
                relatedId: chat._id
            });
            
            await Notification.create({
                userId: chat.recipientId,
                type: 'chat_expiring',
                title: 'Chat Expired',
                message: 'Your chat session has expired',
                relatedId: chat._id
            });
        }
        
        if (expiredChats.length > 0) {
            console.log(`Processed ${expiredChats.length} expired chats`);
        }
        
        return expiredChats.length;
    } catch (error) {
        console.error('Expire chats error:', error);
        return 0;
    }
};

// Check and expire material unlocks
export const expireMaterialUnlocks = async () => {
    try {
        const expiredUnlocks = await MaterialUnlock.find({
            status: 'active',
            chatExpiresAt: { $lte: new Date() }
        });
        
        for (const unlock of expiredUnlocks) {
            unlock.status = 'expired';
            await unlock.save();
        }
        
        if (expiredUnlocks.length > 0) {
            console.log(`Expired ${expiredUnlocks.length} material unlocks`);
        }
        
        return expiredUnlocks.length;
    } catch (error) {
        console.error('Expire material unlocks error:', error);
        return 0;
    }
};

// Run all expiry checks
export const runAllExpiryChecks = async () => {
    console.log('Running expiry checks...');
    const postsExpired = await expirePosts();
    const chatsExpired = await expireChatSessions();
    const unlocksExpired = await expireMaterialUnlocks();
    console.log(`Expiry complete: ${postsExpired} posts, ${chatsExpired} chats, ${unlocksExpired} unlocks`);
};

// Start cron jobs
export const startExpiryJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        console.log('Running scheduled expiry jobs...');
        await runAllExpiryChecks();
    });
    
    console.log('Expiry jobs started');
};