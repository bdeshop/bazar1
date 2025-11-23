const mongoose = require('mongoose');

const termsHistorySchema = new mongoose.Schema({
  version: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true
});

const termsSchema = new mongoose.Schema({
  currentVersion: {
    type: String,
    required: true,
    default: '1.0'
  },
  title: {
    type: String,
    required: true,
    default: 'Terms and Conditions'
  },
  content: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: String,
    required: true
  },
  history: [termsHistorySchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Terms', termsSchema);