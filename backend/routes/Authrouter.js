const express = require("express");
const bcrypt = require("bcryptjs");
const Authrouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// JWT Secret Key (should be stored in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Function to generate a random player ID
const generatePlayerId = () => {
  const prefix = "PID";
  const randomNum = Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
  return `${prefix}${randomNum}`;
};



// Check if referral code exists
Authrouter.get("/check-referral/:code", async (req, res) => {
  try {
    const { code } = req.params;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Referral code is required"
      });
    }
    
    // Check if referral code exists in the database
    const user = await User.findOne({ referralCode: code });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid referral code"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Referral code is valid",
      referrer: {
        username: user.username,
        player_id: user.player_id
      }
    });
  } catch (error) {
    console.error("Check referral error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Signup Route
// Add this helper function to get device info (place it near the top of the file)
const getDeviceInfo = (userAgent) => {
  let deviceType = 'unknown';
  let browser = 'unknown';
  let os = 'unknown';
  
  // Simple device detection
  if (userAgent.includes('Mobile')) {
    deviceType = 'mobile';
  } else if (userAgent.includes('Tablet')) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }
  
  // Simple browser detection
  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
  }
  
  // Simple OS detection
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS')) {
    os = 'iOS';
  }
  
  return { deviceType, browser, os };
};

// Import the LoginLog model at the top of Authrouter.js
const LoginLog = require('../models/LoginLog');

// Then update the signup route to create a login log after successful registration
Authrouter.post("/signup", async (req, res) => {
  try {
    const { currency, phone, username, password, confirmPassword, fullName, email, referralCode } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    // Validation checks
    if (!phone || !username || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        error: "All fields are required" 
      });
    }

    // Validate Bangladeshi phone number
    if (!/^1[0-9]{9}$/.test(phone)) {
      return res.status(400).json({ 
        success: false,
        error: "Please enter a valid Bangladeshi phone number, starting with 1." 
      });
    }

    // Validate username format
    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.status(400).json({ 
        success: false,
        error: "Username can only contain lowercase letters, numbers, and underscores." 
      });
    }

    if (username.length < 3) {
      return res.status(400).json({ 
        success: false,
        error: "Username must be at least 3 characters long." 
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: "Password must be at least 6 characters long." 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        error: "Passwords do not match." 
      });
    }

    // Check referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid referral code" 
        });
      }
      referredBy = referrer._id;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { phone: `+880${phone}` }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ 
          success: false,
          error: "Username already exists." 
        });
      }
      if (existingUser.phone === `+880${phone}`) {
        return res.status(400).json({ 
          success: false,
          error: "Phone number already registered." 
        });
      }
      if (email && existingUser.email === email) {
        return res.status(400).json({ 
          success: false,
          error: "Email already registered." 
        });
      }
    }

    // Generate a unique player_id
    let player_id;
    let isUnique = false;
    
    while (!isUnique) {
      player_id = generatePlayerId();
      const existingPlayer = await User.findOne({ player_id });
      if (!existingPlayer) {
        isUnique = true;
      }
    }

    // Create new user
    const newUser = new User({
      currency: currency || "BDT",
      phone: `+880${phone}`,
      username,
      password,
      fullName,
      email: email || null,
      player_id,
      referredBy
    });

    await newUser.save();

    // Update referrer's referral count if applicable
    if (referredBy) {
      await User.findByIdAndUpdate(referredBy, {
        $inc: { referralCount: 1 },
        $push: {
          referralUsers: {
            user: newUser._id,
            joinedAt: new Date(),
            earnedAmount: 0
          },
          referralTracking: {
            referralCodeUsed: referralCode,
            referredUser: newUser._id,
            timestamp: new Date()
          }
        }
      });
    }

    // Update login information for the new user
    newUser.login_count = 1;
    newUser.last_login = new Date();
    newUser.first_login = false;
    await newUser.save();

    // Create a login log entry for the registration/login
    const { deviceType, browser, os } = getDeviceInfo(userAgent);
    
    const loginLog = new LoginLog({
      userId: newUser._id,
      username: newUser.username,
      ipAddress,
      userAgent,
      deviceType,
      browser,
      os,
      status: 'success',
      failureReason: null
    });
    
    await loginLog.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Return success response with token
    res.status(201).json({
      success: true,
      message: "User created successfully",
      token,
      user: {
        id: newUser._id,
        player_id: newUser.player_id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        currency: newUser.currency,
        balance: newUser.balance,
        referralCode: newUser.referralCode,
        first_login: newUser.first_login,
        login_count: newUser.login_count,
        last_login: newUser.last_login
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
});

// Update the login route to log attempts
Authrouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    // Validation checks
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = await User.findOne({ username }).select("+password");
    
    // Log login attempt (even if user not found for security monitoring)
    const { deviceType, browser, os } = getDeviceInfo(userAgent);
    
    const loginLog = new LoginLog({
      userId: user ? user._id : null,
      username,
      ipAddress,
      userAgent,
      deviceType,
      browser,
      os,
      status: user ? 'success' : 'failed',
      failureReason: user ? null : 'user_not_found'
    });
    
    await loginLog.save();

    if (!user) {
      // Update failed login attempts
      await FailedLogin.findOneAndUpdate(
        { username },
        {
          $inc: { attemptCount: 1 },
          $set: { lastAttempt: new Date() },
          $push: { 
            failureReasons: { 
              reason: 'user_not_found', 
              timestamp: new Date() 
            } 
          }
        },
        { upsert: true, new: true }
      );
      
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    // Update login log with password check result
    if (!isPasswordValid) {
      loginLog.status = 'failed';
      loginLog.failureReason = 'invalid_password';
      await loginLog.save();
      
      // Update failed login attempts
      await FailedLogin.findOneAndUpdate(
        { username },
        {
          $inc: { attemptCount: 1 },
          $set: { lastAttempt: new Date() },
          $push: { 
            failureReasons: { 
              reason: 'invalid_password', 
              timestamp: new Date() 
            } 
          }
        },
        { upsert: true, new: true }
      );
      
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update login information
    user.login_count += 1;
    user.last_login = new Date();
    if (user.first_login) {
      user.first_login = false;
    }
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return success response with token
    res.json({
      message: "Login successful",
      success:true,
      token,
      user: {
        id: user._id,
        player_id: user.player_id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        balance: user.balance,
        first_login: user.first_login
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = Authrouter;