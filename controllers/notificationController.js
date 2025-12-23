const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private/Admin
// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private/Admin
const getNotifications = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 10;
        const page = Number(req.query.page) || 1;

        const keyword = req.query.search
            ? {
                 $or: [
                    { message: { $regex: req.query.search, $options: 'i' } },
                    { type: { $regex: req.query.search, $options: 'i' } }
                 ]
            }
            : {};

        const count = await Notification.countDocuments({ ...keyword });
        const unreadCount = await Notification.countDocuments({ isRead: false });
        const notifications = await Notification.find({ ...keyword })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .populate('user', 'name phone email image');
        
        res.json({ notifications, page, pages: Math.ceil(count / pageSize), total: count, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching notifications', error: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private/Admin
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating notification', error: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private/Admin
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ isRead: false }, { isRead: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error updating notifications', error: error.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            await notification.deleteOne();
            res.json({ message: 'Notification removed' });
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting notification', error: error.message });
    }
};

// @desc    Delete multiple notifications
// @route   POST /api/notifications/delete-multiple
// @access  Private/Admin
const deleteMultipleNotifications = async (req, res) => {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
        return res.status(400).json({ message: 'No notification IDs provided' });
    }

    try {
        await Notification.deleteMany({
            _id: { $in: ids }
        });
        res.json({ message: 'Notifications removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error deleting notifications', error: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteMultipleNotifications
};
