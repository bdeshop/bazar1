const express = require("express");
const Adminauth = express.Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const JWT_SECRET = "BAJI@";
const bcrypt = require("bcryptjs");
// Signup route
Adminauth.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Create new admin
    const admin = new Admin({ email, password });
    await admin.save();

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: { id: admin._id, email: admin.email, is_active: admin.is_active },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

// Login route
Adminauth.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin
    const admin = await Admin.findOne({ email });

    if (!admin || !admin.is_active) {
      return res.json({ message: "Invalid credentials or inactive account" });
    }

    console.log(`Login attempt for ${email}`, password, admin);

    // Check password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      admin: { id: admin._id, email: admin.email, is_active: admin.is_active },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = Adminauth;
