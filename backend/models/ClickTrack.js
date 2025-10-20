const mongoose = require('mongoose');

const clickTrackSchema = new mongoose.Schema({
  clickId: {
    type: String,
    required: true,
    unique: true
  },
  affiliate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true
  },
  affiliateCode: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  source: {
    type: String,
    default: 'direct'
  },
  campaign: {
    type: String,
    default: 'general'
  },
  medium: {
    type: String,
    default: 'referral'
  },
  landingPage: {
    type: String,
    default: '/'
  },
  converted: {
    type: Boolean,
    default: false
  },
  convertedAt: {
    type: Date
  },
  conversionValue: {
    type: Number,
    default: 0
  },
  convertedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
clickTrackSchema.index({ affiliateCode: 1, timestamp: -1 });
clickTrackSchema.index({ clickId: 1 });
clickTrackSchema.index({ converted: 1 });

const ClickTrack = mongoose.model('ClickTrack', clickTrackSchema);

module.exports = ClickTrack;