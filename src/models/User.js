// src/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String }, // ✅ add this
    bitnobCustomerId: { type: String }, // 🔑 Bitnob customer
    bitnobWalletId: { type: String }, // (optional: for wallet later)
    walletId: { type: String }, // ✅ new field
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
