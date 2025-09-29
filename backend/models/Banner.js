const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
    default: 'Banner'
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
bannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Banner', bannerSchema);