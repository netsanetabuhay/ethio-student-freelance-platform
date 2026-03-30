import fs from 'fs';
import path from 'path';
import { env } from './env.js';

// Ensure upload directory exists
export const ensureUploadDir = () => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    return uploadDir;
};

// Get file info
export const getFileInfo = (file) => {
    if (!file) return null;
    
    return {
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        sizeInMB: (file.size / (1024 * 1024)).toFixed(2)
    };
};

// Delete file
export const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
    }
    return false;
};

// Get file extension
export const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

// Validate file size
export const isValidFileSize = (size) => {
    return size <= env.MAX_FILE_SIZE;
};

// Validate file type
export const isValidFileType = (mimetype) => {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');
    return allowedTypes.includes(mimetype);
};