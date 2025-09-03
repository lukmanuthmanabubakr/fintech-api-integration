const bitnobAPI = require("../config/bitnob");
const Wallet = require("../models/Wallet");

exports.generateAddress = async (req, res, next) => {
  try {
    const { label, amount } = req.body;
    const customerEmail = req.user.email;

    // ✅ Check if user already has a wallet
    const existingWallet = await Wallet.findOne({ user: req.user._id });
    if (existingWallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet address already exists for this user",
        wallet: existingWallet,
      });
    }

    // Generate new address from Bitnob
    const response = await bitnobAPI.post("/addresses/generate", {
      label: label || "Default Label",
      customerEmail,
      formatType: "bip21",
      amount: amount || "string",
    });

    const addressData = response?.data?.data;

    if (!addressData) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate address",
        raw: response.data,
      });
    }

    // ✅ Save wallet in MongoDB
    const wallet = await Wallet.create({
      user: req.user._id,
      address: addressData.address,
      label: addressData.label,
      addressType: addressData.addressType,
      bip21: addressData.bip21,
    });

    res.status(200).json({
      success: true,
      message: "Address successfully generated and saved",
      wallet,
    });
  } catch (err) {
    next(err);
  }
};




// ✅ List all addresses from Bitnob
exports.listAddresses = async (req, res, next) => {
  try {
    const response = await bitnobAPI.get("/addresses");

    const addresses = response?.data?.data?.address;

    if (!addresses) {
      return res.status(400).json({
        success: false,
        message: "Failed to fetch addresses",
        raw: response.data,
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully fetched all addresses",
      addresses,
    });
  } catch (err) {
    next(err);
  }
};