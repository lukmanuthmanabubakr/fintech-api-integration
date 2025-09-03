const bitnobAPI = require("../config/bitnob");

exports.sendBitcoin = async (req, res, next) => {
  try {
    const { satoshis, address, description, priorityLevel } = req.body;

    // Use logged-in user's email
    const customerEmail = req.user.email;

    if (!satoshis || !address) {
      return res.status(400).json({
        success: false,
        message: "satoshis and address are required",
      });
    }

    // ✅ Send BTC request to Bitnob API
    const response = await bitnobAPI.post("/wallets/send_bitcoin", {
      satoshis,
      address,
      customerEmail,
      description: description || "BTC transfer",
      priorityLevel: priorityLevel || "regular",
    });

    const txData = response?.data?.data;

    if (!txData) {
      return res.status(400).json({
        success: false,
        message: "Failed to send Bitcoin",
        raw: response.data,
      });
    }

    // TODO: Optionally save txData into your Transaction model in MongoDB
    // Example: Transaction.create({ user: req.user._id, ...txData });

    res.status(200).json({
      success: true,
      message: "Transaction successfully submitted",
      transaction: txData,
    });
  } catch (err) {
    next(err);
  }
};
