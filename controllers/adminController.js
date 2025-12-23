const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { phone: { $regex: req.query.search, $options: 'i' } }
            ]
        }
        : {};

    const count = await User.countDocuments({ ...keyword, role: 'user' });
    const users = await User.find({ ...keyword, role: 'user' })
        .select('-password')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password').populate('interestedProducts');
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get users who have chatted
// @route   GET /api/admin/chat-users
// @access  Private/Admin
const getChatUsers = async (req, res) => {
    // This is a simplified way. In a real app, you'd query the Chat collection for distinct sender IDs
    // For now, let's just return all users, or we could aggregate from Chat
    const users = await User.find({ role: 'user' }).select('name email');
    res.json(users);
};

module.exports = {
    getUsers,
    getUserById,
    getChatUsers
};
