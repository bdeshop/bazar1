const mongoose = require("mongoose");

const gameProviderSchema = new mongoose.Schema(
  {
    name: { type: String, unique: false },
    providerOracleID: { type: String, unique: false },
    category: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    image: { type: String, required: true },
    status: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create index for better performance
gameProviderSchema.index({ name: 1 });
gameProviderSchema.index({ status: 1 });

module.exports = mongoose.model("GameProvider", gameProviderSchema);
