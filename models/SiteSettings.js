const mongoose = require('mongoose');

const themeColorSchema = new mongoose.Schema({
  default: { type: String, required: true },
  active: { type: String, required: true },
  light: { type: String, required: true },
  clarity: { type: String, required: true },
  inverse: { type: String, required: true }
}, { _id: false });

const siteSettingsSchema = new mongoose.Schema({
  appName: {
    type: String,
    default: 'Solar'
  },
  appLogo: {
    primary: { type: String, default: '' },
    secondary: { type: String, default: '' },
    favicon: { type: String, default: '' }
  },
  heroImage: { type: String, default: '' },
  sliderImages: { type: [String], default: [] },
  contactImage: { type: String, default: '' },
  productPageImage: { type: String, default: '' },
  heroText: {
    topText: { type: String, default: 'Central India’s Leading Rooftop Solar Company' },
    headline: { type: String, default: 'Vishwamangal Solar Energy Service' },
    description: { type: String, default: 'Premium On-grid Rooftop Solar Power Plants.\nSite Survey | Installation | Net Metering | After-Sales Service' }
  },
  appTheme: {
    primary: { type: themeColorSchema, default: () => ({
      default: '#2563eb',
      active: '#1d4ed8',
      light: '#dbeafe',
      clarity: 'rgba(37, 99, 235, 0.20)',
      inverse: '#ffffff'
    })},
    secondary: { type: themeColorSchema, default: () => ({
      default: '#f8fafc',
      active: '#f1f5f9',
      light: '#e2e8f0',
      clarity: 'rgba(248, 250, 252, 0.20)',
      inverse: '#0f172a'
    })},
    // New Fields
    header: {
        background: { type: String, default: '#ffffff' },
        text: { type: String, default: '#1f2937' },
        border: { type: String, default: '#e5e7eb' },
        hoverBackground: { type: String, default: '#f3f4f6' },
        hoverText: { type: String, default: '#111827' }
    },
    footer: {
        background: { type: String, default: '#111827' },
        text: { type: String, default: '#f3f4f6' },
        hoverBackground: { type: String, default: '#374151' },
        hoverText: { type: String, default: '#ffffff' }
    },
    body: {
        background: { type: String, default: '#f3f4f6' },
        text: { type: String, default: '#1f2937' }
    },
    card: {
        background: { type: String, default: '#ffffff' },
        text: { type: String, default: '#1f2937' },
        border: { type: String, default: 'transparent' }
    },
    button: {
        background: { type: String, default: '#f59e0b' },
        text: { type: String, default: '#000000' },
        border: { type: String, default: 'transparent' },
        hoverBackground: { type: String, default: '#fbbf24' },
        hoverText: { type: String, default: '#000000' },
        hoverBorder: { type: String, default: 'transparent' }
    },
    accent: {
        color: { type: String, default: '#fcd34d' }
    }
  },
  companyDetails: {
    name: { type: String, default: 'Vishwamangal Solar' },
    address: { type: String, default: '226-B, Prajapat Nagar, Indore – 452009, MP, India' },
    phone: { type: String, default: '+91-9977137348' },
    email: { type: String, default: 'vishwamangalsolar@gmail.com' },
    foundedYear: { type: String, default: '2020' },
    tagline: { type: String, default: 'Central India’s leading Rooftop Solar Company.' }
  },
  leadership: [{
    name: { type: String },
    role: { type: String },
    phone: { type: String },
    image: { type: String }
  }]
}, {
  timestamps: true
});

// Ensure only one settings document exists
siteSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

module.exports = SiteSettings;
