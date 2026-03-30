import User from '../models/User.js';
import Post from '../models/Post.js';
import CoinPurchase from '../models/CoinPurchase.js';
import {
    verifyCoinPurchase,
    getPendingPurchases
} from '../services/coinService.js';
import { verifyCoinPurchaseValidation } from '../validation/coinValidation.js';

export const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const [users, total] = await Promise.all([
            User.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments()
        ]);
        
        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const suspendUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        user.status = 'suspended';
        await user.save();
        
        res.json({
            success: true,
            message: 'User suspended successfully'
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const activateUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        user.status = 'active';
        await user.save();
        
        res.json({
            success: true,
            message: 'User activated successfully'
        });
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPendingCoinPurchases = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await getPendingPurchases(page, limit);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get pending purchases error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyCoinPurchaseRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        const { error } = verifyCoinPurchaseValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const { status, transactionId } = data;
        
        const purchase = await verifyCoinPurchase(id, req.user.id, status, transactionId);
        
        res.json({
            success: true,
            data: purchase,
            message: `Purchase ${status} successfully`
        });
    } catch (error) {
        console.error('Verify purchase error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const [posts, total] = await Promise.all([
            Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
            Post.countDocuments()
        ]);
        
        res.json({
            success: true,
            data: {
                posts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error('Get all posts error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        await post.deleteOne();
        
        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPlatformStats = async (req, res) => {
    try {
        const [
            totalUsers,
            activeUsers,
            totalPosts,
            activePosts,
            totalCoinPurchases,
            totalTransactions
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ status: 'active' }),
            Post.countDocuments(),
            Post.countDocuments({ status: 'active', expiresAt: { $gt: new Date() } }),
            CoinPurchase.countDocuments({ status: 'verified' }),
            CoinPurchase.aggregate([
                { $match: { status: 'verified' } },
                { $group: { _id: null, totalCoins: { $sum: '$coinAmount' }, totalMoney: { $sum: '$amountPaid' } } }
            ])
        ]);
        
        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers
                },
                posts: {
                    total: totalPosts,
                    active: activePosts
                },
                coins: {
                    totalPurchased: totalCoinPurchases[0]?.totalCoins || 0,
                    totalRevenue: totalCoinPurchases[0]?.totalMoney || 0
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};