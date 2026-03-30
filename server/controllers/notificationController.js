import {
    getUserNotifications as getUserNotificationsService,
    markAsRead as markAsReadService,
    markAllAsRead as markAllAsReadService,
    getUnreadCount as getUnreadCountService,
    deleteNotification as deleteNotificationService,
    deleteAllNotifications as deleteAllNotificationsService
} from '../services/notificationService.js';

export const getMyNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await getUserNotificationsService(req.user.id, page, limit);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        
        const notification = await markAsReadService(id, req.user.id);
        
        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {
        const count = await markAllAsReadService(req.user.id);
        
        res.json({
            success: true,
            data: { count },
            message: `${count} notifications marked as read`
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await getUnreadCountService(req.user.id);
        
        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        
        await deleteNotificationService(id, req.user.id);
        
        res.json({
            success: true,
            message: 'Notification deleted successfully'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteAllNotifications = async (req, res) => {
    try {
        const count = await deleteAllNotificationsService(req.user.id);
        
        res.json({
            success: true,
            data: { count },
            message: `${count} notifications deleted`
        });
    } catch (error) {
        console.error('Delete all notifications error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
