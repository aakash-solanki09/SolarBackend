const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['REGISTER', 'INTEREST', 'MESSAGE', 'CONTACT'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional, as contact forms might be from guests (though we can store their details in message or separate fields, keeping it flexible)
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId, // Could be Product ID, User ID (for register), etc.
        required: false
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
