import express from 'express';
import {
    createNewPost,
    getAllPosts,
    getPost,
    getMyPosts
} from '../controllers/postController.js';
import { protect } from '../middleware/auth.js';
import { uploadSingle } from '../utils/upload.js';

const router = express.Router();

router.use(protect);

router.post('/', uploadSingle, createNewPost);
router.get('/', getAllPosts);
router.get('/my-posts', getMyPosts);
router.get('/:id', getPost);

export default router;