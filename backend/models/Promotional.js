const mongoose = require('mongoose');

const promotionalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  targetUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
promotionalSchema.index({ status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Promotional', promotionalSchema);