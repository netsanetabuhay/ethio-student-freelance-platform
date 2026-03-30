import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    initiatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        required: true,
        enum: ['paid_chat', 'material_unlock']
    },
    chatFee: {
        type: Number
    },
    chatEnabled: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

export default ChatSession;