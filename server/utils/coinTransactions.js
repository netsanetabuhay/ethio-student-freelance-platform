import CoinTransaction from '../models/CoinTransaction.js';
import User from '../models/User.js';

export const createTransaction = async (userId, type, amount, referenceId, description) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const newBalance = user.coins + amount;
    
    const transaction = await CoinTransaction.create({
        userId,
        type,
        amount,
        balance: newBalance,
        referenceId,
        description
    });
    
    return transaction;
};

export const getUserTransactions = async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
        CoinTransaction.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        CoinTransaction.countDocuments({ userId })
    ]);
    
    return {
        transactions,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const getTransactionSummary = async (userId) => {
    const transactions = await CoinTransaction.find({ userId });
    
    const totalEarned = transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalSpent = transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return {
        totalEarned,
        totalSpent,
        transactionCount: transactions.length
    };
};