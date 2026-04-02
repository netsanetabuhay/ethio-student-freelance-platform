import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

// Configure Cloudinary
cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET
});

// Upload file to Cloudinary
export const uploadFile = async (fileBuffer, options = {}) => {
    try {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: options.folder || 'ethio-freelance',
                    resource_type: 'auto',
                    ...options
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(fileBuffer);
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('File upload failed');
    }
};

// Upload profile picture
export const uploadProfilePicture = async (fileBuffer, userId) => {
    const result = await uploadFile(fileBuffer, {
        folder: 'ethio-freelance/profiles',
        public_id: `user_${userId}`,
        transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' },
            { quality: 'auto' }
        ]
    });
    return result.secure_url;
};

// Upload material file (PDF, document, etc.)
export const uploadMaterial = async (fileBuffer, postId, originalName) => {
    const result = await uploadFile(fileBuffer, {
        folder: 'ethio-freelance/materials',
        public_id: `material_${postId}`,
        resource_type: 'auto',
        use_filename: true,
        filename_override: originalName
    });
    return {
        url: result.secure_url,
        size: (result.bytes / (1024 * 1024)).toFixed(2),
        format: result.format || result.resource_type
    };
};

// Delete file from Cloudinary
export const deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('File delete failed');
    }
};

export default cloudinary;