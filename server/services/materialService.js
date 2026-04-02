import Post from '../models/Post.js';
import User from '../models/User.js';
import MaterialUnlock from '../models/MaterialUnlock.js';
import MaterialPurchase from '../models/MaterialPurchase.js';
import CoinTransaction from '../models/CoinTransaction.js';
import ChatSession from '../models/ChatSession.js';
import Notification from '../models/Notification.js';
import { env } from '../utils/env.js';
import { calculateChatExpiry } from '../utils/calculateExpiry.js';

export const unlockMaterial = async (buyerId, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }
    
    // ✅ Add post expiry check
    if (post.expiresAt <= new Date()) {
        throw new Error('Post has expired');
    }
    
    if (post.postType !== 'material' && post.postType !== 'both') {
        throw new Error('This post does not offer material');
    }
    
    if (post.status !== 'active') {
        throw new Error('Post is not active');
    }
    
    const existingUnlock = await MaterialUnlock.findOne({ postId, buyerId, status: 'active' });
    if (existingUnlock) {
        throw new Error('Material already unlocked');
    }
    
    const buyer = await User.findById(buyerId);
    if (!buyer) {
        throw new Error('Buyer not found');
    }
    
    const unlockFee = 5;
    
    if (buyer.coins < unlockFee) {
        throw new Error(`Insufficient coins. Need ${unlockFee}, have ${buyer.coins}`);
    }
    
    buyer.coins -= unlockFee;
    await buyer.save();
    
    const chatExpiresAt = calculateChatExpiry();
    
    const materialUnlock = await MaterialUnlock.create({
        postId,
        buyerId,
        sellerId: post.userId,
        unlockFee,
        chatExpiresAt,
        status: 'active'
    });
    
    await CoinTransaction.create({
        userId: buyer._id,
        type: 'material_unlock',
        amount: -unlockFee,
        balance: buyer.coins,
        referenceId: materialUnlock._id,
        description: `Unlocked material: ${post.title}`
    });
    
    await ChatSession.create({
        postId,
        initiatorId: buyerId,
        recipientId: post.userId,
        source: 'material_unlock',
        expiresAt: chatExpiresAt
    });
    
    await Notification.create({
        userId: post.userId,
        type: 'material_unlocked',
        title: 'Material Unlocked',
        message: `${buyer.name} unlocked your material: ${post.title}`,
        relatedId: materialUnlock._id
    });
    
    return materialUnlock;
};

export const purchaseMaterial = async (buyerId, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }
    
    // ✅ Add post expiry check
    if (post.expiresAt <= new Date()) {
        throw new Error('Post has expired');
    }
    
    if (post.postType !== 'material' && post.postType !== 'both') {
        throw new Error('This post does not offer material');
    }
    
    const unlock = await MaterialUnlock.findOne({ postId, buyerId, status: 'active' });
    if (!unlock) {
        throw new Error('You must unlock this material first (pay 5 coins)');
    }
    
    const existingPurchase = await MaterialPurchase.findOne({ postId, buyerId });
    if (existingPurchase) {
        throw new Error('Material already purchased');
    }
    
    const buyer = await User.findById(buyerId);
    if (!buyer) {
        throw new Error('Buyer not found');
    }
    
    const materialPrice = post.materialPrice;
    
    if (buyer.coins < materialPrice) {
        throw new Error(`Insufficient coins. Need ${materialPrice}, have ${buyer.coins}`);
    }
    
    const platformFee = materialPrice * (env.PLATFORM_FEE_PERCENTAGE / 100);
    const sellerEarnings = materialPrice - platformFee;
    
    buyer.coins -= materialPrice;
    await buyer.save();
    
    const seller = await User.findById(post.userId);
    seller.coins += sellerEarnings;
    await seller.save();
    
    const purchase = await MaterialPurchase.create({
        postId,
        buyerId,
        sellerId: post.userId,
        materialPrice,
        platformFee,
        sellerEarnings,
        status: 'paid'
    });
    
    await CoinTransaction.create({
        userId: buyer._id,
        type: 'material_purchase',
        amount: -materialPrice,
        balance: buyer.coins,
        referenceId: purchase._id,
        description: `Purchased material: ${post.title}`
    });
    
    await CoinTransaction.create({
        userId: seller._id,
        type: 'material_purchase',
        amount: sellerEarnings,
        balance: seller.coins,
        referenceId: purchase._id,
        description: `Sold material: ${post.title}`
    });
    
    await CoinTransaction.create({
        userId: seller._id,
        type: 'platform_fee',
        amount: -platformFee,
        balance: seller.coins,
        referenceId: purchase._id,
        description: `Platform fee for material: ${post.title}`
    });
    
    post.downloadCount += 1;
    await post.save();
    
    await Notification.create({
        userId: seller._id,
        type: 'material_purchased',
        title: 'Material Sold',
        message: `${buyer.name} purchased your material: ${post.title}`,
        relatedId: purchase._id
    });
    
    return purchase;
};

export const getDownloadUrl = async (purchaseId, buyerId) => {
    const purchase = await MaterialPurchase.findById(purchaseId).populate('postId');
    if (!purchase) {
        throw new Error('Purchase not found');
    }
    
    if (purchase.buyerId.toString() !== buyerId) {
        throw new Error('Not authorized to download this material');
    }
    
    if (purchase.status === 'paid') {
        purchase.status = 'downloaded';
        purchase.downloaded = true;
        await purchase.save();
    }
    
    return purchase.postId.materialFile;
};

export const checkMaterialUnlock = async (postId, userId) => {
    const unlock = await MaterialUnlock.findOne({ postId, buyerId: userId, status: 'active' });
    return !!unlock;
};

export const hasPurchasedMaterial = async (postId, userId) => {
    const purchase = await MaterialPurchase.findOne({ postId, buyerId: userId });
    return !!purchase;
};