import cron from 'node-cron';
import Post from '../models/Post.js';
import ChatSession from '../models/ChatSession.js';
import MaterialUnlock from '../models/MaterialUnlock.js';
import Notification from '../models/Notification.js';

// Run every hour
export const startExpiryJobs = () => {
    
    // Expire posts
    cron.schedule('0 * * * *', async () => {
        console.log('Running post expiry job...');
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
            
            console.log(`Expired ${expiredPosts.length} posts`);
        } catch (error) {
            console.error('Post expiry job error:', error);
        }
    });
    
    // Expire chat sessions
    cron.schedule('* * * * *', async () => {
        console.log('Running chat expiry job...');
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
            
            console.log(`Processed ${expiredChats.length} expired chats`);
        } catch (error) {
            console.error('Chat expiry job error:', error);
        }
    });
    
    // Expire material unlocks
    cron.schedule('* * * * *', async () => {
        console.log('Running material unlock expiry job...');
        try {
            const expiredUnlocks = await MaterialUnlock.find({
                status: 'active',
                chatExpiresAt: { $lte: new Date() }
            });
            
            for (const unlock of expiredUnlocks) {
                unlock.status = 'expired';
                await unlock.save();
            }
            
            console.log(`Expired ${expiredUnlocks.length} material unlocks`);
        } catch (error) {
            console.error('Material unlock expiry job error:', error);
        }
    });
    
    console.log('All expiry jobs started');
};