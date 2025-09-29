const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  eventDates: [{
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled'
    }
  }],
  category: {
    type: String,
    default: 'sports'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  image: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ 'eventDates.date': 1 });
eventSchema.index({ status: 1 });

module.exports = mongoose.model('Event', eventSchema);