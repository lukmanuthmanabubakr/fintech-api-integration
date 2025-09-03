// src/routes/walletRoutes.js
const express = require("express");
const { generateAddress, listAddresses, getRecommendedFees } = require("../controllers/walletController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateAddress);
router.get("/list", protect, listAddresses);
router.get("/fees/recommended", protect, getRecommendedFees); // 👈 New route



module.exports = router;
