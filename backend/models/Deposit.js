const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'bonus'],
    required: true
  },
  method: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled',"rejected"],
    default: 'pending'
  },
  phoneNumber: {
    type: String,
    required: function() {
      return ['bkash', 'nagad', 'rocket', 'upay'].includes(this.method);
    }
  },
  transactionId: {
    type: String,
    required: function() {
      return ['bank', 'card'].includes(this.method);
    }
  },
  description: String,
  processedAt: Date
}, {
  timestamps: true
});

// Add index for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });
const Deposit=mongoose.model('Deposit', transactionSchema);
module.exports = Deposit;