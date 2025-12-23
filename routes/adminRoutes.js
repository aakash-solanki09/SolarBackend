const express = require('express');
const router = express.Router();
const { getUsers, getUserById, getChatUsers } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/users', protect, admin, getUsers);
router.get('/users/:id', protect, admin, getUserById);
router.get('/chat-users', protect, admin, getChatUsers);

module.exports = router;
