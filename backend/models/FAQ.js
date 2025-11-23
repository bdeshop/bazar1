const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'account', 'payments', 'shipping', 'returns', 'technical'],
    default: 'general'
  },
  status: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create index for better performance
faqSchema.index({ category: 1, status: 1, order: 1 });

module.exports = mongoose.model('FAQ', faqSchema);