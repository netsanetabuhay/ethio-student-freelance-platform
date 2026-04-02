import Post from '../models/Post.js';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { env } from '../utils/env.js';
import { calculateExpiry } from '../utils/calculateExpiry.js';
import { uploadMaterial } from '../utils/cloudinary.js';

export const createPost = async (userId, postData, file) => {
    const { 
        postType, 
        title, 
        description, 
        subject, 
        gradeLevel, 
        location, 
        chatFee, 
        materialPrice,
        durationDays 
    } = postData;
    
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const coinCost = parseInt(durationDays);
    
    if (user.coins < coinCost) {
        throw new Error(`Insufficient coins. Need ${coinCost}, have ${user.coins}`);
    }
    
    const expiresAt = calculateExpiry(durationDays);
    
    let materialFile = '';
    let fileSize = 0;
    let fileType = '';
    
    // Upload material file to Cloudinary if provided
    if (file && (postType === 'material' || postType === 'both')) {
        try {
            const uploadResult = await uploadMaterial(file.buffer, `temp_${Date.now()}`, file.originalname);
            materialFile = uploadResult.url;
            fileSize = uploadResult.size;
            fileType = uploadResult.format;
        } catch (error) {
            console.error('Material file upload error:', error);
            throw new Error('Failed to upload material file');
        }
    }
    
    const post = await Post.create({
        userId,
        postType,
        title,
        description,
        subject,
        gradeLevel: gradeLevel || '',
        location,
        chatFee: (postType === 'tutor' || postType === 'both') ? chatFee : undefined,
        materialPrice: (postType === 'material' || postType === 'both') ? materialPrice : undefined,
        materialFile,
        fileSize,
        fileType,
        durationDays,
        coinPaid: coinCost,
        expiresAt
    });
    
    user.coins -= coinCost;
    await user.save();
    
    await CoinTransaction.create({
        userId: user._id,
        type: 'post_fee',
        amount: -coinCost,
        balance: user.coins,
        referenceId: post._id,
        description: `Post created: ${title} (${durationDays} days)`
    });
    
    return post;
};

export const getPosts = async (filters) => {
    const { postType, subject, gradeLevel, search, page, limit, sort } = filters;
    
    const query = { status: 'active', expiresAt: { $gt: new Date() } };
    
    if (postType) query.postType = postType;
    if (subject) query.subject = { $regex: subject, $options: 'i' };
    if (gradeLevel) query.gradeLevel = { $regex: gradeLevel, $options: 'i' };
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }
    
    let sortOption = {};
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
        Post.find(query).sort(sortOption).skip(skip).limit(limit).populate('userId', 'name profilePicture'),
        Post.countDocuments(query)
    ]);
    
    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const getPostById = async (postId, userId) => {
    const post = await Post.findById(postId).populate('userId', 'name profilePicture bio educationLevel');
    
    if (!post) {
        throw new Error('Post not found');
    }
    
    const isOwner = post.userId._id.toString() === userId;
    
    return { post, isOwner };
};

export const getUserPosts = async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
        Post.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Post.countDocuments({ userId })
    ]);
    
    return {
        posts,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

export const checkPostExpiry = async (postId) => {
    const post = await Post.findById(postId);
    if (!post) {
        throw new Error('Post not found');
    }
    
    if (post.expiresAt <= new Date()) {
        post.status = 'expired';
        await post.save();
        throw new Error('Post has expired');
    }
    
    return post;
};