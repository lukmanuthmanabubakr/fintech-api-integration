const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getCustomer, updateCustomer, listCustomers } = require("../controllers/authController");
const { adminOnly, protect } = require("../middlewares/authMiddleware");

router.post("/register",  registerUser);
router.post("/login", loginUser);
router.get("/:id", protect, getCustomer);
router.put("/customer/:id", protect, updateCustomer); // 👈 update route
router.get("/", protect, adminOnly, listCustomers);




module.exports = router;
