const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { 
    submitContact, 
    getContacts, 
    getContactById, 
    deleteContact 
} = require('../controllers/contactController');

router.post('/', submitContact);
router.get('/', protect, admin, getContacts);
router
    .route('/:id')
    .get(protect, admin, getContactById)
    .delete(protect, admin, deleteContact);

module.exports = router;
