const mongoose = require('mongoose');

const LoginLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'unknown'],
    default: 'unknown'
  },
  browser: String,
  os: String,
  location: {
    country: String,
    region: String,
    city: String
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true
  },
  failureReason: {
    type: String,
    enum: ['invalid_password', 'user_not_found', 'account_locked', '2fa_failed', 'ip_blocked', 'other'],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
LoginLogSchema.index({ userId: 1, timestamp: -1 });
LoginLogSchema.index({ ipAddress: 1, timestamp: -1 });
LoginLogSchema.index({ status: 1, timestamp: -1 });

module.exports = mongoose.model('LoginLog', LoginLogSchema);