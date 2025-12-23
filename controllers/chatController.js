const Chat = require('../models/Chat');

// @desc    Get chat messages between user and admin
// @route   GET /api/chat/messages/:userId?
// @access  Private
const getMessages = async (req, res) => {
    let userId;

    // If admin, they can request messages for a specific user via params
    if (req.user.role === 'admin' && req.params.userId) {
        userId = req.params.userId;
    } else {
        // If user, they get their own messages
        userId = req.user._id;
    }

    // Find messages where sender OR receiver is the user
    // Admin messages don't have a specific ID in the DB usually if we use 'admin' string, 
    // but let's assume we store admin messages with a null sender or a specific admin ID.
    // For simplicity, let's query:
    // (sender == userId) OR (receiver == userId)

    const messages = await Chat.find({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    }).sort({ createdAt: 1 });

    res.json(messages);
};

module.exports = { getMessages };
