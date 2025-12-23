const User = require('../models/User');
const Notification = require('../models/Notification');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (res, userId, role = 'user') => {
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return token;
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    // Check for admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        generateToken(res, 'admin', 'admin');
        return res.json({
            user: {
                _id: 'admin',
                name: 'Admin',
                email: process.env.ADMIN_EMAIL,
                role: 'admin'
            }
        });
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id);
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.profileImage
            }
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone, street, city, state, country, postalCode, landmark } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
    }

    const user = await User.create({
        name,
        email,
        password,
        phone,
        address: { street, city, state, country, postalCode, landmark }
    });

    if (user) {
        // Create Notification
        try {
            await Notification.create({
                type: 'REGISTER',
                message: `New user registered: ${user.name}`,
                user: user._id,
                isRead: false
            });
        } catch (error) {
            console.error("Error creating registration notification", error);
        }

        generateToken(res, user._id);
        res.status(201).json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                image: user.profileImage
            }
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    if (req.user.role === 'admin') {
        return res.json({
            _id: 'admin',
            name: 'Admin',
            email: process.env.ADMIN_EMAIL,
            role: 'admin'
        });
    }

    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.profileImage,
            phone: user.phone,
            address: user.address,
            interestedProducts: user.interestedProducts
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    logoutUser,
    getMe
};
