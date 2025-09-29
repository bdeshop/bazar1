const mongoose = require('mongoose');

const IPWhitelistSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
IPWhitelistSchema.index({ ipAddress: 1 });
IPWhitelistSchema.index({ isActive: 1 });

module.exports = mongoose.model('IPWhitelist', IPWhitelistSchema);