const mongoose = require('mongoose');

const gameCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  image: {
    type: String,
    required: true
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

// Create a compound index for better query performance
gameCategorySchema.index({ status: 1, order: 1 });

module.exports = mongoose.model('GameCategory', gameCategorySchema);