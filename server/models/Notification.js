import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'post_created',
            'chat_started',
            'chat_expiring',
            'material_unlocked',
            'material_purchased',
            'coins_verified',
            'post_expired'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: { createdAt: true, updatedAt: false }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;