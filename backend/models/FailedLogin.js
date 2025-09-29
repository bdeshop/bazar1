const mongoose = require('mongoose');

const FailedLoginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  attemptCount: {
    type: Number,
    default: 1
  },
  firstAttempt: {
    type: Date,
    default: Date.now
  },
  lastAttempt: {
    type: Date,
    default: Date.now
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  lockedUntil: Date,
  failureReasons: [{
    reason: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Index for faster queries
FailedLoginSchema.index({ username: 1 });
FailedLoginSchema.index({ ipAddress: 1 });
FailedLoginSchema.index({ lastAttempt: -1 });

module.exports = mongoose.model('FailedLogin', FailedLoginSchema);