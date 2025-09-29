const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gameId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  portraitImage: {
    type: String,
    required: true
  },
  landscapeImage: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
gameSchema.index({ gameId: 1 });
gameSchema.index({ provider: 1 });
gameSchema.index({ category: 1 });
gameSchema.index({ status: 1 });

module.exports = mongoose.model('Game', gameSchema);