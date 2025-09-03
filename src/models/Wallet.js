const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: { type: String, required: true },
    label: { type: String },
    addressType: { type: String },
    bip21: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
