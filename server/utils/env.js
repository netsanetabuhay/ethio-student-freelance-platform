import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // MONGO DB CONNECTION STRING
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/yourdbname',
    
    // JWT CONFIG
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    // File Upload
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || 5 * 1024 * 1024,
    ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,application/pdf',
    
    // Platform Settings
    PLATFORM_NAME: process.env.PLATFORM_NAME || 'Ethio Student Freelance Platform',
    REGISTRATION_BONUS: process.env.REGISTRATION_BONUS || 30,
    MIN_POST_DAYS: process.env.MIN_POST_DAYS || 5,
    CHAT_DURATION_HOURS: process.env.CHAT_DURATION_HOURS || 24,
    PLATFORM_FEE_PERCENTAGE: process.env.PLATFORM_FEE_PERCENTAGE || 1,
    
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    
    // ADMIN
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_PHONE: process.env.ADMIN_PHONE,
    
    // FRONTEND URL
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};