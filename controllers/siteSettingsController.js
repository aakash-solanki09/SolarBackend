const SiteSettings = require('../models/SiteSettings');

// @desc    Get site settings
// @route   GET /api/site-settings
// @access  Public
const getSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update site settings
// @route   PUT /api/site-settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();

    // Update basic fields
    if (req.body.appName) settings.appName = req.body.appName;

    if (req.files) {
      if (req.files.primaryLogo) {
        settings.appLogo.primary = req.files.primaryLogo[0].path;
      }
      if (req.files.secondaryLogo) {
        settings.appLogo.secondary = req.files.secondaryLogo[0].path;
      }
      if (req.files.favicon) {
        settings.appLogo.favicon = req.files.favicon[0].path;
      }
      if (req.files.heroImage) {
        settings.heroImage = req.files.heroImage[0].path;
      }
      if (req.files.sliderImages) {
        // Append new images or replace? For simplicity and typical use, let's append if existing, or just map.
        // If we want to replace the whole set, we should probably clear it first or just overwrite.
        // Let's go with Overwrite/Replace logic for now as it's cleaner for "updating a slider". 
        // User can upload all intended images at once.
        settings.sliderImages = req.files.sliderImages.map(file => file.path);
      }
      if (req.files.contactImage) {
        settings.contactImage = req.files.contactImage[0].path;
      }
      if (req.files.productPageImage) {
        settings.productPageImage = req.files.productPageImage[0].path;
      }
    }

    // Handle Theme Color Updates
    // Expecting req.body.appTheme to be a JSON string if sent with FormData, or object if JSON
    // Since we are uploading files, this is likely FormData. Nested objects in FormData are often sent as stringified JSON or dot notation
    // Let's assume dot notation or we parse logical chunks.
    // Actually, simpler to expect `appTheme` as a JSON string field if mixing with file uploads.
    
    if (req.body.appTheme) {
      let themeData = req.body.appTheme;
      if (typeof themeData === 'string') {
        try {
          themeData = JSON.parse(themeData);
        } catch (e) {
          console.error("Failed to parse appTheme JSON", e);
        }
      }
      
      // Deep merge or specific assignment
      if (themeData.primary) {
        settings.appTheme.primary = { ...settings.appTheme.primary, ...themeData.primary };
      }
      if (themeData.secondary) {
        settings.appTheme.secondary = { ...settings.appTheme.secondary, ...themeData.secondary };
      }
      
      // New Fields
      if (themeData.header) {
         settings.appTheme.header = { ...settings.appTheme.header, ...themeData.header };
      }
      if (themeData.footer) {
         settings.appTheme.footer = { ...settings.appTheme.footer, ...themeData.footer };
      }
      if (themeData.body) {
         settings.appTheme.body = { ...settings.appTheme.body, ...themeData.body };
      }
      if (themeData.card) {
         settings.appTheme.card = { ...settings.appTheme.card, ...themeData.card };
      }
      if (themeData.button) {
         settings.appTheme.button = { ...settings.appTheme.button, ...themeData.button };
      }
      if (themeData.accent) {
         settings.appTheme.accent = { ...settings.appTheme.accent, ...themeData.accent };
      }
    }

    // Handle Hero Text Updates
    if (req.body.heroText) {
        let heroTextData = req.body.heroText;
        if (typeof heroTextData === 'string') {
            try {
                heroTextData = JSON.parse(heroTextData);
            } catch (e) {
                console.error("Failed to parse heroText JSON", e);
            }
        }
        if (heroTextData.topText) settings.heroText.topText = heroTextData.topText;
        if (heroTextData.headline) settings.heroText.headline = heroTextData.headline;
        if (heroTextData.description) settings.heroText.description = heroTextData.description;
    }

    // Handle Company Details Updates
    if (req.body.companyDetails) {
        let companyData = req.body.companyDetails;
        if (typeof companyData === 'string') {
             try {
                companyData = JSON.parse(companyData);
             } catch (e) {
                console.error("Failed to parse companyDetails JSON", e);
             }
        }
        settings.companyDetails = { ...settings.companyDetails, ...companyData };
    }

    // Handle Leadership Updates
    // Leadership data (text) comes as a JSON string or array in body
    if (req.body.leadership) {
        let leadershipData = req.body.leadership;
        if (typeof leadershipData === 'string') {
            try {
                leadershipData = JSON.parse(leadershipData);
            } catch (e) {
                console.error("Failed to parse leadership JSON", e);
                leadershipData = [];
            }
        }

        // We replace the text data found in settings with the new list, 
        // BUT we need to preserve existing images if no new image is uploaded for that index
        // OR handle the Image mapping.
        
        // Actually, easiest way: 
        // The frontend sends the full array of leaders.
        // If an image is changed, frontend sends a file 'leaderImage_INDEX'.
        // If image is unchanged, frontend sends the existing URL in the JSON object or we handle it here.
        
        // Let's iterate through the incoming data and check for file uploads for each index
        const updatedLeadership = leadershipData.map((leader, index) => {
             let imagePath = leader.image || ""; // Keep existing if sent back, or empty
             
             // Check if a new file was uploaded for this index
             const fileField = `leaderImage_${index}`;
             if (req.files && req.files[fileField]) {
                 imagePath = req.files[fileField][0].path;
             }
             
             return {
                 name: leader.name,
                 role: leader.role,
                 phone: leader.phone,
                 image: imagePath
             };
        });
        
        settings.leadership = updatedLeadership;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset site settings to default
// @route   POST /api/site-settings/reset
// @access  Private/Admin
const resetSettings = async (req, res) => {
  try {
    await SiteSettings.deleteMany({});
    const newSettings = await SiteSettings.getSettings();
    res.json(newSettings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};
