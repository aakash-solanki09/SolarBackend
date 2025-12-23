const User = require('../models/User');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        console.log("Update Profile Request Body:", req.body);
        console.log("Update Profile Request File:", req.file);
        console.log("User ID:", req.user._id);

        const user = await User.findById(req.user._id);

        if (user) {
            console.log("User found:", user.email);

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.password) {
                user.password = req.body.password;
            }

            if (req.file) {
                user.profileImage = `http://localhost:5000/uploads/${req.file.filename}`;
            }

            // Ensure address object exists
            if (!user.address) {
                console.log("Initializing user.address");
                user.address = {};
            }

            // Update address fields if provided
            if (req.body.street !== undefined) user.address.street = req.body.street;
            if (req.body.city !== undefined) user.address.city = req.body.city;
            if (req.body.state !== undefined) user.address.state = req.body.state;
            if (req.body.country !== undefined) user.address.country = req.body.country;
            if (req.body.postalCode !== undefined) user.address.postalCode = req.body.postalCode;
            if (req.body.landmark !== undefined) user.address.landmark = req.body.landmark;

            console.log("Saving user...");
            const updatedUser = await user.save();
            console.log("User saved successfully");

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                image: updatedUser.profileImage,
                address: updatedUser.address
            });
        } else {
            console.log("User not found in DB");
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        res.status(500).json({ message: 'Server Error updating profile', error: error.message });
    }
};

// @desc    Add interested product
// @route   POST /api/users/interest/:productId
// @access  Private
const addInterestedProduct = async (req, res) => {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    if (user) {
        if (!user.interestedProducts.includes(productId)) {
            user.interestedProducts.push(productId);
            await user.save();

            // Create Notification
            try {
                const product = await Product.findById(productId);
                if (product) {
                    await Notification.create({
                        type: 'INTEREST',
                        message: `User ${user.name} is interested in ${product.name}`,
                        user: user._id,
                        relatedId: product._id,
                        isRead: false
                    });
                }
            } catch (error) {
                console.error("Error creating interest notification", error);
            }
        }
        res.json({ message: 'Product added to interested list' });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Get interested products
// @route   GET /api/users/interested-products
// @access  Private
const getInterestedProducts = async (req, res) => {
    const user = await User.findById(req.user._id).populate('interestedProducts');
    if (user) {
        res.json(user.interestedProducts);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    updateUserProfile,
    addInterestedProduct,
    getInterestedProducts
};
