import multer from 'multer';
import { env } from './env.js';

// Use memory storage (no local files)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type not allowed. Allowed: ${allowedTypes.join(', ')}`), false);
    }
};

// Configure multer
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: env.MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});

// Single file upload middleware
export const uploadSingle = upload.single('file');

// Multiple files upload middleware
export const uploadMultiple = upload.array('files', 5);