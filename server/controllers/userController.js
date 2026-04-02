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
        const file = req.file;

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

        const { user, token } = await registerUser(data, file);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    coins: user.coins,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    educationLevel: user.educationLevel,
                    status: user.status,
                    role: user.role
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
        const data = req.body;
        const { error } = loginValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const { email, password } = data;
        const { user, token } = await loginUser(email, password);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    coins: user.coins,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    educationLevel: user.educationLevel,
                    status: user.status,
                    role: user.role
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
        const data = req.body;
        const file = req.file;
        
        // Only allow these fields to be updated
        const allowedUpdates = {
            username: data.username,
            firstname: data.firstname,
            lastname: data.lastname,
            bio: data.bio,
            educationLevel: data.educationLevel
        };
        
        // Remove undefined fields
        Object.keys(allowedUpdates).forEach(key => 
            allowedUpdates[key] === undefined && delete allowedUpdates[key]
        );
        
        const { error } = updateProfileValidation(allowedUpdates);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const user = await updateUserProfile(req.user.id, allowedUpdates, file);

        res.json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                coins: user.coins,
                profilePicture: user.profilePicture,
                bio: user.bio,
                educationLevel: user.educationLevel,
                status: user.status,
                role: user.role
            },
            message: 'Profile updated successfully. Coins and role cannot be changed.'
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
        const data = req.body;
        const { error } = changePasswordValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const { currentPassword, newPassword } = data;
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

