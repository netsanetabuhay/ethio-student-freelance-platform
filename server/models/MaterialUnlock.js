import mongoose from 'mongoose';

const materialUnlockSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    unlockFee: {
        type: Number,
        default: 5
    },
    chatEnabled: {
        type: Boolean,
        default: true
    },
    chatExpiresAt: {
        type: Date,
        required: true
    },
    canBuy: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'expired']
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

const MaterialUnlock = mongoose.model('MaterialUnlock', materialUnlockSchema);

export default MaterialUnlock;