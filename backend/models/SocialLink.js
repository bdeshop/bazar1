const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    enum: [
      'facebook',
      'instagram', 
      'twitter',
      'youtube',
      'pinterest',
      'tiktok',
      'telegram',
      'whatsapp',
      'linkedin',
      'discord',
      'reddit',
      'medium',
      'github',
      'snapchat',
      'viber',
      'wechat',
      'line',
      'skype'
    ]
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  backgroundColor: {
    type: String,
    default: '#6B7280'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  opensInNewTab: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Static method to get default social media configurations
socialLinkSchema.statics.getDefaultConfig = function() {
  return {
    facebook: {
      platform: 'facebook',
      displayName: 'Facebook',
      url: '#',
      backgroundColor: '#1877F2',
      order: 1
    },
    instagram: {
      platform: 'instagram',
      displayName: 'Instagram',
      url: '#',
      backgroundColor: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)',
      order: 2
    },
    twitter: {
      platform: 'twitter',
      displayName: 'Twitter',
      url: '#',
      backgroundColor: '#1DA1F2',
      order: 3
    },
    youtube: {
      platform: 'youtube',
      displayName: 'YouTube',
      url: '#',
      backgroundColor: '#FF0000',
      order: 4
    },
    pinterest: {
      platform: 'pinterest',
      displayName: 'Pinterest',
      url: '#',
      backgroundColor: '#E60023',
      order: 5
    },
    tiktok: {
      platform: 'tiktok',
      displayName: 'TikTok',
      url: '#',
      backgroundColor: '#000000',
      order: 6
    },
    telegram: {
      platform: 'telegram',
      displayName: 'Telegram',
      url: '#',
      backgroundColor: '#0088CC',
      order: 7
    },
    whatsapp: {
      platform: 'whatsapp',
      displayName: 'WhatsApp',
      url: '#',
      backgroundColor: '#25D366',
      order: 8
    }
  };
};

// Static method to initialize default social links
socialLinkSchema.statics.initializeDefaults = async function() {
  const defaultConfig = this.getDefaultConfig();
  const existingLinks = await this.find({});
  
  if (existingLinks.length === 0) {
    const defaultLinks = Object.values(defaultConfig);
    await this.insertMany(defaultLinks);
    console.log('Default social links initialized');
  }
};

module.exports = mongoose.model('SocialLink', socialLinkSchema);