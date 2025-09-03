 
const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const { sendBitcoin } = require("../controllers/transactionController");

const router = express.Router();

// ✅ Send Bitcoin
router.post("/send-bitcoin", protect, sendBitcoin);

module.exports = router;
