const mongoose = require('mongoose');

const brandingSchema = new mongoose.Schema({
  logo: {
    type: String,
    required: false
  },
  favicon: {
    type: String,
    required: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Static method to get the current branding
brandingSchema.statics.getCurrentBranding = function() {
  return this.findOne().sort({ createdAt: -1 });
};

module.exports = mongoose.model('Branding', brandingSchema);