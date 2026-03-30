import multer from 'multer';
import path from 'path';
import { env } from '../utils/env.js';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');
    const fileType = file.mimetype;
    
    if (allowedTypes.includes(fileType)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`), false);
    }
};

// Configure upload
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: env.MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});

// Single file upload
export const uploadSingle = upload.single('file');

// Multiple files upload
export const uploadMultiple = upload.array('files', 5);