import User from '../models/User.js';
import CoinTransaction from '../models/CoinTransaction.js';
import { env } from '../utils/env.js';
import generateToken from '../utils/generateToken.js';
import {
    registerValidation,
    loginValidation,
    updateProfileValidation,
    changePasswordValidation
} from '../validation/userValidation.js';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changeUserPassword,
    getUserCoinBalance
} from '../services/userService.js';

export const register = async (req, res) => {
    try {
        const data = req.body;

        const { error } = registerValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const { user, token } = await registerUser(data);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    coins: user.coins,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    educationLevel: user.educationLevel,
                    status: user.status
                },
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const dataforlogin = req.body;
        const { error } = loginValidation(dataforlogin);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const { email, password } = dataforlogin;
        const { user, token } = await loginUser(email, password);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    coins: user.coins,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    educationLevel: user.educationLevel,
                    status: user.status
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await getUserProfile(req.user.id);

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const dataforupdate = req.body;
        const { error } = updateProfileValidation(dataforupdate);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const user = await updateUserProfile(req.user.id, dataforupdate);

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                coins: user.coins,
                profilePicture: user.profilePicture,
                bio: user.bio,
                educationLevel: user.educationLevel,
                status: user.status
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const dataforpasswordchange = req.body;
        const { error } = changePasswordValidation(dataforpasswordchange);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const { currentPassword, newPassword } = dataforpasswordchange;
      await changeUserPassword(req.user.id, currentPassword, newPassword);
       res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getCoinBalance = async (req, res) => {
    try {
        const coins = await getUserCoinBalance(req.user.id);

        res.json({
            success: true,
            data: { coins }
        });
    } catch (error) {
        console.error('Get coin balance error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};