const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bitnobAPI = require("../config/bitnob");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Create Bitnob customer
    const bitnobRes = await bitnobAPI.post("/customers", {
      email,
      firstName: name.split(" ")[0] || "User",
      lastName: name.split(" ")[1] || "Bitnob",
      phone: phone,
    });

    // ✅ FIX: Use "id" instead of "customerId"
    const customerId = bitnobRes?.data?.data?.id;
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "Failed to get customerId from Bitnob response",
        raw: bitnobRes.data,
      });
    }

    // Step 2: Save user in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      bitnobCustomerId: customerId,
    });

    // Step 3: Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bitnobCustomerId: user.bitnobCustomerId,
      },
    });
  } catch (err) {
    next(err);
  }
};

// exports.loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Please provide email and password" });
//     }

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     res.status(201).json({
//       success: true,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//         bitnobCustomerId: user.bitnobCustomerId,
//       },
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     next(error);
//   }
// };


exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Send token as HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only HTTPS in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send response
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bitnobCustomerId: user.bitnobCustomerId,
      },
      token, // optional: you can also send it in the body
    });
  } catch (error) {
    next(error);
  }
};



exports.getCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.id;

    const response = await bitnobAPI.get(`/customers/${customerId}`);

    return res.status(200).json({
      success: true,
      message: "Customer fetched successfully",
      customer: response.data.data,
    });
  } catch (err) {
    console.error(
      "Error fetching customer:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: err.response?.data || err.message,
    });
  }
};

// ✅ Update Customer Controller
exports.updateCustomer = async (req, res, next) => {
  try {
    const customerId = req.params.id;
    const { firstName, lastName, email, phone, countryCode } = req.body;

    // Call Bitnob API to update customer
    const response = await bitnobAPI.put(`/customers/${customerId}`, {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
    });

    return res.status(200).json({
      success: true,
      message: "Customer successfully updated",
      customer: response.data.data,
    });
  } catch (err) {
    console.error(
      "Error updating customer:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: err.response?.data || err.message,
    });
  }
};

// ✅ List all customers
exports.listCustomers = async (req, res, next) => {
  try {
    const response = await bitnobAPI.get("/customers/");

    return res.status(200).json({
      success: true,
      message: "Customers successfully fetched",
      customers: response.data.data.customers,
      meta: response.data.data.meta || null, // Bitnob includes pagination meta sometimes
    });
  } catch (err) {
    console.error(
      "Error listing customers:",
      err.response?.data || err.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: err.response?.data || err.message,
    });
  }
};
