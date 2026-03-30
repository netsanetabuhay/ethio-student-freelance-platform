import Notification from '../models/Notification.js';

export const createNotification = async (userId, type, title, message, relatedId = null) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            title,
            message,
            relatedId
        });
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

export const getUserNotifications = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    
    const [notifications, total] = await Promise.all([
        Notification.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Notification.countDocuments({ userId })
    ]);
    
    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const markAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    if (!notification) {
        throw new Error('Notification not found');
    }
    
    notification.read = true;
    await notification.save();
    
    return notification;
};

export const markAllAsRead = async (userId) => {
    const result = await Notification.updateMany(
        { userId, read: false },
        { read: true }
    );
    
    return result.modifiedCount;
};

export const getUnreadCount = async (userId) => {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
};

export const deleteNotification = async (notificationId, userId) => {
    const notification = await Notification.findOneAndDelete({ _id: notificationId, userId });
    if (!notification) {
        throw new Error('Notification not found');
    }
    
    return notification;
};

export const deleteAllNotifications = async (userId) => {
    const result = await Notification.deleteMany({ userId });
    return result.deletedCount;
};