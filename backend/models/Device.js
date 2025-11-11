const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceName: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    enum: ['desktop', 'mobile', 'tablet', 'other'],
    required: true
  },
  os: {
    type: String,
    required: true
  },
  browser: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  location: {
    country: String,
    region: String,
    city: String
  },
  userAgent: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for user devices
DeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });
DeviceSchema.index({ userId: 1, lastUsed: -1 });

module.exports = mongoose.model('Device', DeviceSchema);