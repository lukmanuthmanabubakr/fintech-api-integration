// src/routes/walletRoutes.js
const express = require("express");
const { generateAddress, listAddresses } = require("../controllers/walletController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/generate", protect, generateAddress);
router.get("/list", protect, listAddresses);


module.exports = router;
 
