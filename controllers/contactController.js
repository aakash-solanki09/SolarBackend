const Contact = require('../models/Contact');
const Notification = require('../models/Notification');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    const { name, email, phone, message } = req.body;

    const contact = await Contact.create({
        name,
        email,
        phone,
        message
    });

    try {
        await Notification.create({
            type: 'CONTACT',
            message: `New contact inquiry from ${name}`,
            user: null, // Public form
            isRead: false
        });
    } catch (error) {
        console.error("Error creating contact notification", error);
    }

    res.status(201).json(contact);
};

// @desc    Get all contacts (Admin)
// @route   GET /api/contact
// @access  Private/Admin
const getContacts = async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = search
        ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } },
            ],
        }
        : {};

    const count = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
        .limit(limit)
        .skip(limit * (page - 1))
        .sort({ createdAt: -1 });

    res.json({
        contacts,
        page,
        pages: Math.ceil(count / limit),
        total: count,
    });
};

// @desc    Get contact by ID
// @route   GET /api/contact/:id
// @access  Private/Admin
const getContactById = async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
        res.json(contact);
    } else {
        res.status(404);
        throw new Error('Contact inquiry not found');
    }
};

// @desc    Delete contact
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    const contact = await Contact.findById(req.params.id);

    if (contact) {
        await contact.deleteOne();
        res.json({ message: 'Contact inquiry removed' });
    } else {
        res.status(404);
        throw new Error('Contact inquiry not found');
    }
};

module.exports = { submitContact, getContacts, getContactById, deleteContact };
