import User from '../models/User.js';
import CoinPurchase from '../models/CoinPurchase.js';
import CoinTransaction from '../models/CoinTransaction.js';
import Notification from '../models/Notification.js';
import { createTransaction } from '../utils/coinTransactions.js';

export const buyCoinsRequest = async (userId, coinAmount, amountPaid, paymentMethod, accountDetails, transactionId) => {

    // Check if transaction ID already exists
    const existingPurchase = await CoinPurchase.findOne({ transactionId });
    if (existingPurchase) {
        throw new Error('Transaction ID already exists. Please check and try again.');
    }

    
    const coinPurchase = await CoinPurchase.create({
       userId: userId,
        coinAmount: coinAmount,
       amountPaid: amountPaid,
        paymentMethod: paymentMethod,
        accountDetails : accountDetails,
        transactionId: transactionId,
        status: 'pending'
    });
    
    // Notify admin (create notification for admin)
    await Notification.create({
        userId: userId,
        type: 'coins_verified',
        title: 'Coin Purchase Request',
        message: `User requested ${coinAmount} coins. Transaction ID: ${transactionId}`,
        relatedId: coinPurchase._id
    });
    
    return coinPurchase;
};

export const verifyCoinPurchase = async (purchaseId, adminId, status, transactionId) => {
    const purchase = await CoinPurchase.findById(purchaseId);
    if (!purchase) {
        throw new Error('Purchase request not found');
    }
    
    if (purchase.status !== 'pending') {
        throw new Error('Purchase already processed');
    }
    
    // ✅ Prevent adding coins if already added
    if (purchase.coinsAdded === true) {
        throw new Error('Coins already added for this purchase');
    }
    
    purchase.status = status;
    purchase.verifiedBy = adminId;
    purchase.verifiedAt = new Date();
    
    if (status === 'verified') {
        if (transactionId) purchase.transactionId = transactionId;
        
        const user = await User.findById(purchase.userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        // ✅ Only add coins if not already added
        if (!purchase.coinsAdded) {
            user.coins = Number(user.coins) + Number(purchase.coinAmount);
            await user.save();
            purchase.coinsAdded = true;
        }
        
        await createTransaction(
            user._id,
            'coin_purchase',
            purchase.coinAmount,
            purchase._id,
            `Purchased ${purchase.coinAmount} coins`
        );
        
        await Notification.create({
            userId: user._id,
            type: 'coins_verified',
            title: 'Coins Added',
            message: `${purchase.coinAmount} coins have been added to your account`,
            relatedId: purchase._id
        });
    }
    
    await purchase.save();
    
    return purchase;
};

// No pagination, user sees own, admin sees all
export const getPendingPurchases = async (userId, role) => {
    // Build query
    let query = { status: 'pending' };
    
    // If not admin, only show user's own pending purchases
    if (role !== 'admin') {
        query.userId = userId;
    }
    
    const purchases = await CoinPurchase.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'username');
    
    return purchases;
};

export const getUserPurchaseHistory = async (userId) => {
    const purchases = await CoinPurchase.find({ userId })
        .sort({ createdAt: -1 });
    
    return purchases;
};

//getuser coin balance
export const getUserCoinBalance = async (userId) => {
    const user = await User.findById(userId).select('coins');
    if (!user) {
        throw new Error('User not found');
    }
    return user.coins;
};