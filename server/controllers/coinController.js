import {
    buyCoinsValidation,
    getPurchasesValidation
} from '../validation/coinValidation.js';
import {
    buyCoinsRequest,
    getUserPurchaseHistory
} from '../services/coinService.js';
import { getUserCoinBalance } from '../services/userService.js';
import { getUserTransactions, getTransactionSummary } from '../utils/coinTransactions.js';

export const buyCoins = async (req, res) => {
    try {
        const data = req.body;
        
        const { error } = buyCoinsValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const { coinAmount, amountPaid, paymentMethod, accountDetails, transactionId } = data;
        
        const purchase = await buyCoinsRequest(
            req.user.id,
            coinAmount,
            amountPaid,
            paymentMethod,
            accountDetails,
            transactionId
        );
        
        res.status(201).json({
            success: true,
            data: {
                purchase,
                message: 'Your request has been submitted. Admin will verify within 24 hours.'
            }
        });
    } catch (error) {
        console.error('Buy coins error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getBalance = async (req, res) => {
    try {
        const coins = await getUserCoinBalance(req.user.id);
        
        res.json({
            success: true,
            data: { coins }
        });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const getTransactionHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await getUserTransactions(req.user.id, page, limit);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTransactionSummaryStats = async (req, res) => {
    try {
        const summary = await getTransactionSummary(req.user.id);
        
        res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error('Get transaction summary error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyPurchaseHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        
        const result = await getUserPurchaseHistory(req.user.id, page, limit);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get purchase history error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};