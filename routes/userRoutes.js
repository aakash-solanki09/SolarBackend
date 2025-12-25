const express = require('express');
const router = express.Router();
const { updateUserProfile, addInterestedProduct, getInterestedProducts } = require('../controllers/userController');
const { protect, userOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.put('/profile', protect, userOnly, upload.single('image'), updateUserProfile);
router.post('/interest/:productId', protect, userOnly, addInterestedProduct);
router.get('/interested-products', protect, userOnly, getInterestedProducts);

module.exports = router;
