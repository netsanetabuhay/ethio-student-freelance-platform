import {
    createPostValidation,
    getPostsValidation
} from '../validation/postValidation.js';
import {
    createPost,
    getPosts,
    getPostById,
    getUserPosts
} from '../services/postService.js';

export const createNewPost = async (req, res) => {
    try {
        const data = req.body;
        const file = req.file;
        
        const { error } = createPostValidation(data);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const post = await createPost(req.user.id, data, file);
        
        res.status(201).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const { error, value } = getPostsValidation(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }
        
        const result = await getPosts(value);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { post, isOwner } = await getPostById(id, req.user.id);
        
        if (!isOwner && post.postType === 'material') {
            post.materialFile = undefined;
        }
        
        res.json({
            success: true,
            data: {
                post,
                isOwner
            }
        });
    } catch (error) {
        console.error('Get post error:', error);
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await getUserPosts(req.user.id, page, limit);
        
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get my posts error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};