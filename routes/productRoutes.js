const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.array('images'), createProduct);

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, upload.array('images'), updateProduct)
    .delete(protect, admin, deleteProduct);

module.exports = router;
