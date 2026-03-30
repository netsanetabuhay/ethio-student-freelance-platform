import mongoose from 'mongoose';

const materialPurchaseSchema = new mongoose.Schema({
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
    materialPrice: {
        type: Number,
        required: true
    },
    platformFee: {
        type: Number,
        required: true
    },
    sellerEarnings: {
        type: Number,
        required: true
    },
    downloadUrl: {
        type: String
    },
    downloaded: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        default: 'paid',
        enum: ['paid', 'downloaded']
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

const MaterialPurchase = mongoose.model('MaterialPurchase', materialPurchaseSchema);

export default MaterialPurchase;