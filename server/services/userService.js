import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { env } from '../utils/env.js';
import { uploadProfilePicture } from '../utils/cloudinary.js';

export const registerUser = async (userData, file) => {
    const { username, firstname, lastname, email, password, educationLevel, bio } = userData;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered');
    }
    const existingUsername = await User.findOne({ username });
     if (existingUsername) {
       throw new Error('Username already taken');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    let profilePicture = '';
    
    // Upload profile picture if provided
    if (file) {
        try {
            profilePicture = await uploadProfilePicture(file.buffer, `temp_${Date.now()}`);
        } catch (error) {
            console.error('Profile picture upload error:', error);
        }
    }
    
    const user = await User.create({
       username,
       firstname,
       lastname,
        email,
        password: hashedPassword,
        educationLevel: educationLevel || '',
        bio: bio || '',
        profilePicture,
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

    return { user};
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

export const updateUserProfile = async (userId, updateData, file) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    const isexistingUsername= await User.findOne({ username: updateData.username });
    if (isexistingUsername && isexistingUsername._id.toString() !== userId) {
        throw new Error('Username already taken');
    }

    const { username, firstname, lastname, bio, educationLevel } = updateData;
    
    if (username) user.username = username;
    if (firstname) user.firstname = firstname;
    if (lastname) user.lastname = lastname;
    if (bio) user.bio = bio;
    if (educationLevel) user.educationLevel = educationLevel;
    
    // Upload new profile picture if provided
    if (file) {
        try {
            user.profilePicture = await uploadProfilePicture(file.buffer, userId);
        } catch (error) {
            console.error('Profile picture update error:', error);
        }
    }
    
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

