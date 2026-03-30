import mongoose from 'mongoose';

const coinTransactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['registration', 'post_fee', 'chat_payment', 'material_unlock', 'material_purchase', 'platform_fee', 'coin_purchase']
    },
    amount: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

const CoinTransaction = mongoose.model('CoinTransaction', coinTransactionSchema);

export default CoinTransaction;