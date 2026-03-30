import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postType: {
        type: String,
        required: true,
        enum: ['tutor', 'material', 'both']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    gradeLevel: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    chatFee: {
        type: Number
    },
    materialPrice: {
        type: Number
    },
    materialFile: {
        type: String
    },
    fileSize: {
        type: Number
    },
    fileType: {
        type: String
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    durationDays: {
        type: Number,
        required: true
    },
    coinPaid: {
        type: Number,
        required: true
    },
    expiresAt: {
        type: Date
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'expired']
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

const Post = mongoose.model('Post', postSchema);

export default Post;