const mongoose = require('mongoose');

const SecuritySettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorMethod: {
    type: String,
    enum: ['authenticator', 'sms', 'email', null],
    default: null
  },
  loginAlerts: {
    type: Boolean,
    default: true
  },
  suspiciousActivityAlerts: {
    type: Boolean,
    default: true
  },
  sessionTimeout: {
    type: Number, // in minutes
    default: 60
  },
  maxFailedAttempts: {
    type: Number,
    default: 5
  },
  accountLockoutTime: {
    type: Number, // in minutes
    default: 30
  },
  ipWhitelisting: {
    type: Boolean,
    default: false
  },
  deviceWhitelisting: {
    type: Boolean,
    default: false
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  passwordChangeReminder: {
    type: Boolean,
    default: true
  },
  passwordChangeFrequency: {
    type: Number, // in days
    default: 90
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SecuritySettings', SecuritySettingsSchema);