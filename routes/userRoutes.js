const express = require('express');
const router = express.Router();
const { updateUserProfile, addInterestedProduct, getInterestedProducts } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.put('/profile', protect, upload.single('image'), updateUserProfile);
router.post('/interest/:productId', protect, addInterestedProduct);
router.get('/interested-products', protect, getInterestedProducts);

module.exports = router;
