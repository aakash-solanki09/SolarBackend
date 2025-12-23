const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteMultipleNotifications } = require('../controllers/notificationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getNotifications);
router.put('/:id/read', protect, admin, markAsRead);
router.put('/read-all', protect, admin, markAllAsRead);
router.delete('/:id', protect, admin, deleteNotification);
router.post('/delete-multiple', protect, admin, deleteMultipleNotifications);

module.exports = router;
