import mongoose from 'mongoose';

const coinPurchaseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coinAmount: {
        type: Number,
        required: true,
        min: 1
    },
    amountPaid: {
        type: Number,
        required: true,
        min: 1
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    accountDetails: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'verified', 'rejected']
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    }
}, {
    timestamps: true
});

const CoinPurchase = mongoose.model('CoinPurchase', coinPurchaseSchema);

export default CoinPurchase;