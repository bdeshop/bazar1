const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
  type: String,
  isRequired: String,
  label: String,
  width: String,
  instruction: String,
});

const withdrawmethodSchema = new mongoose.Schema(
  {
    gatewayName: { type: String, required: true },
    currencyName: { type: String, required: true },
    minAmount: { type: String, required: true },
    maxAmount: { type: String, required: true },
    fixedCharge: { type: String, required: true },
    percentCharge: { type: String, required: true },
    rate: { type: String,default:"" },
    depositInstruction: { type: String},
    image: { type: String },
    userData: [userDataSchema],
    enabled: { type: Boolean, default: true },  // New status field to enable/disable gateway
    createdbyid:String,
        youtubeLink: { type: String, default: "" },
    referelcode:String,

  },
  {
    timestamps: true,
  }
);
const Withdrawmethod= mongoose.model("Withdrawmethod", withdrawmethodSchema);
module.exports =Withdrawmethod;
