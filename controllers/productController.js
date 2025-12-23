const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ]
        }
        : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, price, description, capacity, components, details } = req.body;

    let imagePaths = [];
    if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
    }

    const product = new Product({
        name,
        price,
        description,
        capacityKW: capacity, // Mapping frontend 'capacity' to model 'capacityKW'
        image: imagePaths.length > 0 ? imagePaths[0] : '', // Main image is the first one
        images: imagePaths,
        components: components ? components.split(',') : [],
        details: details ? JSON.parse(details) : {}
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const { name, price, description, capacity, components, details } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name || product.name;
        product.price = price || product.price;
        product.description = description || product.description;
        product.capacityKW = capacity || product.capacityKW;

        if (components) {
            product.components = components.split(',');
        }

        if (details) {
            product.details = JSON.parse(details);
        }

        if (req.files && req.files.length > 0) {
            const newImagePaths = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
            // Append new images to existing ones. Initialize if undefined.
            product.images = product.images ? [...product.images, ...newImagePaths] : newImagePaths;
            
            // Update main image if legacy image is unset or if we want to reflect the newest change (optional, let's keep first image of array as main)
            // Actually, if we just added images, main image might remain the old one.
            // Ensure product.image matches first image if exists
            if (product.images.length > 0) {
                product.image = product.images[0];
            }
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
