const mongoose = require("mongoose");

const userDataSchema = new mongoose.Schema({
  type: String,
  isRequired: String,
  label: String,
  width: String,
  instruction: String,
});

const DepositmethodSchema = new mongoose.Schema(
  {
    gatewayName: { type: String, required: true },
    currencyName: { type: String, required: true },
    minAmount: { type: String, required: true },
    maxAmount: { type: String, required: true },
    fixedCharge: { type: String, required: true },
    percentCharge: { type: String, required: true },
    rate: { type: String,default:"" },
    depositInstruction: { type: String, required: true },
    accountNumber: { type: String, required: true },
    accountType:{ type: String, required: true },
    image: { type: String },
    userData: [userDataSchema],
    referelcode:{
      type:String,
      default:""
    },
    enabled: { type: Boolean, default: true },  // New status field to enable/disable gateway
    createdbyid:String,
    youtubeLink: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DepsotMethod", DepositmethodSchema);
