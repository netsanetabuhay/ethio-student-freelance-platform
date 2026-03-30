import User from '../models/User.js';

export const checkCoins = (requiredCoins) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            if (user.coins < requiredCoins) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient coins. Need ${requiredCoins}, have ${user.coins}`
                });
            }
            
            next();
        } catch (error) {
            console.error('Check coins error:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
};