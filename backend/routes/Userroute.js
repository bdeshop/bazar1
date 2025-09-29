const express = require("express");
const User = require("../models/User");
const Userrouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Deposit = require("../models/Deposit");
const Withdrawal = require("../models/Withdrawal");
const mongoose=require("mongoose")
const axios=require("axios");
const qs=require("qs")
// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";
// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Access token required" 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false, 
        message: "Token expired" 
      });
    }
    
    console.error("Authentication error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

// -------- USER INFORMATION ROUTES --------
Userrouter.get("/all-information/:id", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById({_id:req.params.id});
    if(!user){
        return res.send({success:false,message:"User did not find!"})
    }
    res.send({success:true,data:user})
  } catch (error) {
    console.error("User information error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});
// Get user information
Userrouter.get("/my-information", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.send({
      success: true,
      message: "User found successfully",
      data: {
        id: user._id,
        player_id: user.player_id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        first_login: user.first_login,
        login_count: user.login_count,
        last_login: user.last_login,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        createdAt: user.createdAt,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        kycStatus: user.kycStatus
      }
    });
  } catch (error) {
    console.error("User information error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Update personal information
Userrouter.put("/update-personal-info", authenticateToken, async (req, res) => {
  try {
    const { fullName, dateOfBirth, phone } = req.body;
    const user = req.user;
    
    // Update fields if provided
    if (fullName !== undefined) user.fullName = fullName;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (phone !== undefined) user.phone = phone;
    
    await user.save();
    
    res.send({
      success: true,
      message: "Personal information updated successfully",
      data: {
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Update personal info error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// -------- PASSWORD & SECURITY ROUTES --------

// Change password
Userrouter.post("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }
    
    // Check if new password is the same as current
    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password"
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.send({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Set/update transaction password
Userrouter.post("/set-transaction-password", authenticateToken, async (req, res) => {
  try {
    const { transactionPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    user.transactionPassword = transactionPassword;
    await user.save();
    
    res.send({
      success: true,
      message: "Transaction password set successfully"
    });
  } catch (error) {
    console.error("Set transaction password error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// -------- VERIFICATION ROUTES --------

// Request email verification
Userrouter.post("/request-email-verification", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }
    
    // Generate OTP (in a real app, you would send this via email)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      purpose: "email_verification",
      verified: false
    };
    
    await user.save();
    
    // In a real app, you would send the OTP via email here
    console.log(`Email verification OTP for ${user.email}: ${otpCode}`);
    
    res.send({
      success: true,
      message: "Verification email sent"
    });
  } catch (error) {
    console.error("Request email verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Verify email with OTP
Userrouter.post("/verify-email", authenticateToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;
    
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }
    
    if (!user.otp || user.otp.purpose !== "email_verification") {
      return res.status(400).json({
        success: false,
        message: "No verification request found"
      });
    }
    
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }
    
    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }
    
    user.isEmailVerified = true;
    user.otp.verified = true;
    await user.save();
    
    res.send({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Request phone verification
Userrouter.post("/request-phone-verification", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number not set"
      });
    }
    
    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone is already verified"
      });
    }
    
    // Generate OTP (in a real app, you would send this via SMS)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      purpose: "phone_verification",
      verified: false
    };
    
    await user.save();
    
    // In a real app, you would send the OTP via SMS here
    console.log(`Phone verification OTP for ${user.phone}: ${otpCode}`);
    
    res.send({
      success: true,
      message: "Verification SMS sent"
    });
  } catch (error) {
    console.error("Request phone verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Verify phone with OTP
Userrouter.post("/verify-phone", authenticateToken, async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;
    
    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone is already verified"
      });
    }
    
    if (!user.otp || user.otp.purpose !== "phone_verification") {
      return res.status(400).json({
        success: false,
        message: "No verification request found"
      });
    }
    
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }
    
    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }
    
    user.isPhoneVerified = true;
    user.otp.verified = true;
    await user.save();
    
    res.send({
      success: true,
      message: "Phone verified successfully"
    });
  } catch (error) {
    console.error("Verify phone error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Get verification status
Userrouter.get("/verification-status", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.send({
      success: true,
      data: {
        email: user.isEmailVerified ? "verified" : "pending",
        phone: user.isPhoneVerified ? "verified" : "pending",
        identity: user.kycStatus,
        address: "not_started" // You might want to add address verification to your model
      }
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// -------- SECURITY SETTINGS ROUTES --------

// Enable/disable two-factor authentication
Userrouter.post("/toggle-2fa", authenticateToken, async (req, res) => {
  try {
    const { enable } = req.body;
    const user = req.user;
    
    user.twoFactorEnabled = enable;
    await user.save();
    
    res.send({
      success: true,
      message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'}`
    });
  } catch (error) {
    console.error("Toggle 2FA error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Get active sessions
Userrouter.get("/active-sessions", authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    // Return limited session information
    const sessions = user.loginHistory.slice(-5).map(session => ({
      device: session.device,
      location: session.location,
      timestamp: session.timestamp
    }));
    
    res.send({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error("Get active sessions error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// -------- PREFERENCES ROUTES --------
// Update notification preferences
Userrouter.put("/notification-preferences", authenticateToken, async (req, res) => {
  try {
    const { email, sms, push } = req.body;
    const user = req.user;
    
    if (email !== undefined) user.notificationPreferences.email = email;
    if (sms !== undefined) user.notificationPreferences.sms = sms;
    if (push !== undefined) user.notificationPreferences.push = push;
    
    await user.save();
    
    res.send({
      success: true,
      message: "Notification preferences updated",
      data: user.notificationPreferences
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Update theme preference
Userrouter.put("/theme-preference", authenticateToken, async (req, res) => {
  try {
    const { theme } = req.body;
    const user = req.user;
    
    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      user.themePreference = theme;
      await user.save();
      
      res.send({
        success: true,
        message: "Theme preference updated",
        data: { themePreference: user.themePreference }
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid theme preference"
      });
    }
  } catch (error) {
    console.error("Update theme preference error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});
Userrouter.post('/play-game', async (req, res) => {
  try {
    const { slug, username, money, userid } = req.body;
    console.log(req.body)
    const postData = {
      home_url: "https://bajibet24.live",
      token: "f9d21d76de9f32f16d7e189bf0b729a7",
      username: username+"45",
      money: money,
      gameid: req.body.gameID
    };

    console.log('Sending POST request to joyhobe.com with data:', postData);

    // POST রিকোয়েস্ট
    const response = await axios.post('https://dstplay.net/getgameurl', qs.stringify(postData), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Response from bajibet24.com:', response.data, 'Status:', response.status);
    res.status(200).json({
      message: 'POST request successful',
      joyhobeResponse: response.data,
    });
  } catch (error) {
    console.error('Error in POST /api/test/game:', error);
    res.status(500).json({
      error: 'Failed to forward POST request',
      details: error.message,
    });
  }
});

// Deposit route
Userrouter.post("/deposit", authenticateToken, async (req, res) => {
  try {
    const { method, phoneNumber, amount, transactionId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!method || !amount) {
      return res.status(400).json({
        success: false,
        message: "Method and amount are required"
      });
    }

    if (['bkash', 'nagad', 'rocket', 'upay'].includes(method) && !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required for this payment method"
      });
    }

    if (['bank', 'card'].includes(method) && !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required for this payment method"
      });
    }

    if (amount < 300) {
      return res.status(400).json({
        success: false,
        message: "Minimum deposit amount is ৳10"
      });
    }

    if (amount > 50000) {
      return res.status(400).json({
        success: false,
        message: "Maximum deposit amount is ৳50,000"
      });
    }

    // Create transaction record
    const transaction = new Deposit({
      userId,
      type: 'deposit',
      method,
      amount,
      phoneNumber,
      transactionId,
      status: 'pending',
      description: `Deposit via ${method}`
    });

    await transaction.save();

    // In a real application, you would integrate with payment gateway here
    // For demo purposes, we'll simulate a successful deposit after 2 seconds
    // Update user balance
        await User.findByIdAndUpdate(userId, {
          $push: { 
            depositHistory: {
              method,
              amount,
              date: new Date(),
              status: 'pending'
            }
          }
        });
    res.status(200).json({
      success: true,
      message: "Deposit request received and is being processed",
      data: {
        transactionId: transaction._id,
        amount,
        method
      }
    });

  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get transaction history
Userrouter.get("/history", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type } = req.query;

    const query = { userId };
    if (type) {
      query.type = type;
    }

    const transactions = await Deposit.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Deposit.countDocuments(query);
     console.log(transactions)
    res.json({
      success: true,
      data: transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Transaction history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// Withdrawal route
Userrouter.post("/withdraw", authenticateToken, async (req, res) => {
  try {
    const { method, phoneNumber, amount } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!method || !phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: "Method, phone number and amount are required"
      });
    }

    if (!['bkash', 'nagad', 'rocket', 'upay'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid withdrawal method"
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum withdrawal amount is ৳100"
      });
    }

    // Check user balance
    if (amount > req.user.balance) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance"
      });
    }

    // Create withdrawal record
    const withdrawal = new Withdrawal({
      userId,
      method,
      phoneNumber,
      amount,
      status: 'pending'
    });

    await withdrawal.save();

    // Update user balance
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -amount },
      $push: { 
        withdrawalHistory: {
          method,
          amount,
          date: new Date(),
          status: 'pending',
          phoneNumber
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully",
      data: {
        withdrawalId: withdrawal._id,
        amount,
        method
      }
    });

  } catch (error) {
    console.error("Withdrawal error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Get withdrawal history
Userrouter.get("/withdraw/history/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Verify the user is requesting their own history
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const withdrawals = await Withdrawal.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments({ userId });

    res.json({
      success: true,
      data: withdrawals,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Withdrawal history error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
const Notification = require("../models/Notification"); // Add this at the top with other imports

// -------- NOTIFICATION ROUTES --------

// Get user notifications
Userrouter.get("/notifications/:userId", authenticateToken, async (req, res) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;
    const userId = req.params.userId;
    const userRole = req.user.role || 'user';
     console.log(userId)
    // Convert query params to proper types
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      unreadOnly: unreadOnly === 'true'
    };

    // Convert userId to ObjectId safely
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Build the query for notifications accessible to this user
    const query = {
      $or: [
        { targetType: 'all' },
        { targetType: 'specific', targetUsers: { $in: [userObjectId] } },
        { targetType: 'role_based', userRoles: userRole }
      ],
      status: 'sent',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ],
      scheduledFor: { $lte: new Date() }
    };

    // Add unread filter if requested
    if (options.unreadOnly) {
      query['isRead.userId'] = { $ne: userObjectId };
    }

    // Execute the query with pagination
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .lean();

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);

    // Format the response with read status for each notification
    const formattedNotifications = notifications.map(notification => ({
      ...notification,
      isRead: notification.isRead.some(read => read.userId && read.userId.toString() === userId)
    }));
  console.log(formattedNotifications)
    res.send({
      success: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications: formattedNotifications,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: totalCount,
          pages: Math.ceil(totalCount / options.limit)
        }
      }
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});
// Mark notification as read
Userrouter.post("/notifications/:id/read", authenticateToken, async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    // Check if user has access to this notification
    const hasAccess = 
      notification.targetType === 'all' ||
      (notification.targetType === 'specific' && notification.targetUsers.includes(userId)) ||
      (notification.targetType === 'role_based' && notification.userRoles.includes(req.user.role));
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access to this notification denied"
      });
    }

    await notification.markAsRead(userId);

    res.send({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Mark all notifications as read
Userrouter.post("/notifications/read-all", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role || 'user';

    // Get all unread notifications for the user
    const query = {
      $or: [
        { targetType: 'all' },
        { targetType: 'specific', targetUsers: userId },
        { targetType: 'role_based', userRoles: userRole }
      ],
      status: 'sent',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ],
      scheduledFor: { $lte: new Date() },
      'isRead.userId': { $ne: userId }
    };

    const unreadNotifications = await Notification.find(query);

    // Mark each notification as read
    for (const notification of unreadNotifications) {
      await notification.markAsRead(userId);
    }

    res.send({
      success: true,
      message: "All notifications marked as read",
      count: unreadNotifications.length
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Get unread notifications count
// Get unread notifications count
Userrouter.get("/notifications/unread-count", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Changed from req.user.id to req.user._id
    const userRole = req.user.role || 'user';
 console.log("fdf",userId)
    // Convert userId to ObjectId safely

    const query = {
      $or: [
        { targetType: 'all' },
        { targetType: 'specific', targetUsers: { $in: [userId] } }, // Use ObjectId
      ],
      status: 'sent',
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ],
      scheduledFor: { $lte: new Date() },
      'isRead.userId': { $ne: userId } // Use ObjectId
    };

    const count = await Notification.countDocuments(query);

    res.send({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Add this route to your existing Userrouter

// Get all transactions (deposits + withdrawals) for a user
Userrouter.get("/all-transactions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;
    
    // Build base query
    const baseQuery = { userId };
    
    // Add type filter if provided
    if (type && ['deposit', 'withdrawal'].includes(type)) {
      baseQuery.type = type;
    }
    
    // Add status filter if provided
    if (status) {
      baseQuery.status = status;
    }
    
    // Add date range filter if provided
    let dateFilter = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }
    if (startDate || endDate) {
      baseQuery.createdAt = dateFilter;
    }
    
    // Get deposits with filters
    const deposits = await Deposit.find(baseQuery)
      .sort({ createdAt: -1 })
      .lean();
    
    // For withdrawals, we need to adjust the query since they have different schema
    const withdrawalQuery = { userId };
    
    // Copy filters that apply to both
    if (status) withdrawalQuery.status = status;
    if (startDate || endDate) withdrawalQuery.createdAt = dateFilter;
    
    const withdrawals = await Withdrawal.find(withdrawalQuery)
      .sort({ createdAt: -1 })
      .lean();
    
    // Transform withdrawals to match deposit format for consistency
    const transformedWithdrawals = withdrawals.map(withdrawal => ({
      _id: withdrawal._id,
      userId: withdrawal.userId,
      type: 'withdrawal',
      method: withdrawal.method,
      amount: withdrawal.amount,
      status: withdrawal.status,
      phoneNumber: withdrawal.phoneNumber,
      transactionId: withdrawal.transactionId,
      description: `Withdrawal via ${withdrawal.method}`,
      createdAt: withdrawal.createdAt,
      updatedAt: withdrawal.updatedAt,
      processedAt: withdrawal.processedAt
    }));
    
    // Combine and sort all transactions
    const allTransactions = [...deposits, ...transformedWithdrawals]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedTransactions,
      total: allTransactions.length,
      totalPages: Math.ceil(allTransactions.length / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("All transactions error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
module.exports = Userrouter;