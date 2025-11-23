const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  method: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  status: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: "pending"
  },
  transactionId: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create index for faster queries
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });

module.exports = mongoose.model("Withdrawal", withdrawalSchema);