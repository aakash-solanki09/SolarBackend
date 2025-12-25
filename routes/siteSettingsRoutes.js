const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, resetSettings } = require('../controllers/siteSettingsController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

router.get('/', (req, res, next) => {

  next();
}, getSettings);

router.put('/', protect, admin, upload.fields([
  { name: 'primaryLogo', maxCount: 1 },
  { name: 'secondaryLogo', maxCount: 1 },
  { name: 'favicon', maxCount: 1 },
  { name: 'heroImage', maxCount: 1 },
  { name: 'sliderImages', maxCount: 10 },
  { name: 'contactImage', maxCount: 1 },
  { name: 'productPageImage', maxCount: 1 },
  { name: 'leaderImage_0', maxCount: 1 },
  { name: 'leaderImage_1', maxCount: 1 },
  { name: 'leaderImage_2', maxCount: 1 },
  { name: 'leaderImage_3', maxCount: 1 },
  { name: 'leaderImage_4', maxCount: 1 },
  { name: 'leaderImage_5', maxCount: 1 },
  { name: 'leaderImage_6', maxCount: 1 },
  { name: 'leaderImage_7', maxCount: 1 },
  { name: 'leaderImage_8', maxCount: 1 },
  { name: 'leaderImage_9', maxCount: 1 }
]), updateSettings);

router.post('/reset', protect, admin, resetSettings);

module.exports = router;
