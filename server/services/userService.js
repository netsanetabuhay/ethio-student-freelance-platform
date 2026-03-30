import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { env } from '../utils/env.js';

export const registerUser = async (userData) => {
    const { name, email, password, educationLevel, bio } = userData;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        educationLevel,
        bio,
        coins: env.REGISTRATION_BONUS
    });
    
    await CoinTransaction.create({
        userId: user._id,
        type: 'registration',
        amount: env.REGISTRATION_BONUS,
        balance: env.REGISTRATION_BONUS,
        referenceId: user._id,
        description: 'Registration bonus'
    });
    
    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
    });
    
    return { user, token };
};

export const loginUser = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new Error('Invalid credentials');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    
    if (user.status === 'suspended') {
        throw new Error('Account suspended. Contact admin.');
    }
    
    const token = jwt.sign({ id: user._id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN
    });
    
    return { user, token };
};

export const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password');
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};

export const updateUserProfile = async (userId, updateData) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    
    const { name, profilePicture, bio, educationLevel } = updateData;
    
    if (name) user.name = name;
    if (profilePicture) user.profilePicture = profilePicture;
    if (bio) user.bio = bio;
    if (educationLevel) user.educationLevel = educationLevel;
    
    await user.save();
    return user;
};

export const changeUserPassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new Error('User not found');
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new Error('Current password is incorrect');
    }
    
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    return true;
};

export const getUserCoinBalance = async (userId) => {
    const user = await User.findById(userId).select('coins');
    if (!user) {
        throw new Error('User not found');
    }
    return user.coins;
};