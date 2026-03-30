import Post from '../models/Post.js';

export const checkPostExpiry = async (req, res, next) => {
    try {
        const { postId } = req.params;
        
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }
        
        if (post.status === 'expired' || post.expiresAt <= new Date()) {
            post.status = 'expired';
            await post.save();
            
            return res.status(400).json({
                success: false,
                message: 'Post has expired'
            });
        }
        
        req.post = post;
        next();
    } catch (error) {
        console.error('Check post expiry error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};