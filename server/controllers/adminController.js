import User from '../models/User.js';
import Post from '../models/Post.js';
import CoinPurchase from '../models/CoinPurchase.js';
import CoinTransaction from '../models/CoinTransaction.js';
import Notification from '../models/Notification.js';
import {
    verifyCoinPurchase,
    getPendingPurchases
} from '../services/coinService.js';
import { verifyCoinPurchaseValidation } from '../validation/coinValidation.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        res.json({
            success: true,
            message: 'Users retrieved successfully',
            data: users
        });
    } catch (error) {
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
            message: 'User retrieved successfully',
            data: user
        });
    } catch (error) {
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
            message: 'User suspended successfully',
            data: { id: user._id, status: user.status }
        });
    } catch (error) {
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
            message: 'User activated successfully',
            data: { id: user._id, status: user.status }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPendingCoinPurchases = async (req, res) => {
    try {
        console.log(req.user.id);
        const purchases = await getPendingPurchases(req.user.id, req.user.role);
        
        res.json({
            success: true,
            message: 'Pending purchases retrieved successfully',
            data: purchases
        });
    } catch (error) {
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
                message: error.details[0].message
            });
        }
        
        const { status, transactionId } = data;
        
        const purchase = await verifyCoinPurchase(id, req.user.id, status, transactionId);
        
        res.json({
            success: true,
            message: `Purchase ${status} successfully`,
            data: purchase
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate('userId', 'name email');
        
        res.json({
            success: true,
            message: 'Posts retrieved successfully',
            data: posts
        });
    } catch (error) {
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
            message: 'Post deleted successfully',
            data: { id: post._id }
        });
    } catch (error) {
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
            message: 'Platform statistics retrieved successfully',
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
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};