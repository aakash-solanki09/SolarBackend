const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    capacityKW: {
        type: String,
        required: true
    },
    components: [{
        type: String
    }],
    images: [{
        type: String
    }],
    details: {
        type: Object,
        default: {}
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
