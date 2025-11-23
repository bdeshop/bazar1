const express = require("express");
const axios = require("axios");
const Adminrouter = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Banner = require("../models/Banner");
const Promotional = require("../models/Promotional");
const Terms = require("../models/Terms");
const FAQ = require("../models/FAQ");
const GameCategory = require("../models/GameCategory");
const GameProvider = require("../models/GameProvider");
const {User} = require("../models/User");
// Middleware to check if user is authenticated as admin
const adminAuth = (req, res, next) => {
  // Implement your authentication logic here
  // For example, check if user has admin role in JWT token
  // This is a placeholder - implement according to your auth system
  const isAuthenticated = true; // Replace with actual authentication check

  if (!isAuthenticated) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  next();
};
// Get user information
Adminrouter.get("/admin-information", adminAuth, async (req, res) => {
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
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    console.error("User information error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// Configure multer for file uploads - Banners
const bannerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/uploads/banners/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "banner-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure multer for file uploads - Promotional Content
const promotionalStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/uploads/promotionals/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "promotional-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const uploadBanners = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

const uploadPromotional = multer({
  storage: promotionalStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// Apply admin authentication middleware to all routes
Adminrouter.use(adminAuth);
// ==================== COMPREHENSIVE DASHBOARD ROUTE ====================

// GET comprehensive dashboard data
Adminrouter.get("/dashboard", async (req, res) => {
  try {
    // Calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Today's date filter
    const todayFilter = { createdAt: { $gte: today, $lt: tomorrow } };

    console.log("this is user -> ",User)


    // 1. USER STATISTICS
    const totalUsers = await User.countDocuments();
    const todayUsers = await User.countDocuments(todayFilter);
    const activeUsers = await User.countDocuments({ status: "active" });
    const bannedUsers = await User.countDocuments({ status: "banned" });
    const pendingUsers = await User.countDocuments({ status: "pending" });

    const userStatusStats = await User.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const userRoleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // User registration trend (last 7 days)
    const userRegistrationTrend = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 2. FINANCIAL STATISTICS
    // Total balances
    const totalBalanceStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$balance" },
          totalBonusBalance: { $sum: "$bonusBalance" },
          totalDeposit: { $sum: "$total_deposit" },
          totalWithdraw: { $sum: "$total_withdraw" },
          totalBet: { $sum: "$total_bet" },
        },
      },
    ]);

    // 3. DEPOSIT STATISTICS
    const totalDeposits = await Deposit.countDocuments();
    const todayDeposits = await Deposit.countDocuments(todayFilter);

    const depositStatusStats = await Deposit.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const depositMethodStats = await Deposit.aggregate([
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const todayDepositAmount = await Deposit.aggregate([
      { $match: todayFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // 4. WITHDRAWAL STATISTICS
    const totalWithdrawals = await Withdrawal.countDocuments();
    const todayWithdrawals = await Withdrawal.countDocuments(todayFilter);

    const withdrawalStatusStats = await Withdrawal.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const withdrawalMethodStats = await Withdrawal.aggregate([
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const todayWithdrawalAmount = await Withdrawal.aggregate([
      { $match: todayFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    // 5. GAME STATISTICS
    const totalGames = await Game.countDocuments();
    const activeGames = await Game.countDocuments({ status: true });
    const inactiveGames = await Game.countDocuments({ status: false });
    const featuredGames = await Game.countDocuments({ featured: true });

    const gameCategoryStats = await Game.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const gameProviderStats = await Game.aggregate([
      {
        $group: {
          _id: "$provider",
          count: { $sum: 1 },
        },
      },
    ]);

    // 6. GAME CATEGORY STATISTICS
    const totalCategories = await GameCategory.countDocuments();
    const activeCategories = await GameCategory.countDocuments({
      status: true,
    });
    const inactiveCategories = await GameCategory.countDocuments({
      status: false,
    });

    // 7. GAME PROVIDER STATISTICS
    const totalProviders = await GameProvider.countDocuments();
    const activeProviders = await GameProvider.countDocuments({ status: true });
    const inactiveProviders = await GameProvider.countDocuments({
      status: false,
    });

    // 8. PROMOTIONAL CONTENT STATISTICS
    const totalPromotionals = await Promotional.countDocuments();
    const activePromotionals = await Promotional.countDocuments({
      status: true,
    });
    const inactivePromotionals = await Promotional.countDocuments({
      status: false,
    });

    // 9. BANNER STATISTICS
    const totalBanners = await Banner.countDocuments();
    const activeBanners = await Banner.countDocuments({ status: true });
    const inactiveBanners = await Banner.countDocuments({ status: false });

    // 10. RECENT ACTIVITIES (Last 10 of each)
    const recentUsers = await User.find()
      .select("username player_id status createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentDeposits = await Deposit.find()
      .populate("userId", "username player_id")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentWithdrawals = await Withdrawal.find()
      .populate("userId", "username player_id")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentGames = await Game.find()
      .select("name provider category status")
      .sort({ createdAt: -1 })
      .limit(10);

    // 11. PENDING APPROVALS (for notifications)
    const pendingDeposits = await Deposit.countDocuments({ status: "pending" });
    const pendingWithdrawals = await Withdrawal.countDocuments({
      status: "pending",
    });
    const pendingUsersCount = await User.countDocuments({ status: "pending" });

    // Format the response
    const response = {
      summary: {
        users: {
          total: totalUsers,
          today: todayUsers,
          active: activeUsers,
          banned: bannedUsers,
          pending: pendingUsers,
        },
        financial: totalBalanceStats[0] || {
          totalBalance: 0,
          totalBonusBalance: 0,
          totalDeposit: 0,
          totalWithdraw: 0,
          totalBet: 0,
        },
        deposits: {
          total: totalDeposits,
          today: todayDeposits,
          todayAmount: todayDepositAmount[0]?.totalAmount || 0,
        },
        withdrawals: {
          total: totalWithdrawals,
          today: todayWithdrawals,
          todayAmount: todayWithdrawalAmount[0]?.totalAmount || 0,
        },
        games: {
          total: totalGames,
          active: activeGames,
          inactive: inactiveGames,
          featured: featuredGames,
        },
        categories: {
          total: totalCategories,
          active: activeCategories,
          inactive: inactiveCategories,
        },
        providers: {
          total: totalProviders,
          active: activeProviders,
          inactive: inactiveProviders,
        },
        content: {
          promotionals: {
            total: totalPromotionals,
            active: activePromotionals,
            inactive: inactivePromotionals,
          },
          banners: {
            total: totalBanners,
            active: activeBanners,
            inactive: inactiveBanners,
          },
        },
        pendingApprovals: {
          deposits: pendingDeposits,
          withdrawals: pendingWithdrawals,
          users: pendingUsersCount,
        },
      },
      detailedStats: {
        users: {
          byStatus: userStatusStats,
          byRole: userRoleStats,
          registrationTrend: userRegistrationTrend,
        },
        deposits: {
          byStatus: depositStatusStats,
          byMethod: depositMethodStats,
        },
        withdrawals: {
          byStatus: withdrawalStatusStats,
          byMethod: withdrawalMethodStats,
        },
        games: {
          byCategory: gameCategoryStats,
          byProvider: gameProviderStats,
        },
      },
      recentActivities: {
        users: recentUsers,
        deposits: recentDeposits,
        withdrawals: recentWithdrawals,
        games: recentGames,
      },
      timestamp: {
        generatedAt: new Date(),
        dateRange: {
          today: today.toISOString(),
          yesterday: yesterday.toISOString(),
          sevenDaysAgo: sevenDaysAgo.toISOString(),
          thirtyDaysAgo: thirtyDaysAgo.toISOString(),
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      error: "Failed to fetch dashboard data",
      details: error.message,
    });
  }
});
// ==================== BANNER ROUTES ====================
// GET all users with filtering, pagination, and search
Adminrouter.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      role,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { player_id: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get users with pagination
    const users = await User.find()
      .sort(sort)
      .select(
        "-password -transactionPassword -moneyTransferPassword -twoFactorSecret"
      );

    // Get total count for pagination info
    const total = await User.countDocuments(filter);

    res.json({
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
Adminrouter.get("/all-users", async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });

    res.json({
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET single user by ID
Adminrouter.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -transactionPassword -moneyTransferPassword -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET user by username, email, or phone
Adminrouter.get("/users/search/:query", async (req, res) => {
  try {
    const query = req.params.query;

    const user = await User.findOne({
      $or: [
        { username: query },
        { email: query },
        { phone: query },
        { player_id: query },
      ],
    }).select(
      "-password -transactionPassword -moneyTransferPassword -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error searching user:", error);
    res.status(500).json({ error: "Failed to search user" });
  }
});

// POST create new user (admin only)
Adminrouter.post("/users", async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      role,
      status,
      currency,
      balance,
      referralCode,
    } = req.body;

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if email already exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }

    // Check if phone already exists
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
    }

    const userData = {
      username,
      email,
      phone,
      password: password || Math.random().toString(36).slice(-8), // Generate random password if not provided
      role: role || "user",
      status: status || "active",
      currency: currency || "BDT",
      balance: balance || 0,
    };

    if (referralCode) {
      userData.referralCode = referralCode;
    }

    const newUser = new User(userData);
    const savedUser = await newUser.save();

    // Remove sensitive data before sending response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.transactionPassword;
    delete userResponse.moneyTransferPassword;
    delete userResponse.twoFactorSecret;

    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT update user
Adminrouter.put("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const {
      username,
      email,
      phone,
      role,
      status,
      currency,
      balance,
      bonusBalance,
      isEmailVerified,
      isPhoneVerified,
      kycStatus,
      notificationPreferences,
      themePreference,
    } = req.body;

    // Check if new username already exists (excluding current user)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({
        username,
        _id: { $ne: req.params.id },
      });
      if (existingUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }
      user.username = username;
    }

    // Check if new email already exists (excluding current user)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      user.email = email;
    }

    // Check if new phone already exists (excluding current user)
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: req.params.id },
      });
      if (existingPhone) {
        return res.status(400).json({ error: "Phone number already exists" });
      }
      user.phone = phone;
    }

    // Update other fields
    if (role) user.role = role;
    if (status) user.status = status;
    if (currency) user.currency = currency;
    if (balance !== undefined) user.balance = balance;
    if (bonusBalance !== undefined) user.bonusBalance = bonusBalance;
    if (isEmailVerified !== undefined) user.isEmailVerified = isEmailVerified;
    if (isPhoneVerified !== undefined) user.isPhoneVerified = isPhoneVerified;
    if (kycStatus) user.kycStatus = kycStatus;

    if (notificationPreferences) {
      user.notificationPreferences = {
        ...user.notificationPreferences,
        ...notificationPreferences,
      };
    }

    if (themePreference) user.themePreference = themePreference;

    await user.save();

    // Remove sensitive data before sending response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.transactionPassword;
    delete userResponse.moneyTransferPassword;
    delete userResponse.twoFactorSecret;

    res.json({
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update user" });
  }
});

// PUT update user status
Adminrouter.put("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !status ||
      !["active", "banned", "deactivated", "pending"].includes(status)
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select(
      "-password -transactionPassword -moneyTransferPassword -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User status updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// PUT update user role
Adminrouter.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !["user", "agent", "admin", "super_admin"].includes(role)) {
      return res.status(400).json({ error: "Valid role is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select(
      "-password -transactionPassword -moneyTransferPassword -twoFactorSecret"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// DELETE user
Adminrouter.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deletion of admin users (optional)
    if (user.role === "admin" || user.role === "super_admin") {
      return res.status(403).json({ error: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// GET user financial statistics
Adminrouter.get("/users/:id/financial-stats", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "total_deposit total_withdraw total_bet total_wins total_loss net_profit lifetime_deposit lifetime_withdraw lifetime_bet"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      totalDeposit: user.total_deposit,
      totalWithdraw: user.total_withdraw,
      totalBet: user.total_bet,
      totalWins: user.total_wins,
      totalLoss: user.total_loss,
      netProfit: user.net_profit,
      lifetimeDeposit: user.lifetime_deposit,
      lifetimeWithdraw: user.lifetime_withdraw,
      lifetimeBet: user.lifetime_bet,
    });
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    res.status(500).json({ error: "Failed to fetch financial statistics" });
  }
});

// GET user transaction history
Adminrouter.get("/users/:id/transactions", async (req, res) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let transactions = user.transactionHistory || [];

    // Filter by type if provided
    if (type && type !== "all") {
      transactions = transactions.filter((t) => t.type === type);
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);

    res.json({
      transactions: paginatedTransactions,
      total: transactions.length,
      totalPages: Math.ceil(transactions.length / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// GET user deposit history
Adminrouter.get("/users/:id/deposits", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let deposits = user.depositHistory || [];

    // Filter by status if provided
    if (status && status !== "all") {
      deposits = deposits.filter((d) => d.status === status);
    }

    // Sort by date (newest first)
    deposits.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedDeposits = deposits.slice(startIndex, endIndex);

    res.json({
      deposits: paginatedDeposits,
      total: deposits.length,
      totalPages: Math.ceil(deposits.length / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).json({ error: "Failed to fetch deposits" });
  }
});

// GET user withdrawal history
Adminrouter.get("/users/:id/withdrawals", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let withdrawals = user.withdrawHistory || [];

    // Filter by status if provided
    if (status && status !== "all") {
      withdrawals = withdrawals.filter((w) => w.status === status);
    }

    // Sort by date (newest first)
    withdrawals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedWithdrawals = withdrawals.slice(startIndex, endIndex);

    res.json({
      withdrawals: paginatedWithdrawals,
      total: withdrawals.length,
      totalPages: Math.ceil(withdrawals.length / parseInt(limit)),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

// GET user bonus information
Adminrouter.get("/users/:id/bonus-info", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "bonusInfo bonusBalance bonusActivityLogs"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      bonusBalance: user.bonusBalance,
      firstDepositBonusClaimed: user.bonusInfo.firstDepositBonusClaimed,
      activeBonuses: user.bonusInfo.activeBonuses,
      bonusWageringTotal: user.bonusInfo.bonusWageringTotal,
      cancelledBonuses: user.bonusInfo.cancelledBonuses,
      activityLogs: user.bonusActivityLogs,
    });
  } catch (error) {
    console.error("Error fetching bonus info:", error);
    res.status(500).json({ error: "Failed to fetch bonus information" });
  }
});

// POST manually add bonus to user
Adminrouter.post("/users/:id/add-bonus", async (req, res) => {
  try {
    const { bonusType, amount, reason } = req.body;

    if (!bonusType || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Valid bonus type and amount are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add bonus to user's balance
    user.bonusBalance += amount;

    // Add to active bonuses
    user.bonusInfo.activeBonuses.push({
      bonusType,
      amount,
      originalAmount: amount,
      wageringRequirement: 30, // Default wagering requirement
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Log the bonus activity
    user.bonusActivityLogs.push({
      bonusType,
      bonusAmount: amount,
      depositAmount: 0, // Manual addition, no deposit
      activatedAt: new Date(),
      status: "active",
    });

    // Add transaction history
    user.transactionHistory.push({
      type: "bonus",
      amount: amount,
      balanceBefore: user.bonusBalance - amount,
      balanceAfter: user.bonusBalance,
      description: `Manual bonus addition: ${reason || "No reason provided"}`,
      referenceId: `BONUS-${Date.now()}`,
    });

    await user.save();

    res.json({
      message: "Bonus added successfully",
      newBonusBalance: user.bonusBalance,
    });
  } catch (error) {
    console.error("Error adding bonus:", error);
    res.status(500).json({ error: "Failed to add bonus" });
  }
});

// POST manually adjust user balance
Adminrouter.post("/users/:id/adjust-balance", async (req, res) => {
  try {
    const { amount, type, reason } = req.body;

    if (
      !amount ||
      amount <= 0 ||
      !type ||
      !["add", "subtract"].includes(type)
    ) {
      return res
        .status(400)
        .json({ error: "Valid amount and type are required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const balanceBefore = user.balance;
    let balanceAfter;

    if (type === "add") {
      user.balance += amount;
      balanceAfter = user.balance;
    } else {
      if (user.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }
      user.balance -= amount;
      balanceAfter = user.balance;
    }

    // Add transaction history
    user.transactionHistory.push({
      type: type === "add" ? "deposit" : "withdrawal",
      amount: amount,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      description: `Manual balance adjustment: ${
        reason || "No reason provided"
      }`,
      referenceId: `ADJ-${Date.now()}`,
    });

    await user.save();

    res.json({
      message: `Balance ${
        type === "add" ? "added" : "subtracted"
      } successfully`,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error adjusting balance:", error);
    res.status(500).json({ error: "Failed to adjust balance" });
  }
});

// GET user referral information
Adminrouter.get("/users/:id/referral-info", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select(
        "referralCode referralEarnings referralCount referralUsers referralTracking"
      )
      .populate("referralUsers.user", "username player_id")
      .populate("referralTracking.referredUser", "username player_id");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      referralCode: user.referralCode,
      referralEarnings: user.referralEarnings,
      referralCount: user.referralCount,
      referralUsers: user.referralUsers,
      referralTracking: user.referralTracking,
    });
  } catch (error) {
    console.error("Error fetching referral info:", error);
    res.status(500).json({ error: "Failed to fetch referral information" });
  }
});

// GET user login history
Adminrouter.get("/users/:id/login-history", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.params.id).select(
      "loginHistory login_count last_login"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const loginHistory = user.loginHistory || [];

    // Sort by date (newest first)
    loginHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedHistory = loginHistory.slice(startIndex, endIndex);

    res.json({
      loginHistory: paginatedHistory,
      total: loginHistory.length,
      totalPages: Math.ceil(loginHistory.length / parseInt(limit)),
      currentPage: parseInt(page),
      loginCount: user.login_count,
      lastLogin: user.last_login,
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    res.status(500).json({ error: "Failed to fetch login history" });
  }
});

// GET user KYC information
Adminrouter.get("/users/:id/kyc-info", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "kycStatus kycDocuments isEmailVerified isPhoneVerified"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      kycStatus: user.kycStatus,
      kycDocuments: user.kycDocuments,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    });
  } catch (error) {
    console.error("Error fetching KYC info:", error);
    res.status(500).json({ error: "Failed to fetch KYC information" });
  }
});

// PUT update user KYC status
Adminrouter.put("/users/:id/kyc-status", async (req, res) => {
  try {
    const { kycStatus, documentId, status, notes } = req.body;

    if (
      !kycStatus ||
      !["unverified", "pending", "verified", "rejected"].includes(kycStatus)
    ) {
      return res.status(400).json({ error: "Valid KYC status is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.kycStatus = kycStatus;

    // Update specific document status if provided
    if (documentId && status) {
      const document = user.kycDocuments.id(documentId);
      if (document) {
        document.status = status;
        if (status === "verified") {
          document.verifiedAt = new Date();
        }
        if (notes) {
          document.notes = notes;
        }
      }
    }

    await user.save();

    res.json({
      message: "KYC status updated successfully",
      kycStatus: user.kycStatus,
    });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    res.status(500).json({ error: "Failed to update KYC status" });
  }
});

// GET user wagering status
Adminrouter.get("/users/:id/wagering-status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "total_deposit totalWagered bonusInfo"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const wageringStatus = user.wageringStatus;

    res.json({
      wageringStatus,
      totalDeposit: user.total_deposit,
      totalWagered: user.totalWagered,
      activeBonuses: user.bonusInfo.activeBonuses,
    });
  } catch (error) {
    console.error("Error fetching wagering status:", error);
    res.status(500).json({ error: "Failed to fetch wagering status" });
  }
});

// GET user statistics for dashboard
Adminrouter.get("/users-stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const bannedUsers = await User.countDocuments({ status: "banned" });
    const pendingUsers = await User.countDocuments({ status: "pending" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today },
    });

    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // Get registration trend for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      pendingUsers,
      newUsersToday,
      usersByRole,
      registrationTrend,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
});
// GET all banners
Adminrouter.get("/banners", async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch banners" });
  }
});

// POST create new banner(s)
Adminrouter.post(
  "/banners",
  uploadBanners.array("images", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ error: "Please upload at least one banner image" });
      }

      const banners = [];

      for (const file of req.files) {
        const bannerData = {
          name: req.body.name || `Banner ${Date.now()}`,
          image: `/uploads/banners/${file.filename}`,
          status: true,
        };

        const newBanner = new Banner(bannerData);
        const savedBanner = await newBanner.save();
        banners.push(savedBanner);
      }

      res.status(201).json({
        message: "Banners created successfully",
        banners: banners,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create banners" });
    }
  }
);

// PUT update banner status
Adminrouter.put("/banners/:id/status", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    banner.status = req.body.status;
    await banner.save();

    res.json({
      message: "Banner status updated successfully",
      banner: banner,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update banner status" });
  }
});

// PUT update banner
Adminrouter.put(
  "/banners/:id",
  uploadBanners.single("image"),
  async (req, res) => {
    try {
      const banner = await Banner.findById(req.params.id);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }

      // Update fields
      if (req.body.name) banner.name = req.body.name;
      if (req.file) {
        // Delete old image file
        if (banner.image) {
          const oldImagePath = path.join(__dirname, "..", banner.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        banner.image = `/uploads/banners/${req.file.filename}`;
      }

      await banner.save();

      res.json({
        message: "Banner updated successfully",
        banner: banner,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update banner" });
    }
  }
);

// DELETE banner
Adminrouter.delete("/banners/:id", async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    // Delete image file
    if (banner.image) {
      const imagePath = path.join(__dirname, "..", banner.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete banner" });
  }
});

// ==================== PROMOTIONAL CONTENT ROUTES ====================

// GET all promotional content
Adminrouter.get("/promotionals", async (req, res) => {
  try {
    const promotionals = await Promotional.find().sort({ createdAt: -1 });
    res.json(promotionals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch promotional content" });
  }
});

// GET single promotional content
Adminrouter.get("/promotionals/:id", async (req, res) => {
  try {
    const promotional = await Promotional.findById(req.params.id);
    if (!promotional) {
      return res.status(404).json({ error: "Promotional content not found" });
    }
    res.json(promotional);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch promotional content" });
  }
});

// POST create new promotional content
Adminrouter.post(
  "/promotionals",
  uploadPromotional.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Please upload an image" });
      }

      if (!req.body.title || !req.body.description) {
        return res
          .status(400)
          .json({ error: "Title and description are required" });
      }

      const promotionalData = {
        title: req.body.title,
        description: req.body.description,
        targetUrl: req.body.targetUrl || "",
        image: `/uploads/promotionals/${req.file.filename}`,
        status: req.body.status === "true" || req.body.status === true,
        startDate: req.body.startDate || new Date(),
        endDate: req.body.endDate || null,
      };

      const newPromotional = new Promotional(promotionalData);
      const savedPromotional = await newPromotional.save();

      res.status(201).json({
        message: "Promotional content created successfully",
        promotional: savedPromotional,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to create promotional content" });
    }
  }
);

// PUT update promotional content status
Adminrouter.put("/promotionals/:id/status", async (req, res) => {
  try {
    const promotional = await Promotional.findById(req.params.id);
    if (!promotional) {
      return res.status(404).json({ error: "Promotional content not found" });
    }

    promotional.status = req.body.status;
    await promotional.save();

    res.json({
      message: "Promotional content status updated successfully",
      promotional: promotional,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update promotional content status" });
  }
});

// PUT update promotional content
Adminrouter.put(
  "/promotionals/:id",
  uploadPromotional.single("image"),
  async (req, res) => {
    try {
      const promotional = await Promotional.findById(req.params.id);
      if (!promotional) {
        return res.status(404).json({ error: "Promotional content not found" });
      }

      // Update fields
      if (req.body.title) promotional.title = req.body.title;
      if (req.body.description) promotional.description = req.body.description;
      if (req.body.targetUrl !== undefined)
        promotional.targetUrl = req.body.targetUrl;
      if (req.body.startDate) promotional.startDate = req.body.startDate;
      if (req.body.endDate) promotional.endDate = req.body.endDate;
      if (req.body.status !== undefined) promotional.status = req.body.status;

      if (req.file) {
        // Delete old image file
        if (promotional.image) {
          const oldImagePath = path.join(__dirname, "..", promotional.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        promotional.image = `/uploads/promotionals/${req.file.filename}`;
      }

      await promotional.save();

      res.json({
        message: "Promotional content updated successfully",
        promotional: promotional,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update promotional content" });
    }
  }
);

// DELETE promotional content
Adminrouter.delete("/promotionals/:id", async (req, res) => {
  try {
    const promotional = await Promotional.findById(req.params.id);
    if (!promotional) {
      return res.status(404).json({ error: "Promotional content not found" });
    }

    // Delete image file
    if (promotional.image) {
      const imagePath = path.join(__dirname, "..", promotional.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Promotional.findByIdAndDelete(req.params.id);

    res.json({ message: "Promotional content deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete promotional content" });
  }
});

// ==================== TERMS AND CONDITIONS ROUTES ====================

// GET current terms and conditions
Adminrouter.get("/terms", async (req, res) => {
  try {
    let terms = await Terms.findOne();

    // If no terms exist, create a default one
    if (!terms) {
      terms = new Terms({
        title: "Terms and Conditions",
        content:
          "Please replace this with your actual terms and conditions content.",
        lastUpdated: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        currentVersion: "1.0",
      });
      await terms.save();
    }

    res.json(terms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch terms and conditions" });
  }
});

// GET terms version history
Adminrouter.get("/terms/history", async (req, res) => {
  try {
    const terms = await Terms.findOne().populate(
      "history.updatedBy",
      "name email"
    );

    if (!terms) {
      return res.status(404).json({ error: "Terms and conditions not found" });
    }

    res.json(terms.history.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch terms history" });
  }
});

// GET specific version of terms
Adminrouter.get("/terms/version/:versionId", async (req, res) => {
  try {
    const terms = await Terms.findOne({
      "history._id": req.params.versionId,
    });

    if (!terms) {
      return res.status(404).json({ error: "Version not found" });
    }

    const version = terms.history.id(req.params.versionId);
    res.json(version);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch terms version" });
  }
});

// PUT update terms and conditions
Adminrouter.put("/terms", async (req, res) => {
  try {
    const { title, content, lastUpdated } = req.body;

    if (!title || !content || !lastUpdated) {
      return res
        .status(400)
        .json({ error: "Title, content, and lastUpdated are required" });
    }

    let terms = await Terms.findOne();

    // If no terms exist, create a new one
    if (!terms) {
      terms = new Terms({
        title,
        content,
        lastUpdated,
        currentVersion: "1.0",
      });
    } else {
      // Add current version to history before updating
      terms.history.push({
        version: terms.currentVersion,
        title: terms.title,
        content: terms.content,
        lastUpdated: terms.lastUpdated,
      });

      // Update current terms
      terms.title = title;
      terms.content = content;
      terms.lastUpdated = lastUpdated;

      // Increment version number (e.g., from 1.0 to 1.1)
      const versionParts = terms.currentVersion.split(".");
      const minorVersion = parseInt(versionParts[1]) + 1;
      terms.currentVersion = `${versionParts[0]}.${minorVersion}`;
    }

    await terms.save();

    // Populate the updatedBy field for the response
    await terms.populate("history.updatedBy", "name email");

    res.json({
      message: "Terms and conditions updated successfully",
      terms,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update terms and conditions" });
  }
});

// POST restore a previous version
Adminrouter.post("/terms/restore/:versionId", async (req, res) => {
  try {
    const terms = await Terms.findOne({
      "history._id": req.params.versionId,
    });

    if (!terms) {
      return res.status(404).json({ error: "Version not found" });
    }

    const version = terms.history.id(req.params.versionId);

    // Add current version to history before restoring
    terms.history.push({
      version: terms.currentVersion,
      title: terms.title,
      content: terms.content,
      lastUpdated: terms.lastUpdated,
    });

    // Restore the selected version
    terms.title = version.title;
    terms.content = version.content;
    terms.lastUpdated = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Keep the same version format but mark as restored
    terms.currentVersion = `${version.version}r`;

    await terms.save();
    await terms.populate("history.updatedBy", "name email");

    res.json({
      message: "Terms and conditions restored successfully",
      terms,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to restore terms version" });
  }
});

// ==================== FAQ ROUTES ====================

// GET all FAQs with filtering options
Adminrouter.get("/faqs", async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (status !== undefined) {
      filter.status = status === "true";
    }

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    const faqs = await FAQ.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// GET single FAQ
Adminrouter.get("/faqs/:id", async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch FAQ" });
  }
});

// POST create new FAQ
Adminrouter.post("/faqs", async (req, res) => {
  try {
    const { question, answer, category, status, order } = req.body;

    if (!question || !answer || !category) {
      return res
        .status(400)
        .json({ error: "Question, answer, and category are required" });
    }

    const faqData = {
      question,
      answer,
      category,
      status: status !== undefined ? status : true,
      order: order || 0,
    };

    const newFaq = new FAQ(faqData);
    const savedFaq = await newFaq.save();

    res.status(201).json({
      message: "FAQ created successfully",
      faq: savedFaq,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create FAQ" });
  }
});

// PUT update FAQ
Adminrouter.put("/faqs/:id", async (req, res) => {
  try {
    const { question, answer, category, status, order } = req.body;

    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    // Update fields
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    if (category !== undefined) faq.category = category;
    if (status !== undefined) faq.status = status;
    if (order !== undefined) faq.order = order;

    await faq.save();

    res.json({
      message: "FAQ updated successfully",
      faq: faq,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update FAQ" });
  }
});

// PUT update FAQ status
Adminrouter.put("/faqs/:id/status", async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    faq.status = req.body.status;
    await faq.save();

    res.json({
      message: "FAQ status updated successfully",
      faq: faq,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update FAQ status" });
  }
});

// DELETE FAQ
Adminrouter.delete("/faqs/:id", async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: "FAQ not found" });
    }

    await FAQ.findByIdAndDelete(req.params.id);

    res.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
});

// PUT update FAQ order (bulk update)
Adminrouter.put("/faqs/order/update", async (req, res) => {
  try {
    const { faqs } = req.body;

    if (!faqs || !Array.isArray(faqs)) {
      return res.status(400).json({ error: "FAQs array is required" });
    }

    const bulkOps = faqs.map((faq, index) => ({
      updateOne: {
        filter: { _id: faq._id },
        update: { $set: { order: index } },
      },
    }));

    await FAQ.bulkWrite(bulkOps);

    res.json({ message: "FAQ order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update FAQ order" });
  }
});

// Configure multer for game category images
const gameCategoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/uploads/game-categories/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "game-category-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadGameCategory = multer({
  storage: gameCategoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// ==================== GAME CATEGORY ROUTES ====================

// GET all game categories
Adminrouter.get("/game-categories", async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    console.log("this is game status ");

    if (status !== undefined) {
      filter.status = status === "true";
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const categories = await GameCategory.find(filter).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game categories" });
  }
});

// GET single game category
Adminrouter.get("/game-categories/:id", async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Game category not found" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game category" });
  }
});

// POST create new game category
Adminrouter.post(
  "/game-categories",
  uploadGameCategory.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Please upload a category image" });
      }

      if (!req.body.name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const categoryData = {
        name: req.body.name.toLowerCase(),
        image: `/uploads/game-categories/${req.file.filename}`,
        status: req.body.status === "true" || req.body.status === true,
      };

      const newCategory = new GameCategory(categoryData);
      const savedCategory = await newCategory.save();

      res.status(201).json({
        message: "Game category created successfully",
        category: savedCategory,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Category name already exists" });
      }
      res.status(500).json({ error: "Failed to create game category" });
    }
  }
);

// PUT update game category
Adminrouter.put(
  "/game-categories/:id",
  uploadGameCategory.single("image"),
  async (req, res) => {
    try {
      const category = await GameCategory.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ error: "Game category not found" });
      }

      // Update fields
      if (req.body.name) category.name = req.body.name.toLowerCase();
      if (req.body.status !== undefined) category.status = req.body.status;

      if (req.file) {
        // Delete old image file
        if (category.image) {
          const oldImagePath = path.join(__dirname, "..", category.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        category.image = `/uploads/game-categories/${req.file.filename}`;
      }

      await category.save();

      res.json({
        message: "Game category updated successfully",
        category: category,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Category name already exists" });
      }
      res.status(500).json({ error: "Failed to update game category" });
    }
  }
);

// PUT update game category status
Adminrouter.put("/game-categories/:id/status", async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Game category not found" });
    }

    category.status = req.body.status;
    await category.save();

    res.json({
      message: "Game category status updated successfully",
      category: category,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update game category status" });
  }
});

// DELETE game category
Adminrouter.delete("/game-categories/:id", async (req, res) => {
  try {
    const category = await GameCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Game category not found" });
    }

    // Delete image file
    if (category.image) {
      const imagePath = path.join(__dirname, "..", category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await GameCategory.findByIdAndDelete(req.params.id);

    res.json({ message: "Game category deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete game category" });
  }
});

// PUT update game category order (bulk update)
Adminrouter.put("/game-categories/order/update", async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ error: "Categories array is required" });
    }

    const bulkOps = categories.map((category, index) => ({
      updateOne: {
        filter: { _id: category._id },
        update: { $set: { order: index } },
      },
    }));

    await GameCategory.bulkWrite(bulkOps);

    res.json({ message: "Game category order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update game category order" });
  }
});

// Configure multer for file uploads - Game Providers
const gameProviderStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/uploads/game-providers/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "game-provider-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadGameProvider = multer({
  storage: gameProviderStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// ==================== GAME PROVIDER ROUTES ====================

// GET all game providers
Adminrouter.get("/game-providers", async (req, res) => {
  try {
    const { status, search } = req.query;
    let filter = {};

    if (status !== undefined) {
      filter.status = status === "true";
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const providers = await GameProvider.find(filter).sort({
      order: 1,
      createdAt: -1,
    });
    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game providers" });
  }
});

// GET single game provider
Adminrouter.get("/game-providers/:id", async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: "Game provider not found" });
    }
    res.json(provider);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game provider" });
  }
});

// POST create new game provider
Adminrouter.post(
  "/game-providers",
  uploadGameProvider.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "Please upload a provider image" });
      }

      if (!req.body.name || !req.body.website || !req.body.providerOracleID) {
        return res.status(400).json({
          error: "Provider name, website and providerOracleID are required",
        });
      }

      const providerData = {
        name: req.body.name,
        website: req.body.website,
        providerOracleID: req.body.providerOracleID,
        image: `/uploads/game-providers/${req.file.filename}`,
        status: req.body.status === "true" || req.body.status === true,
        category: req.body.category,
      };

      const newProvider = new GameProvider(providerData);
      const savedProvider = await newProvider.save();

      res.status(201).json({
        message: "Game provider created successfully",
        provider: savedProvider,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Provider name already exists" });
      }
      res.status(500).json({ error: "Failed to create game provider" });
    }
  }
);

// PUT update game provider
Adminrouter.put(
  "/game-providers/:id",
  uploadGameProvider.single("image"),
  async (req, res) => {
    try {
      const provider = await GameProvider.findById(req.params.id);
      if (!provider) {
        return res.status(404).json({ error: "Game provider not found" });
      }

      // Update fields
      if (req.body.name) provider.name = req.body.name;
      if (req.body.website) provider.website = req.body.website;
      if (req.body.status !== undefined) provider.status = req.body.status;
      if (req.body.providerOracleID)
        provider.providerOracleID = req.body.providerOracleID;
      if (req.body.category) provider.category = req.body.category;

      if (req.file) {
        // Delete old image file
        if (provider.image) {
          const oldImagePath = path.join(__dirname, "..", provider.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        provider.image = `/uploads/game-providers/${req.file.filename}`;
      }

      await provider.save();

      res.json({
        message: "Game provider updated successfully",
        provider: provider,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: "Provider name already exists" });
      }
      res.status(500).json({ error: "Failed to update game provider" });
    }
  }
);

// PUT update game provider status
Adminrouter.put("/game-providers/:id/status", async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: "Game provider not found" });
    }

    provider.status = req.body.status;
    await provider.save();

    res.json({
      message: "Game provider status updated successfully",
      provider: provider,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update game provider status" });
  }
});

// DELETE game provider
Adminrouter.delete("/game-providers/:id", async (req, res) => {
  try {
    const provider = await GameProvider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ error: "Game provider not found" });
    }

    // Delete image file
    if (provider.image) {
      const imagePath = path.join(__dirname, "..", provider.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await GameProvider.findByIdAndDelete(req.params.id);

    res.json({ message: "Game provider deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete game provider" });
  }
});

// PUT update game provider order (bulk update)
Adminrouter.put("/game-providers/order/update", async (req, res) => {
  try {
    const { providers } = req.body;

    if (!providers || !Array.isArray(providers)) {
      return res.status(400).json({ error: "Providers array is required" });
    }

    const bulkOps = providers.map((provider, index) => ({
      updateOne: {
        filter: { _id: provider._id },
        update: { $set: { order: index } },
      },
    }));

    await GameProvider.bulkWrite(bulkOps);

    res.json({ message: "Game provider order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update game provider order" });
  }
});

const Game = require("../models/Game");
// const User = require("../models/User");
const Deposit = require("../models/Deposit");

// Configure multer for game images
const gameStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = file.fieldname === "portraitImage" ? "portrait" : "landscape";
    const uploadPath = `./public/uploads/games/${type}/`;

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const type = file.fieldname === "portraitImage" ? "portrait" : "landscape";
    cb(null, `game-${type}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadGameImages = multer({
  storage: gameStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
  fileFilter: fileFilter,
});

// ==================== GAME ROUTES ====================

// GET all games with filtering and pagination
Adminrouter.get("/games", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      provider,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status !== undefined) {
      filter.status = status === "true";
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (provider && provider !== "all") {
      filter.provider = provider;
    }

    if (search) {
      filter.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get games with pagination
    const games = await Game.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Game.countDocuments(filter);

    res.json({
      games,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

Adminrouter.get("/games/all", async (req, res) => {
  try {
    const games = await Game.find({}).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch games" });
  }
});

// GET single game
Adminrouter.get("/games/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// GET game by gameId
Adminrouter.get("/games/gameId/:gameId", async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    res.json(game);
  } catch (error) {
    console.error("Error fetching game by ID:", error);
    res.status(500).json({ error: "Failed to fetch game" });
  }
});

// POST create new game
Adminrouter.post(
  "/games",
  uploadGameImages.fields([
    { name: "portraitImage", maxCount: 1 },
    { name: "landscapeImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, provider, featured, status, gameApiID } = req.body;

      const gameProviderFont = await GameProvider.findOne({ name: provider });
      if (!gameProviderFont) {
        return res.status(400).json({ error: "Game provider font not found" });
      }

      let category = gameProviderFont.category;

      console.log(name, provider, category, featured, status, gameApiID);

      // Validation
      if (!name || !provider || !category || !gameApiID) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (!req.files || !req.files.portraitImage || !req.files.landscapeImage) {
        return res
          .status(400)
          .json({ error: "Both portrait and landscape images are required" });
      }

      // Check if gameId already exists
      // const existingGame = await Game.findOne({ gameId });
      // if (existingGame) {
      //   return res.status(400).json({ error: "Game ID already exists" });
      // }

      const gameData = {
        name,
        gameId:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        provider,
        category,
        portraitImage: `/uploads/games/portrait/${req.files.portraitImage[0].filename}`,
        landscapeImage: `/uploads/games/landscape/${req.files.landscapeImage[0].filename}`,
        featured: featured === "true" || featured === true,
        status: status !== undefined ? status : true,
        gameApiID,
      };

      const newGame = new Game(gameData);
      const savedGame = await newGame.save();

      res.status(201).json({
        message: "Game created successfully",
        game: savedGame,
      });
    } catch (error) {
      console.error("Error creating game:", error);
      if (error.code === 11000) {
        return res
          .status(400)
          .json({ error: "A game with this Game API ID already exists." });
      }
      res.status(500).json({ error: "Failed to create game" });
    }
  }
);

// PUT update game
Adminrouter.put(
  "/games/:id",
  uploadGameImages.fields([
    { name: "portraitImage", maxCount: 1 },
    { name: "landscapeImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const game = await Game.findById(req.params.id);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Update fields
      if (req.body.name) game.name = req.body.name;
      if (req.body.gameApiID) {
        // Check if new gameApiID already exists (excluding current game)
        const existingGame = await Game.findOne({
          gameApiID: req.body.gameApiID,
          _id: { $ne: req.params.id },
        });
        if (existingGame) {
          return res.status(400).json({ error: "Game API ID already exists" });
        }
        game.gameApiID = req.body.gameApiID;
      }
      if (req.body.provider) game.provider = req.body.provider;
      if (req.body.category) game.category = req.body.category;
      if (req.body.featured !== undefined) game.featured = req.body.featured;
      if (req.body.status !== undefined) game.status = req.body.status;

      // Handle portrait image update
      if (req.files && req.files.portraitImage) {
        // Delete old portrait image
        if (game.portraitImage) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            game.portraitImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        game.portraitImage = `/uploads/games/portrait/${req.files.portraitImage[0].filename}`;
      }

      // Handle landscape image update
      if (req.files && req.files.landscapeImage) {
        // Delete old landscape image
        if (game.landscapeImage) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            game.landscapeImage
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        game.landscapeImage = `/uploads/games/landscape/${req.files.landscapeImage[0].filename}`;
      }

      await game.save();

      res.json({
        message: "Game updated successfully",
        game: game,
      });
    } catch (error) {
      console.error("Error updating game:", error);
      if (error.code === 11000) {
        return res.status(400).json({ error: "Game API ID already exists" });
      }
      res.status(500).json({ error: "Failed to update game" });
    }
  }
);

// PUT update game status
Adminrouter.put("/games/:id/status", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    game.status = req.body.status;
    await game.save();

    res.json({
      message: "Game status updated successfully",
      game: game,
    });
  } catch (error) {
    console.error("Error updating game status:", error);
    res.status(500).json({ error: "Failed to update game status" });
  }
});

// PUT update game featured status
Adminrouter.put("/games/:id/featured", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    game.featured = req.body.featured;
    await game.save();

    res.json({
      message: "Game featured status updated successfully",
      game: game,
    });
  } catch (error) {
    console.error("Error updating game featured status:", error);
    res.status(500).json({ error: "Failed to update game featured status" });
  }
});

// DELETE game
Adminrouter.delete("/games/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    // Delete image files
    if (game.portraitImage) {
      const portraitPath = path.join(__dirname, "..", game.portraitImage);
      if (fs.existsSync(portraitPath)) {
        fs.unlinkSync(portraitPath);
      }
    }

    if (game.landscapeImage) {
      const landscapePath = path.join(__dirname, "..", game.landscapeImage);
      if (fs.existsSync(landscapePath)) {
        fs.unlinkSync(landscapePath);
      }
    }

    await Game.findByIdAndDelete(req.params.id);

    res.json({ message: "Game deleted successfully" });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({ error: "Failed to delete game" });
  }
});

// GET game categories for dropdown
Adminrouter.get("/games/categories/list", async (req, res) => {
  try {
    const categories = await Game.distinct("category", { status: true });
    res.json(categories.sort());
  } catch (error) {
    console.error("Error fetching game categories:", error);
    res.status(500).json({ error: "Failed to fetch game categories" });
  }
});

// GET game providers for dropdown
Adminrouter.get("/games/providers/list", async (req, res) => {
  try {
    const providers = await Game.distinct("provider", { status: true });
    res.json(providers.sort());
  } catch (error) {
    console.error("Error fetching game providers:", error);
    res.status(500).json({ error: "Failed to fetch game providers" });
  }
});

// PUT update game order (bulk update)
Adminrouter.put("/games/order/update", async (req, res) => {
  try {
    const { games } = req.body;

    if (!games || !Array.isArray(games)) {
      return res.status(400).json({ error: "Games array is required" });
    }

    const bulkOps = games.map((game, index) => ({
      updateOne: {
        filter: { _id: game._id },
        update: { $set: { order: index } },
      },
    }));

    await Game.bulkWrite(bulkOps);

    res.json({ message: "Game order updated successfully" });
  } catch (error) {
    console.error("Error updating game order:", error);
    res.status(500).json({ error: "Failed to update game order" });
  }
});

// create this router

Adminrouter.post("/getGameLink", async (req, res) => {
  try {
    const { username, money, gameID } = req.body;
    console.log(req.body);
    // ?  for game baji
    const postData = {
      home_url: "https://gamebaji71.com",
      token: "99a6ebbc83c0e30c9a0c5237f3d907bd",
      username: username + "45",
      money: money,
      gameid: req.body.gameID,
    };
    // ? for trickboy.xyz
    // const postData = {
    //   home_url: "https://trickboy.xyz",
    //   token: "bf5891d45c356824ba6df15c9c15575d",
    //   username: username + "45",
    //   money: money,
    //   gameid: req.body.gameID,
    // };

    // x-dstgame-key
    // 'x-dstgame-key: yourlicensekey'
    console.log("Sending POST request to joyhobe.com with data:", postData);
    // POST রিভোয়েস্ট
    const response = await axios.post(
      "https://dstplay.net/getgameurl",
      qs.stringify(postData),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-dstgame-key": postData.token,
        },
      }
    );
    console.log(
      "Response from dstplay.com:",
      response.data,
      "Status:",
      response.status
    );
    res.status(200).json({
      message: "POST request successful",
      joyhobeResponse: response.data,
    });
  } catch (error) {
    console.error("Error in POST /api/test/game:", error);
    res.status(500).json({
      error: "Failed to forward POST request",
      details: error.message,
    });
  }
});

// ==================== DEPOSIT MANAGEMENT ROUTES ====================

// GET all deposits with filtering, pagination, and search
Adminrouter.get("/deposits", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (method && method !== "all") {
      filter.method = method;
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { "userId.username": { $regex: search, $options: "i" } },
        { "userId.player_id": { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get deposits with pagination and populate user info
    const deposits = await Deposit.find(filter)
      .populate("userId", "username player_id phone email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Deposit.countDocuments(filter);

    // Get summary statistics
    const totalAmount = await Deposit.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const statusCounts = await Deposit.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      deposits,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      statusCounts,
    });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).json({ error: "Failed to fetch deposits" });
  }
});

// GET single deposit by ID
Adminrouter.get("/deposits/:id", async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id).populate(
      "userId",
      "username player_id phone email balance"
    );

    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    res.json(deposit);
  } catch (error) {
    console.error("Error fetching deposit:", error);
    res.status(500).json({ error: "Failed to fetch deposit" });
  }
});

// PUT update deposit status
Adminrouter.put("/deposits/:id/status", async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (
      !status ||
      !["pending", "approved", "rejected", "cancelled", "completed"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const deposit = await Deposit.findById(req.params.id).populate(
      "userId",
      "username player_id balance"
    );

    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    // Store old status for potential rollback
    const oldStatus = deposit.status;

    // Update deposit status
    deposit.status = status;
    deposit.processedAt = new Date();

    if (adminNotes) {
      deposit.adminNotes = adminNotes;
    }

    // If status is being approved, update user balance
    if (status === "completed" && oldStatus !== "completed") {
      const user = await User.findById(deposit.userId._id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user balance
      user.balance += deposit.amount;
      user.total_deposit=deposit.amount;
      // Add to deposit history
      user.depositHistory.push({
        method: deposit.method,
        amount: deposit.amount,
        date: new Date(),
        status: "completed",
        transactionId: deposit.transactionId,
      });

      // Add transaction history
      user.transactionHistory.push({
        type: "deposit",
        amount: deposit.amount,
        balanceBefore: user.balance - deposit.amount,
        balanceAfter: user.balance,
        description: `Deposit via ${deposit.method} - Approved by admin`,
        referenceId: deposit._id.toString(),
      });

      await user.save();
    }

    // If status is being reverted from approved, deduct the balance
    if (oldStatus === "completed" && status !== "completed") {
      const user = await User.findById(deposit.userId._id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has sufficient balance
      if (user.balance < deposit.amount) {
        return res.status(400).json({
          error: "User has insufficient balance to reverse this deposit",
        });
      }

      // Deduct the balance
      user.balance -= deposit.amount;

      // Update deposit history status
      const depositEntry = user.depositHistory.find(
        (d) => d.transactionId === deposit.transactionId
      );

      if (depositEntry) {
        depositEntry.status = status;
      }

      // Add transaction history for reversal
      user.transactionHistory.push({
        type: "adjustment",
        amount: -deposit.amount,
        balanceBefore: user.balance + deposit.amount,
        balanceAfter: user.balance,
        description: `Deposit reversal - Status changed to ${status}`,
        referenceId: deposit._id.toString(),
      });

      await user.save();
    }

    await deposit.save();

    res.json({
      message: "Deposit status updated successfully",
      deposit,
    });
  } catch (error) {
    console.error("Error updating deposit status:", error);
    res.status(500).json({ error: "Failed to update deposit status" });
  }
});

// PUT update deposit information
Adminrouter.put("/deposits/:id", async (req, res) => {
  try {
    const { amount, method, phoneNumber, transactionId, adminNotes } = req.body;

    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    // Store old values for potential rollback
    const oldAmount = deposit.amount;
    const oldStatus = deposit.status;

    // Update fields
    if (amount !== undefined) deposit.amount = amount;
    if (method) deposit.method = method;
    if (phoneNumber !== undefined) deposit.phoneNumber = phoneNumber;
    if (transactionId !== undefined) deposit.transactionId = transactionId;
    if (adminNotes !== undefined) deposit.adminNotes = adminNotes;

    // If deposit was already approved and amount changed, adjust user balance
    if (
      oldStatus === "approved" &&
      amount !== undefined &&
      amount !== oldAmount
    ) {
      const user = await User.findById(deposit.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const amountDifference = amount - oldAmount;

      // Check if user has sufficient balance for deduction
      if (amountDifference < 0 && user.balance < Math.abs(amountDifference)) {
        return res
          .status(400)
          .json({ error: "User has insufficient balance for this adjustment" });
      }

      // Update user balance
      user.balance += amountDifference;

      // Update deposit history
      const depositEntry = user.depositHistory.find(
        (d) => d.transactionId === deposit.transactionId
      );

      if (depositEntry) {
        depositEntry.amount = amount;
      }

      // Add transaction history for adjustment
      user.transactionHistory.push({
        type: "adjustment",
        amount: amountDifference,
        balanceBefore: user.balance - amountDifference,
        balanceAfter: user.balance,
        description: `Deposit amount adjusted from ${oldAmount} to ${amount}`,
        referenceId: deposit._id.toString(),
      });

      await user.save();
    }

    await deposit.save();

    res.json({
      message: "Deposit updated successfully",
      deposit,
    });
  } catch (error) {
    console.error("Error updating deposit:", error);
    res.status(500).json({ error: "Failed to update deposit" });
  }
});

// DELETE deposit
Adminrouter.delete("/deposits/:id", async (req, res) => {
  try {
    const deposit = await Deposit.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }

    // If deposit was approved, deduct the amount from user balance
    if (deposit.status === "approved") {
      const user = await User.findById(deposit.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check if user has sufficient balance
      if (user.balance < deposit.amount) {
        return res.status(400).json({
          error: "User has insufficient balance to delete this deposit",
        });
      }

      // Deduct the balance
      user.balance -= deposit.amount;

      // Remove from deposit history
      user.depositHistory = user.depositHistory.filter(
        (d) => d.transactionId !== deposit.transactionId
      );

      // Add transaction history for deletion
      user.transactionHistory.push({
        type: "adjustment",
        amount: -deposit.amount,
        balanceBefore: user.balance + deposit.amount,
        balanceAfter: user.balance,
        description: `Deposit deleted by admin`,
        referenceId: deposit._id.toString(),
      });

      await user.save();
    }

    await Deposit.findByIdAndDelete(req.params.id);

    res.json({ message: "Deposit deleted successfully" });
  } catch (error) {
    console.error("Error deleting deposit:", error);
    res.status(500).json({ error: "Failed to delete deposit" });
  }
});

// GET deposit statistics
Adminrouter.get("/deposits-stats", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total deposits count and amount
    const totalStats = await Deposit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" },
        },
      },
    ]);

    // Status counts
    const statusStats = await Deposit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    // Method counts
    const methodStats = await Deposit.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    // Daily deposits for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Deposit.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      total: totalStats[0] || {
        totalCount: 0,
        totalAmount: 0,
        averageAmount: 0,
      },
      byStatus: statusStats,
      byMethod: methodStats,
      daily: dailyStats,
    });
  } catch (error) {
    console.error("Error fetching deposit stats:", error);
    res.status(500).json({ error: "Failed to fetch deposit statistics" });
  }
});

// GET deposits by user ID
Adminrouter.get("/users/:userId/deposits", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    let filter = { userId };

    if (status && status !== "all") {
      filter.status = status;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get deposits with pagination
    const deposits = await Deposit.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Deposit.countDocuments(filter);

    // Get user information
    const user = await User.findById(userId).select("username player_id");

    res.json({
      deposits,
      user,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching user deposits:", error);
    res.status(500).json({ error: "Failed to fetch user deposits" });
  }
});

// POST create manual deposit (admin initiated)
Adminrouter.post("/deposits/manual", async (req, res) => {
  try {
    const { userId, amount, method, phoneNumber, transactionId, notes } =
      req.body;

    // Validation
    if (!userId || !amount || !method) {
      return res
        .status(400)
        .json({ error: "User ID, amount, and method are required" });
    }

    if (amount < 300) {
      return res.status(400).json({ error: "Minimum deposit amount is ৳300" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create deposit record
    const depositData = {
      userId,
      amount,
      method,
      phoneNumber: phoneNumber || user.phone,
      transactionId: transactionId || `MANUAL-${Date.now()}`,
      status: "approved", // Auto-approve manual deposits
      adminNotes: notes || "Manual deposit created by admin",
      processedAt: new Date(),
    };

    const newDeposit = new Deposit(depositData);
    await newDeposit.save();

    // Update user balance
    user.balance += amount;

    // Add to deposit history
    user.depositHistory.push({
      method,
      amount,
      date: new Date(),
      status: "completed",
      transactionId: newDeposit.transactionId,
    });

    // Add transaction history
    user.transactionHistory.push({
      type: "deposit",
      amount,
      balanceBefore: user.balance - amount,
      balanceAfter: user.balance,
      description: `Manual deposit via ${method} - Created by admin`,
      referenceId: newDeposit._id.toString(),
    });

    await user.save();

    res.status(201).json({
      message: "Manual deposit created successfully",
      deposit: newDeposit,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error creating manual deposit:", error);
    res.status(500).json({ error: "Failed to create manual deposit" });
  }
});

// Export deposits to CSV
Adminrouter.get("/deposits/export", async (req, res) => {
  try {
    const { startDate, endDate, status, method } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (method && method !== "all") {
      filter.method = method;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const deposits = await Deposit.find(filter)
      .populate("userId", "username player_id")
      .sort({ createdAt: -1 });

    // Convert to CSV format
    let csv =
      "Date,Username,Player ID,Method,Amount,Status,Transaction ID,Phone Number\n";

    deposits.forEach((deposit) => {
      csv += `"${new Date(deposit.createdAt).toISOString()}","${
        deposit.userId.username
      }","${deposit.userId.player_id}","${deposit.method}","${
        deposit.amount
      }","${deposit.status}","${deposit.transactionId || "N/A"}","${
        deposit.phoneNumber || "N/A"
      }"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=deposits-export.csv"
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting deposits:", error);
    res.status(500).json({ error: "Failed to export deposits" });
  }
});

const Withdrawal = require("../models/Withdrawal");

// ==================== WITHDRAWAL MANAGEMENT ROUTES ====================

// GET all withdrawals with filtering, pagination, and search
Adminrouter.get("/withdrawals", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      method,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (method && method !== "all") {
      filter.method = method;
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { "userId.username": { $regex: search, $options: "i" } },
        { "userId.player_id": { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get withdrawals with pagination and populate user info
    const withdrawals = await Withdrawal.find(filter)
      .populate("userId", "username player_id phone email balance")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Withdrawal.countDocuments(filter);

    // Get summary statistics
    const totalAmount = await Withdrawal.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const statusCounts = await Withdrawal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      withdrawals,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      statusCounts,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    res.status(500).json({ error: "Failed to fetch withdrawals" });
  }
});

// GET single withdrawal by ID
Adminrouter.get("/withdrawals/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id).populate(
      "userId",
      "username player_id phone email balance"
    );

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    res.json(withdrawal);
  } catch (error) {
    console.error("Error fetching withdrawal:", error);
    res.status(500).json({ error: "Failed to fetch withdrawal" });
  }
});

// PUT update withdrawal status
Adminrouter.put("/withdrawals/:id/status", async (req, res) => {
  try {
    const { status, transactionId, adminNotes } = req.body;

    if (
      !status ||
      !["pending", "processing", "completed", "failed", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const withdrawal = await Withdrawal.findById(req.params.id).populate(
      "userId",
      "username player_id balance"
    );

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    // Store old status for potential rollback
    const oldStatus = withdrawal.status;

    // Update withdrawal status
    withdrawal.status = status;

    if (status === "processing" || status === "completed") {
      withdrawal.processedAt = new Date();
    }

    if (transactionId) {
      withdrawal.transactionId = transactionId;
    }

    if (adminNotes) {
      withdrawal.adminNotes = adminNotes;
    }

    // If status is being completed, update transaction ID if provided
    if (status === "completed" && transactionId) {
      withdrawal.transactionId = transactionId;
    }

    // If status is being changed from completed to something else, refund the amount
    if (oldStatus === "completed" && status !== "completed") {
      const user = await User.findById(withdrawal.userId._id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Refund the amount to user balance
      user.balance += withdrawal.amount;

      // Update withdrawal history status
      const withdrawalEntry = user.withdrawHistory.find(
        (w) => w._id.toString() === withdrawal._id.toString()
      );

      if (withdrawalEntry) {
        withdrawalEntry.status = status;
      }

      // Add transaction history for refund
      user.transactionHistory.push({
        type: "refund",
        amount: withdrawal.amount,
        balanceBefore: user.balance - withdrawal.amount,
        balanceAfter: user.balance,
        description: `Withdrawal refund - Status changed from completed to ${status}`,
        referenceId: withdrawal._id.toString(),
      });

      await user.save();
    }

    // If status is being changed to completed, ensure the amount was already deducted
    if (status === "completed" && oldStatus !== "completed") {
      const user = await User.findById(withdrawal.userId._id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify that the amount was already deducted from user balance
      // (This should have happened when the withdrawal was created)
      if (user.balance + withdrawal.amount > user.originalBalance) {
        // If not deducted properly, deduct it now
        user.balance -= withdrawal.amount;

        // Add transaction history for correction
        user.transactionHistory.push({
          type: "correction",
          amount: -withdrawal.amount,
          balanceBefore: user.balance + withdrawal.amount,
          balanceAfter: user.balance,
          description: `Withdrawal amount correction - Status changed to completed`,
          referenceId: withdrawal._id.toString(),
        });

        await user.save();
      }

      // Update withdrawal history status
      const withdrawalEntry = user.withdrawHistory.find(
        (w) => w._id.toString() === withdrawal._id.toString()
      );

      if (withdrawalEntry) {
        withdrawalEntry.status = "completed";
        withdrawalEntry.processedAt = new Date();
      }
    }

    await withdrawal.save();

    res.json({
      message: "Withdrawal status updated successfully",
      withdrawal,
    });
  } catch (error) {
    console.error("Error updating withdrawal status:", error);
    res.status(500).json({ error: "Failed to update withdrawal status" });
  }
});

// PUT update withdrawal information
Adminrouter.put("/withdrawals/:id", async (req, res) => {
  try {
    const { amount, method, phoneNumber, transactionId, adminNotes } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    // Store old values for potential rollback
    const oldAmount = withdrawal.amount;
    const oldStatus = withdrawal.status;

    // Update fields
    if (amount !== undefined) withdrawal.amount = amount;
    if (method) withdrawal.method = method;
    if (phoneNumber !== undefined) withdrawal.phoneNumber = phoneNumber;
    if (transactionId !== undefined) withdrawal.transactionId = transactionId;
    if (adminNotes !== undefined) withdrawal.adminNotes = adminNotes;

    // If withdrawal was already completed and amount changed, adjust user balance
    if (
      oldStatus === "completed" &&
      amount !== undefined &&
      amount !== oldAmount
    ) {
      const user = await User.findById(withdrawal.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const amountDifference = amount - oldAmount;

      // For completed withdrawals, increasing amount means deducting more from user
      // Decreasing amount means refunding the difference

      if (amountDifference > 0) {
        // Check if user has sufficient balance for additional deduction
        if (user.balance < amountDifference) {
          return res.status(400).json({
            error: "User has insufficient balance for this adjustment",
          });
        }

        // Deduct additional amount
        user.balance -= amountDifference;
      } else {
        // Refund the difference
        user.balance += Math.abs(amountDifference);
      }

      // Update withdrawal history
      const withdrawalEntry = user.withdrawHistory.find(
        (w) => w._id.toString() === withdrawal._id.toString()
      );

      if (withdrawalEntry) {
        withdrawalEntry.amount = amount;
      }

      // Add transaction history for adjustment
      user.transactionHistory.push({
        type: "adjustment",
        amount: -amountDifference, // Negative if deducting, positive if refunding
        balanceBefore: user.balance + amountDifference,
        balanceAfter: user.balance,
        description: `Withdrawal amount adjusted from ${oldAmount} to ${amount}`,
        referenceId: withdrawal._id.toString(),
      });

      await user.save();
    }

    await withdrawal.save();

    res.json({
      message: "Withdrawal updated successfully",
      withdrawal,
    });
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    res.status(500).json({ error: "Failed to update withdrawal" });
  }
});

// DELETE withdrawal
Adminrouter.delete("/withdrawals/:id", async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    // If withdrawal was completed, refund the amount to user balance
    if (withdrawal.status === "completed") {
      const user = await User.findById(withdrawal.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Refund the amount
      user.balance += withdrawal.amount;

      // Remove from withdrawal history
      user.withdrawHistory = user.withdrawHistory.filter(
        (w) => w._id.toString() !== withdrawal._id.toString()
      );

      // Add transaction history for refund
      user.transactionHistory.push({
        type: "refund",
        amount: withdrawal.amount,
        balanceBefore: user.balance - withdrawal.amount,
        balanceAfter: user.balance,
        description: `Withdrawal deleted by admin - Amount refunded`,
        referenceId: withdrawal._id.toString(),
      });

      await user.save();
    }

    await Withdrawal.findByIdAndDelete(req.params.id);

    res.json({ message: "Withdrawal deleted successfully" });
  } catch (error) {
    console.error("Error deleting withdrawal:", error);
    res.status(500).json({ error: "Failed to delete withdrawal" });
  }
});

// GET withdrawal statistics
Adminrouter.get("/withdrawals-stats", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total withdrawals count and amount
    const totalStats = await Withdrawal.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          averageAmount: { $avg: "$amount" },
        },
      },
    ]);

    // Status counts
    const statusStats = await Withdrawal.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    // Method counts
    const methodStats = await Withdrawal.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$method",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    // Daily withdrawals for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Withdrawal.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      total: totalStats[0] || {
        totalCount: 0,
        totalAmount: 0,
        averageAmount: 0,
      },
      byStatus: statusStats,
      byMethod: methodStats,
      daily: dailyStats,
    });
  } catch (error) {
    console.error("Error fetching withdrawal stats:", error);
    res.status(500).json({ error: "Failed to fetch withdrawal statistics" });
  }
});

// GET withdrawals by user ID
Adminrouter.get("/users/:userId/withdrawals", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    let filter = { userId };

    if (status && status !== "all") {
      filter.status = status;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get withdrawals with pagination
    const withdrawals = await Withdrawal.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Withdrawal.countDocuments(filter);

    // Get user information
    const user = await User.findById(userId).select(
      "username player_id balance"
    );

    res.json({
      withdrawals,
      user,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching user withdrawals:", error);
    res.status(500).json({ error: "Failed to fetch user withdrawals" });
  }
});

// POST create manual withdrawal (admin initiated)
Adminrouter.post("/withdrawals/manual", async (req, res) => {
  try {
    const { userId, amount, method, phoneNumber, transactionId, notes } =
      req.body;

    // Validation
    if (!userId || !amount || !method || !phoneNumber) {
      return res.status(400).json({
        error: "User ID, amount, method, and phone number are required",
      });
    }

    if (amount < 100) {
      return res
        .status(400)
        .json({ error: "Minimum withdrawal amount is ৳100" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ error: "User has insufficient balance" });
    }

    // Create withdrawal record
    const withdrawalData = {
      userId,
      amount,
      method,
      phoneNumber,
      transactionId: transactionId || `MANUAL-${Date.now()}`,
      status: "completed", // Auto-complete manual withdrawals
      adminNotes: notes || "Manual withdrawal created by admin",
      processedAt: new Date(),
    };

    const newWithdrawal = new Withdrawal(withdrawalData);
    await newWithdrawal.save();

    // Update user balance (deduct the amount)
    user.balance -= amount;

    // Add to withdrawal history
    user.withdrawHistory.push({
      method,
      amount,
      date: new Date(),
      status: "completed",
      phoneNumber,
      processedAt: new Date(),
    });

    // Add transaction history
    user.transactionHistory.push({
      type: "withdrawal",
      amount: -amount,
      balanceBefore: user.balance + amount,
      balanceAfter: user.balance,
      description: `Manual withdrawal via ${method} - Created by admin`,
      referenceId: newWithdrawal._id.toString(),
    });

    await user.save();

    res.status(201).json({
      message: "Manual withdrawal created successfully",
      withdrawal: newWithdrawal,
      newBalance: user.balance,
    });
  } catch (error) {
    console.error("Error creating manual withdrawal:", error);
    res.status(500).json({ error: "Failed to create manual withdrawal" });
  }
});

// Export withdrawals to CSV
Adminrouter.get("/withdrawals/export", async (req, res) => {
  try {
    const { startDate, endDate, status, method } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (method && method !== "all") {
      filter.method = method;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const withdrawals = await Withdrawal.find(filter)
      .populate("userId", "username player_id")
      .sort({ createdAt: -1 });

    // Convert to CSV format
    let csv =
      "Date,Username,Player ID,Method,Amount,Status,Transaction ID,Phone Number,Processed At\n";

    withdrawals.forEach((withdrawal) => {
      csv += `"${new Date(withdrawal.createdAt).toISOString()}","${
        withdrawal.userId.username
      }","${withdrawal.userId.player_id}","${withdrawal.method}","${
        withdrawal.amount
      }","${withdrawal.status}","${withdrawal.transactionId || "N/A"}","${
        withdrawal.phoneNumber || "N/A"
      }","${
        withdrawal.processedAt
          ? new Date(withdrawal.processedAt).toISOString()
          : "N/A"
      }"\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=withdrawals-export.csv"
    );
    res.send(csv);
  } catch (error) {
    console.error("Error exporting withdrawals:", error);
    res.status(500).json({ error: "Failed to export withdrawals" });
  }
});

// GET pending withdrawals count for notifications
Adminrouter.get("/withdrawals/pending/count", async (req, res) => {
  try {
    const pendingCount = await Withdrawal.countDocuments({ status: "pending" });

    res.json({
      pendingCount,
    });
  } catch (error) {
    console.error("Error fetching pending withdrawals count:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch pending withdrawals count" });
  }
});

// PUT bulk update withdrawal status
Adminrouter.put("/withdrawals/bulk/status", async (req, res) => {
  try {
    const { withdrawalIds, status, adminNotes } = req.body;

    if (
      !withdrawalIds ||
      !Array.isArray(withdrawalIds) ||
      withdrawalIds.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Withdrawal IDs array is required" });
    }

    if (
      !status ||
      !["pending", "processing", "completed", "failed", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const result = await Withdrawal.updateMany(
      { _id: { $in: withdrawalIds } },
      {
        status,
        ...(status === "processing" || status === "completed"
          ? { processedAt: new Date() }
          : {}),
        ...(adminNotes ? { adminNotes } : {}),
      }
    );

    res.json({
      message: `Updated ${result.modifiedCount} withdrawal(s) to ${status} status`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error bulk updating withdrawal status:", error);
    res.status(500).json({ error: "Failed to bulk update withdrawal status" });
  }
});

// Configure multer for branding uploads
const brandingStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = file.fieldname === "logo" ? "logo" : "favicon";
    const uploadPath = `./public/uploads/branding/${type}/`;

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const type = file.fieldname === "logo" ? "logo" : "favicon";
    cb(
      null,
      `branding-${type}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const uploadBranding = multer({
  storage: brandingStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
  },
  fileFilter: fileFilter,
});

// Import the Branding model at the top of your file
const Branding = require("../models/Branding");

// ==================== BRANDING ROUTES ====================

// GET current branding
Adminrouter.get("/branding", async (req, res) => {
  try {
    const branding = await Branding.getCurrentBranding();

    // If no branding exists, return default structure
    if (!branding) {
      return res.json({
        logo: null,
        favicon: null,
        lastUpdated: null,
      });
    }

    res.json(branding);
  } catch (error) {
    console.error("Error fetching branding:", error);
    res.status(500).json({ error: "Failed to fetch branding" });
  }
});

// POST upload logo and/or favicon
Adminrouter.post(
  "/upload-branding",
  uploadBranding.fields([
    { name: "logo", maxCount: 1 },
    { name: "favicon", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Get current branding or create new one
      let branding = await Branding.getCurrentBranding();

      if (!branding) {
        branding = new Branding();
      }

      // Handle logo upload
      if (req.files && req.files.logo) {
        // Delete old logo file if exists
        if (branding.logo) {
          const oldLogoPath = path.join(__dirname, "..", branding.logo);
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
        branding.logo = `/uploads/branding/logo/${req.files.logo[0].filename}`;
      }

      // Handle favicon upload
      if (req.files && req.files.favicon) {
        // Delete old favicon file if exists
        if (branding.favicon) {
          const oldFaviconPath = path.join(__dirname, "..", branding.favicon);
          if (fs.existsSync(oldFaviconPath)) {
            fs.unlinkSync(oldFaviconPath);
          }
        }
        branding.favicon = `/uploads/branding/favicon/${req.files.favicon[0].filename}`;
      }

      branding.lastUpdated = new Date();
      // If you have user authentication, set updatedBy: req.user._id

      await branding.save();

      res.json({
        message: "Branding updated successfully",
        branding: branding,
      });
    } catch (error) {
      console.error("Error uploading branding:", error);
      res.status(500).json({ error: "Failed to upload branding" });
    }
  }
);

// DELETE logo
Adminrouter.delete("/branding/logo", async (req, res) => {
  try {
    const branding = await Branding.getCurrentBranding();

    if (!branding || !branding.logo) {
      return res.status(404).json({ error: "Logo not found" });
    }

    // Delete logo file
    const logoPath = path.join(__dirname, "..", branding.logo);
    if (fs.existsSync(logoPath)) {
      fs.unlinkSync(logoPath);
    }

    branding.logo = null;
    branding.lastUpdated = new Date();
    await branding.save();

    res.json({ message: "Logo deleted successfully" });
  } catch (error) {
    console.error("Error deleting logo:", error);
    res.status(500).json({ error: "Failed to delete logo" });
  }
});

// DELETE favicon
Adminrouter.delete("/branding/favicon", async (req, res) => {
  try {
    const branding = await Branding.getCurrentBranding();

    if (!branding || !branding.favicon) {
      return res.status(404).json({ error: "Favicon not found" });
    }

    // Delete favicon file
    const faviconPath = path.join(__dirname, "..", branding.favicon);
    if (fs.existsSync(faviconPath)) {
      fs.unlinkSync(faviconPath);
    }

    branding.favicon = null;
    branding.lastUpdated = new Date();
    await branding.save();

    res.json({ message: "Favicon deleted successfully" });
  } catch (error) {
    console.error("Error deleting favicon:", error);
    res.status(500).json({ error: "Failed to delete favicon" });
  }
});

const Notification = require("../models/Notification");

// ==================== NOTIFICATION ROUTES ====================

// GET all notifications with filtering and pagination
Adminrouter.get("/notifications", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      targetType,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (targetType && targetType !== "all") {
      filter.targetType = targetType;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get notifications with pagination
    const notifications = await Notification.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("targetUsers", "username player_id")
      .populate("createdBy", "username");

    // Get total count for pagination info
    const total = await Notification.countDocuments(filter);

    res.json({
      notifications,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET single notification
Adminrouter.get("/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate("targetUsers", "username player_id email phone")
      .populate("createdBy", "username");

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({ error: "Failed to fetch notification" });
  }
});

// POST create new notification (send to single or multiple users)
Adminrouter.post("/notifications", async (req, res) => {
  try {
    const {
      title,
      message,
      type = "info",
      targetType = "all",
      targetUsers = [],
      userRoles = [],
      scheduledFor,
      expiresAt,
      status = "sent",
      actionUrl,
      priority = "medium",
    } = req.body;

    // Validation
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    if (
      targetType === "specific" &&
      (!targetUsers || targetUsers.length === 0)
    ) {
      return res.status(400).json({
        error: "Target users are required for specific notifications",
      });
    }

    if (targetType === "role_based" && (!userRoles || userRoles.length === 0)) {
      return res.status(400).json({
        error: "User roles are required for role-based notifications",
      });
    }

    // Validate target users exist if provided
    if (targetType === "specific" && targetUsers.length > 0) {
      const usersExist = await User.countDocuments({
        _id: { $in: targetUsers },
      });
      if (usersExist !== targetUsers.length) {
        return res
          .status(400)
          .json({ error: "One or more target users do not exist" });
      }
    }

    const notificationData = {
      title,
      message,
      type,
      targetType,
      targetUsers: targetType === "specific" ? targetUsers : [],
      userRoles: targetType === "role_based" ? userRoles : [],
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      actionUrl,
      priority,
    };

    const newNotification = new Notification(notificationData);
    const savedNotification = await newNotification.save();

    // Populate for response
    await savedNotification.populate("targetUsers", "username player_id");
    await savedNotification.populate("createdBy", "username");

    res.status(201).json({
      message: "Notification created successfully",
      notification: savedNotification,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// PUT update notification
Adminrouter.put("/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const {
      title,
      message,
      type,
      targetType,
      targetUsers,
      userRoles,
      scheduledFor,
      expiresAt,
      status,
      actionUrl,
      priority,
    } = req.body;

    // Update fields
    if (title !== undefined) notification.title = title;
    if (message !== undefined) notification.message = message;
    if (type !== undefined) notification.type = type;
    if (targetType !== undefined) notification.targetType = targetType;
    if (targetUsers !== undefined) notification.targetUsers = targetUsers;
    if (userRoles !== undefined) notification.userRoles = userRoles;
    if (scheduledFor !== undefined)
      notification.scheduledFor = new Date(scheduledFor);
    if (expiresAt !== undefined)
      notification.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (status !== undefined) notification.status = status;
    if (actionUrl !== undefined) notification.actionUrl = actionUrl;
    if (priority !== undefined) notification.priority = priority;

    await notification.save();

    // Populate for response
    await notification.populate("targetUsers", "username player_id");
    await notification.populate("createdBy", "username");

    res.json({
      message: "Notification updated successfully",
      notification,
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// DELETE notification
Adminrouter.delete("/notifications/:id", async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// PUT update notification status
Adminrouter.put("/notifications/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !status ||
      !["draft", "scheduled", "sent", "cancelled"].includes(status)
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("targetUsers", "username player_id")
      .populate("createdBy", "username");

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({
      message: "Notification status updated successfully",
      notification,
    });
  } catch (error) {
    console.error("Error updating notification status:", error);
    res.status(500).json({ error: "Failed to update notification status" });
  }
});

// GET notification statistics
Adminrouter.get("/notifications-stats", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total notifications count
    const totalStats = await Notification.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalCount: { $sum: 1 },
          scheduledCount: {
            $sum: { $cond: [{ $eq: ["$status", "scheduled"] }, 1, 0] },
          },
          sentCount: {
            $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] },
          },
        },
      },
    ]);

    // Type counts
    const typeStats = await Notification.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    // Target type counts
    const targetTypeStats = await Notification.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$targetType",
          count: { $sum: 1 },
        },
      },
    ]);

    // Daily notifications for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Notification.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      total: totalStats[0] || {
        totalCount: 0,
        scheduledCount: 0,
        sentCount: 0,
      },
      byType: typeStats,
      byTargetType: targetTypeStats,
      daily: dailyStats,
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    res.status(500).json({ error: "Failed to fetch notification statistics" });
  }
});

// GET users for notification targeting
Adminrouter.get("/notifications/users/list", async (req, res) => {
  try {
    const { search, role } = req.query;

    let filter = { status: "active" };

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { player_id: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "all") {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("username player_id email phone role")
      .limit(50)
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users list:", error);
    res.status(500).json({ error: "Failed to fetch users list" });
  }
});

// POST send test notification
Adminrouter.post("/notifications/test", async (req, res) => {
  try {
    const { title, message, type = "info" } = req.body;

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message are required" });
    }

    // Create a test notification sent only to the current admin
    const testNotification = new Notification({
      title: `[TEST] ${title}`,
      message,
      type,
      targetType: "specific",
      targetUsers: [req.user._id],
      status: "sent",
      createdBy: req.user._id,
    });

    await testNotification.save();

    res.json({
      message: "Test notification sent successfully",
      notification: testNotification,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    res.status(500).json({ error: "Failed to send test notification" });
  }
});

// Import the new models at the top of your file
const LoginLog = require("../models/LoginLog");
const FailedLogin = require("../models/FailedLogin");
const IPWhitelist = require("../models/IPWhitelist");
const Device = require("../models/Device");
const SecuritySettings = require("../models/SecuritySettings");

// ==================== LOGIN LOGS ROUTES ====================

// GET all login logs with filtering and pagination
Adminrouter.get("/login-logs", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      username,
      status,
      ipAddress,
      startDate,
      endDate,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (username) {
      filter.username = { $regex: username, $options: "i" };
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (ipAddress) {
      filter.ipAddress = { $regex: ipAddress, $options: "i" };
    }

    // Date range filter
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get login logs with pagination
    const loginLogs = await LoginLog.find(filter)
      .populate("userId", "username player_id")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await LoginLog.countDocuments(filter);

    res.json({
      loginLogs,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching login logs:", error);
    res.status(500).json({ error: "Failed to fetch login logs" });
  }
});

// GET login log statistics
Adminrouter.get("/login-logs/stats", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    // Total login attempts
    const totalStats = await LoginLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          successfulAttempts: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          failedAttempts: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
        },
      },
    ]);

    // Failed reasons breakdown
    const failureStats = await LoginLog.aggregate([
      {
        $match: {
          ...dateFilter,
          status: "failed",
        },
      },
      {
        $group: {
          _id: "$failureReason",
          count: { $sum: 1 },
        },
      },
    ]);

    // Top IP addresses with failed attempts
    const topIPs = await LoginLog.aggregate([
      {
        $match: {
          ...dateFilter,
          status: "failed",
        },
      },
      {
        $group: {
          _id: "$ipAddress",
          count: { $sum: 1 },
          lastAttempt: { $max: "$timestamp" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Daily login attempts for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await LoginLog.aggregate([
      {
        $match: {
          timestamp: { $gte: sevenDaysAgo },
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$timestamp",
            },
          },
          total: { $sum: 1 },
          success: {
            $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
          },
          failed: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      total: totalStats[0] || {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
      },
      failureReasons: failureStats,
      topIPs,
      daily: dailyStats,
    });
  } catch (error) {
    console.error("Error fetching login log stats:", error);
    res.status(500).json({ error: "Failed to fetch login log statistics" });
  }
});

// ==================== FAILED LOGIN ATTEMPTS ROUTES ====================

// GET all failed login attempts with filtering and pagination
Adminrouter.get("/failed-logins", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      username,
      ipAddress,
      isLocked,
      startDate,
      endDate,
      sortBy = "lastAttempt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (username) {
      filter.username = { $regex: username, $options: "i" };
    }

    if (ipAddress) {
      filter.ipAddress = { $regex: ipAddress, $options: "i" };
    }

    if (isLocked !== undefined) {
      filter.isLocked = isLocked === "true";
    }

    // Date range filter
    if (startDate || endDate) {
      filter.lastAttempt = {};
      if (startDate) filter.lastAttempt.$gte = new Date(startDate);
      if (endDate) filter.lastAttempt.$lte = new Date(endDate);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get failed login attempts with pagination
    const failedLogins = await FailedLogin.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await FailedLogin.countDocuments(filter);

    res.json({
      failedLogins,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching failed login attempts:", error);
    res.status(500).json({ error: "Failed to fetch failed login attempts" });
  }
});

// PUT unlock a failed login attempt
Adminrouter.put("/failed-logins/:id/unlock", async (req, res) => {
  try {
    const failedLogin = await FailedLogin.findById(req.params.id);

    if (!failedLogin) {
      return res.status(404).json({ error: "Failed login attempt not found" });
    }

    failedLogin.isLocked = false;
    failedLogin.lockedUntil = null;
    failedLogin.attemptCount = 0;
    await failedLogin.save();

    res.json({
      message: "Account unlocked successfully",
      failedLogin,
    });
  } catch (error) {
    console.error("Error unlocking failed login attempt:", error);
    res.status(500).json({ error: "Failed to unlock account" });
  }
});

// DELETE clear failed login attempts
Adminrouter.delete("/failed-logins/clear", async (req, res) => {
  try {
    const { olderThan } = req.query;
    let filter = {};

    if (olderThan) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThan));
      filter.lastAttempt = { $lt: cutoffDate };
    }

    const result = await FailedLogin.deleteMany(filter);

    res.json({
      message: `Cleared ${result.deletedCount} failed login attempts`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing failed login attempts:", error);
    res.status(500).json({ error: "Failed to clear failed login attempts" });
  }
});

// ==================== IP WHITELIST ROUTES ====================

// GET all IP whitelist entries
Adminrouter.get("/ip-whitelist", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (search) {
      filter.$or = [
        { ipAddress: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get IP whitelist entries with pagination
    const ipWhitelist = await IPWhitelist.find(filter)
      .populate("createdBy", "username")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await IPWhitelist.countDocuments(filter);

    res.json({
      ipWhitelist,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching IP whitelist:", error);
    res.status(500).json({ error: "Failed to fetch IP whitelist" });
  }
});

// POST add IP to whitelist
Adminrouter.post("/ip-whitelist", async (req, res) => {
  try {
    const { ipAddress, description, isActive = true } = req.body;

    if (!ipAddress || !description) {
      return res
        .status(400)
        .json({ error: "IP address and description are required" });
    }

    // Validate IP address format
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({ error: "Invalid IP address format" });
    }

    // Check if IP already exists in whitelist
    const existingIP = await IPWhitelist.findOne({ ipAddress });
    if (existingIP) {
      return res
        .status(400)
        .json({ error: "IP address already exists in whitelist" });
    }

    const ipWhitelistData = {
      ipAddress,
      description,
      isActive,
      createdBy: req.user._id,
    };

    const newIPWhitelist = new IPWhitelist(ipWhitelistData);
    const savedIPWhitelist = await newIPWhitelist.save();

    // Populate createdBy for response
    await savedIPWhitelist.populate("createdBy", "username");

    res.status(201).json({
      message: "IP address added to whitelist successfully",
      ipWhitelist: savedIPWhitelist,
    });
  } catch (error) {
    console.error("Error adding IP to whitelist:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "IP address already exists in whitelist" });
    }
    res.status(500).json({ error: "Failed to add IP to whitelist" });
  }
});

// PUT update IP whitelist entry
Adminrouter.put("/ip-whitelist/:id", async (req, res) => {
  try {
    const { description, isActive } = req.body;

    const ipWhitelist = await IPWhitelist.findById(req.params.id);

    if (!ipWhitelist) {
      return res.status(404).json({ error: "IP whitelist entry not found" });
    }

    // Update fields
    if (description !== undefined) ipWhitelist.description = description;
    if (isActive !== undefined) ipWhitelist.isActive = isActive;

    await ipWhitelist.save();

    // Populate createdBy for response
    await ipWhitelist.populate("createdBy", "username");

    res.json({
      message: "IP whitelist entry updated successfully",
      ipWhitelist,
    });
  } catch (error) {
    console.error("Error updating IP whitelist entry:", error);
    res.status(500).json({ error: "Failed to update IP whitelist entry" });
  }
});

// DELETE remove IP from whitelist
Adminrouter.delete("/ip-whitelist/:id", async (req, res) => {
  try {
    const ipWhitelist = await IPWhitelist.findById(req.params.id);

    if (!ipWhitelist) {
      return res.status(404).json({ error: "IP whitelist entry not found" });
    }

    await IPWhitelist.findByIdAndDelete(req.params.id);

    res.json({ message: "IP address removed from whitelist successfully" });
  } catch (error) {
    console.error("Error removing IP from whitelist:", error);
    res.status(500).json({ error: "Failed to remove IP from whitelist" });
  }
});

// ==================== DEVICE MANAGEMENT ROUTES ====================

// GET all devices with filtering and pagination
Adminrouter.get("/devices", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      deviceType,
      isTrusted,
      search,
      sortBy = "lastUsed",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (deviceType && deviceType !== "all") {
      filter.deviceType = deviceType;
    }

    if (isTrusted !== undefined) {
      filter.isTrusted = isTrusted === "true";
    }

    if (search) {
      filter.$or = [
        { deviceName: { $regex: search, $options: "i" } },
        { deviceId: { $regex: search, $options: "i" } },
        { ipAddress: { $regex: search, $options: "i" } },
        { "userId.username": { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get devices with pagination
    const devices = await Device.find(filter)
      .populate("userId", "username player_id")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Device.countDocuments(filter);

    res.json({
      devices,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

// GET devices by user ID
Adminrouter.get("/users/:userId/devices", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get user devices with pagination
    const devices = await Device.find({ userId })
      .sort({ lastUsed: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Device.countDocuments({ userId });

    res.json({
      devices,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching user devices:", error);
    res.status(500).json({ error: "Failed to fetch user devices" });
  }
});

// PUT update device trusted status
Adminrouter.put("/devices/:id/trust", async (req, res) => {
  try {
    const { isTrusted } = req.body;

    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    device.isTrusted = isTrusted;
    await device.save();

    res.json({
      message: `Device ${isTrusted ? "trusted" : "untrusted"} successfully`,
      device,
    });
  } catch (error) {
    console.error("Error updating device trust status:", error);
    res.status(500).json({ error: "Failed to update device trust status" });
  }
});

// DELETE remove device
Adminrouter.delete("/devices/:id", async (req, res) => {
  try {
    const device = await Device.findById(req.params.id);

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    await Device.findByIdAndDelete(req.params.id);

    res.json({ message: "Device removed successfully" });
  } catch (error) {
    console.error("Error removing device:", error);
    res.status(500).json({ error: "Failed to remove device" });
  }
});

// ==================== SECURITY SETTINGS ROUTES ====================

// GET security settings for a user
Adminrouter.get("/security-settings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    let securitySettings = await SecuritySettings.findOne({ userId }).populate(
      "userId",
      "username player_id"
    );

    // If no settings exist, create default ones
    if (!securitySettings) {
      securitySettings = new SecuritySettings({ userId });
      await securitySettings.save();
      await securitySettings.populate("userId", "username player_id");
    }

    res.json(securitySettings);
  } catch (error) {
    console.error("Error fetching security settings:", error);
    res.status(500).json({ error: "Failed to fetch security settings" });
  }
});

// PUT update security settings
Adminrouter.put("/security-settings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      twoFactorEnabled,
      twoFactorMethod,
      loginAlerts,
      suspiciousActivityAlerts,
      sessionTimeout,
      maxFailedAttempts,
      accountLockoutTime,
      ipWhitelisting,
      deviceWhitelisting,
      passwordChangeReminder,
      passwordChangeFrequency,
    } = req.body;

    let securitySettings = await SecuritySettings.findOne({ userId });

    // If no settings exist, create new ones
    if (!securitySettings) {
      securitySettings = new SecuritySettings({ userId });
    }

    // Update fields
    if (twoFactorEnabled !== undefined)
      securitySettings.twoFactorEnabled = twoFactorEnabled;
    if (twoFactorMethod !== undefined)
      securitySettings.twoFactorMethod = twoFactorMethod;
    if (loginAlerts !== undefined) securitySettings.loginAlerts = loginAlerts;
    if (suspiciousActivityAlerts !== undefined)
      securitySettings.suspiciousActivityAlerts = suspiciousActivityAlerts;
    if (sessionTimeout !== undefined)
      securitySettings.sessionTimeout = sessionTimeout;
    if (maxFailedAttempts !== undefined)
      securitySettings.maxFailedAttempts = maxFailedAttempts;
    if (accountLockoutTime !== undefined)
      securitySettings.accountLockoutTime = accountLockoutTime;
    if (ipWhitelisting !== undefined)
      securitySettings.ipWhitelisting = ipWhitelisting;
    if (deviceWhitelisting !== undefined)
      securitySettings.deviceWhitelisting = deviceWhitelisting;
    if (passwordChangeReminder !== undefined)
      securitySettings.passwordChangeReminder = passwordChangeReminder;
    if (passwordChangeFrequency !== undefined)
      securitySettings.passwordChangeFrequency = passwordChangeFrequency;

    await securitySettings.save();

    // Populate userId for response
    await securitySettings.populate("userId", "username player_id");

    res.json({
      message: "Security settings updated successfully",
      securitySettings,
    });
  } catch (error) {
    console.error("Error updating security settings:", error);
    res.status(500).json({ error: "Failed to update security settings" });
  }
});

// PUT update password change date
Adminrouter.put(
  "/security-settings/:userId/password-change",
  async (req, res) => {
    try {
      const { userId } = req.params;

      let securitySettings = await SecuritySettings.findOne({ userId });

      // If no settings exist, create new ones
      if (!securitySettings) {
        securitySettings = new SecuritySettings({ userId });
      }

      securitySettings.lastPasswordChange = new Date();
      await securitySettings.save();

      res.json({
        message: "Password change date updated successfully",
        lastPasswordChange: securitySettings.lastPasswordChange,
      });
    } catch (error) {
      console.error("Error updating password change date:", error);
      res.status(500).json({ error: "Failed to update password change date" });
    }
  }
);

// GET security settings statistics
Adminrouter.get("/security-settings-stats", async (req, res) => {
  try {
    // Count of users with 2FA enabled
    const twoFactorStats = await SecuritySettings.aggregate([
      {
        $group: {
          _id: "$twoFactorEnabled",
          count: { $sum: 1 },
        },
      },
    ]);

    // Count of users with different 2FA methods
    const twoFactorMethodStats = await SecuritySettings.aggregate([
      {
        $group: {
          _id: "$twoFactorMethod",
          count: { $sum: 1 },
        },
      },
    ]);

    // Average session timeout
    const sessionTimeoutStats = await SecuritySettings.aggregate([
      {
        $group: {
          _id: null,
          avgSessionTimeout: { $avg: "$sessionTimeout" },
          minSessionTimeout: { $min: "$sessionTimeout" },
          maxSessionTimeout: { $max: "$sessionTimeout" },
        },
      },
    ]);

    res.json({
      twoFactor: twoFactorStats,
      twoFactorMethods: twoFactorMethodStats,
      sessionTimeout: sessionTimeoutStats[0] || {
        avgSessionTimeout: 60,
        minSessionTimeout: 60,
        maxSessionTimeout: 60,
      },
    });
  } catch (error) {
    console.error("Error fetching security settings stats:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch security settings statistics" });
  }
});

// Add this near the top with other requires
const Event = require("../models/Event");
const Affiliate = require("../models/Affiliate");
const Payout = require("../models/Payout");
const Affilaitepayout = require("../models/Affilaitepayout");
const MasterAffiliate = require("../models/MasterAffiliate");
const BettingHistory = require("../models/BettingHistory");
const Depositmethod = require("../models/Depositmethod");
const Withdrawmethod = require("../models/Withdrawmethod");

// Configure multer for event images
const eventStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "./public/uploads/events/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "event-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadEvent = multer({
  storage: eventStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// ==================== EVENT ROUTES ====================

// GET all events
Adminrouter.get("/events", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("createdBy", "username fullName")
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch events",
    });
  }
});

// GET single event by ID
Adminrouter.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "createdBy",
      "username fullName"
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }
    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch event",
    });
  }
});

// POST create new event
Adminrouter.post("/events", uploadEvent.single("image"), async (req, res) => {
  try {
    const { title, description, eventDates, category } = req.body;

    // Parse eventDates if it's a string
    let parsedEventDates = [];
    if (eventDates) {
      try {
        parsedEventDates = JSON.parse(eventDates);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid event dates format",
        });
      }
    }

    if (!title || !parsedEventDates.length) {
      return res.status(400).json({
        success: false,
        error: "Title and event dates are required",
      });
    }

    const eventData = {
      title: title.trim(),
      description: description || "",
      eventDates: parsedEventDates,
      category: category || "sports",
      image: req.file ? `/uploads/events/${req.file.filename}` : "",
    };

    const newEvent = new Event(eventData);
    const savedEvent = await newEvent.save();

    // Populate createdBy for response
    await savedEvent.populate("createdBy", "username fullName");

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: savedEvent,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create event",
    });
  }
});

// PUT update event
Adminrouter.put(
  "/events/:id",
  uploadEvent.single("image"),
  async (req, res) => {
    try {
      const { title, description, eventDates, category, status } = req.body;

      // Parse eventDates if it's a string
      let parsedEventDates = [];
      if (eventDates) {
        try {
          parsedEventDates = JSON.parse(eventDates);
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: "Invalid event dates format",
          });
        }
      }

      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }

      // Update fields
      if (title !== undefined) event.title = title.trim();
      if (description !== undefined) event.description = description;
      if (parsedEventDates.length > 0) event.eventDates = parsedEventDates;
      if (category !== undefined) event.category = category;
      if (status !== undefined) event.status = status;

      // Handle image update
      if (req.file) {
        // Delete old image file if exists
        if (event.image) {
          const oldImagePath = path.join(__dirname, "..", event.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        event.image = `/uploads/events/${req.file.filename}`;
      }

      await event.save();

      // Populate createdBy for response
      await event.populate("createdBy", "username fullName");

      res.json({
        success: true,
        message: "Event updated successfully",
        data: event,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      res.status(500).json({
        success: false,
        error: "Failed to update event",
      });
    }
  }
);

// PUT update event status
Adminrouter.put("/events/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !["active", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Valid status is required (active, completed, cancelled)",
      });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("createdBy", "username fullName");

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    res.json({
      success: true,
      message: "Event status updated successfully",
      data: event,
    });
  } catch (error) {
    console.error("Error updating event status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update event status",
    });
  }
});

// DELETE event
Adminrouter.delete("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    // Delete image file if exists
    if (event.image) {
      const imagePath = path.join(__dirname, "..", event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete event",
    });
  }
});
// GET all affiliates with filtering, pagination, and search
Adminrouter.get("/affiliates", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      verificationStatus,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (verificationStatus && verificationStatus !== "all") {
      filter.verificationStatus = verificationStatus;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { affiliateCode: { $regex: search, $options: "i" } },
        { customAffiliateCode: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get affiliates with pagination
    const affiliates = await Affiliate.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken"
      );

    // Get total count for pagination info
    const total = await Affiliate.countDocuments(filter);

    res.json({
      affiliates,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    res.status(500).json({ error: "Failed to fetch affiliates" });
  }
});

// GET single affiliate by ID
Adminrouter.get("/affiliates/:id", async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id)
      .populate("referredUsers.user", "username player_id email")
      .populate("assignedManager", "username fullName")
      .select(
        "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken"
      );

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    res.json(affiliate);
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    res.status(500).json({ error: "Failed to fetch affiliate" });
  }
});

// POST create new affiliate (admin only)
Adminrouter.post("/affiliates", async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      company,
      website,
      promoMethod,
      commissionRate,
      commissionType,
      status,
    } = req.body;

    // Check if email already exists
    const existingAffiliate = await Affiliate.findOne({ email });
    if (existingAffiliate) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const affiliateData = {
      email,
      password: password || Math.random().toString(36).slice(-8), // Generate random password if not provided
      firstName,
      lastName,
      phone,
      company,
      website,
      promoMethod: promoMethod || "other",
      commissionRate: commissionRate || 0.1,
      commissionType: commissionType || "revenue_share",
      status: status || "pending",
    };

    const newAffiliate = new Affiliate(affiliateData);
    const savedAffiliate = await newAffiliate.save();

    // Remove sensitive data before sending response
    const affiliateResponse = savedAffiliate.toJSON();

    res.status(201).json({
      message: "Affiliate created successfully",
      affiliate: affiliateResponse,
    });
  } catch (error) {
    console.error("Error creating affiliate:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to create affiliate" });
  }
});

// PUT update affiliate
Adminrouter.put("/affiliates/:id", async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    const {
      firstName,
      lastName,
      phone,
      company,
      website,
      promoMethod,
      commissionRate,
      commissionType,
      cpaRate,
      depositRate,
      status,
      verificationStatus,
      paymentMethod,
      minimumPayout,
      payoutSchedule,
      autoPayout,
      notes,
      tags,
      assignedManager,
    } = req.body;

    // Update fields
    if (firstName) affiliate.firstName = firstName;
    if (lastName) affiliate.lastName = lastName;
    if (phone) affiliate.phone = phone;
    if (company !== undefined) affiliate.company = company;
    if (website !== undefined) affiliate.website = website;
    if (promoMethod) affiliate.promoMethod = promoMethod;
    if (commissionRate !== undefined) affiliate.commissionRate = commissionRate;
    if (commissionType) affiliate.commissionType = commissionType;
    if (cpaRate !== undefined) affiliate.cpaRate = cpaRate;
    if (depositRate !== undefined) affiliate.depositRate = depositRate;
    if (status) affiliate.status = status;
    if (verificationStatus) affiliate.verificationStatus = verificationStatus;
    if (paymentMethod) affiliate.paymentMethod = paymentMethod;
    if (minimumPayout !== undefined) affiliate.minimumPayout = minimumPayout;
    if (payoutSchedule) affiliate.payoutSchedule = payoutSchedule;
    if (autoPayout !== undefined) affiliate.autoPayout = autoPayout;
    if (notes !== undefined) affiliate.notes = notes;
    if (tags !== undefined) affiliate.tags = tags;
    if (assignedManager !== undefined)
      affiliate.assignedManager = assignedManager;

    await affiliate.save();

    // Remove sensitive data before sending response
    const affiliateResponse = affiliate.toJSON();

    res.json({
      message: "Affiliate updated successfully",
      affiliate: affiliateResponse,
    });
  } catch (error) {
    console.error("Error updating affiliate:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to update affiliate" });
  }
});

// PUT update affiliate status
Adminrouter.put("/affiliates/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (
      !status ||
      !["pending", "active", "suspended", "banned"].includes(status)
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const affiliate = await Affiliate.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select(
      "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken"
    );

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    res.json({
      message: "Affiliate status updated successfully",
      affiliate,
    });
  } catch (error) {
    console.error("Error updating affiliate status:", error);
    res.status(500).json({ error: "Failed to update affiliate status" });
  }
});

// PUT update affiliate verification status
Adminrouter.put("/affiliates/:id/verification-status", async (req, res) => {
  try {
    const { verificationStatus } = req.body;

    if (
      !verificationStatus ||
      !["unverified", "pending", "verified", "rejected"].includes(
        verificationStatus
      )
    ) {
      return res
        .status(400)
        .json({ error: "Valid verification status is required" });
    }

    const affiliate = await Affiliate.findByIdAndUpdate(
      req.params.id,
      { verificationStatus },
      { new: true }
    ).select(
      "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken"
    );

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    res.json({
      message: "Affiliate verification status updated successfully",
      affiliate,
    });
  } catch (error) {
    console.error("Error updating affiliate verification status:", error);
    res
      .status(500)
      .json({ error: "Failed to update affiliate verification status" });
  }
});

// PUT update affiliate commission structure
Adminrouter.put("/affiliates/:id/commission", async (req, res) => {
  try {
    const { commissionRate, commissionType, cpaRate, depositRate } = req.body;

    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    if (commissionRate !== undefined) {
      if (commissionRate < 0.01 || commissionRate > 0.5) {
        return res
          .status(400)
          .json({ error: "Commission rate must be between 1% and 50%" });
      }
      affiliate.commissionRate = commissionRate;
    }

    if (depositRate !== undefined) {
      if (depositRate < 0 || depositRate > 0.5) {
        return res
          .status(400)
          .json({ error: "Deposit rate must be between 0% and 50%" });
      }
      affiliate.depositRate = depositRate;
    }

    if (commissionType) {
      affiliate.commissionType = commissionType;
    }

    if (cpaRate !== undefined) {
      if (cpaRate < 0) {
        return res.status(400).json({ error: "CPA rate cannot be negative" });
      }
      affiliate.cpaRate = cpaRate;
    }

    await affiliate.save();

    res.json({
      message: "Affiliate commission structure updated successfully",
      affiliate: {
        commissionRate: affiliate.commissionRate,
        depositRate: affiliate.depositRate,
        commissionType: affiliate.commissionType,
        cpaRate: affiliate.cpaRate,
      },
    });
  } catch (error) {
    console.error("Error updating affiliate commission:", error);
    res
      .status(500)
      .json({ error: "Failed to update affiliate commission structure" });
  }
});

// PUT update affiliate payment information
Adminrouter.put("/affiliates/:id/payment", async (req, res) => {
  try {
    const {
      paymentMethod,
      paymentDetails,
      minimumPayout,
      payoutSchedule,
      autoPayout,
    } = req.body;

    const affiliate = await Affiliate.findById(req.params.id);
    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    if (paymentMethod) {
      affiliate.paymentMethod = paymentMethod;
    }

    if (paymentDetails) {
      // Update specific payment details based on payment method
      if (paymentDetails.bkash) {
        affiliate.paymentDetails.bkash = {
          ...affiliate.paymentDetails.bkash,
          ...paymentDetails.bkash,
        };
      }
      if (paymentDetails.nagad) {
        affiliate.paymentDetails.nagad = {
          ...affiliate.paymentDetails.nagad,
          ...paymentDetails.nagad,
        };
      }
      if (paymentDetails.rocket) {
        affiliate.paymentDetails.rocket = {
          ...affiliate.paymentDetails.rocket,
          ...paymentDetails.rocket,
        };
      }
      if (paymentDetails.binance) {
        affiliate.paymentDetails.binance = {
          ...affiliate.paymentDetails.binance,
          ...paymentDetails.binance,
        };
      }
      if (paymentDetails.bank_transfer) {
        affiliate.paymentDetails.bank_transfer = {
          ...affiliate.paymentDetails.bank_transfer,
          ...paymentDetails.bank_transfer,
        };
      }
    }

    if (minimumPayout !== undefined) {
      affiliate.minimumPayout = minimumPayout;
    }

    if (payoutSchedule) {
      affiliate.payoutSchedule = payoutSchedule;
    }

    if (autoPayout !== undefined) {
      affiliate.autoPayout = autoPayout;
    }

    await affiliate.save();

    res.json({
      message: "Affiliate payment information updated successfully",
      affiliate: {
        paymentMethod: affiliate.paymentMethod,
        formattedPaymentDetails: affiliate.formattedPaymentDetails,
        minimumPayout: affiliate.minimumPayout,
        payoutSchedule: affiliate.payoutSchedule,
        autoPayout: affiliate.autoPayout,
      },
    });
  } catch (error) {
    console.error("Error updating affiliate payment information:", error);
    res
      .status(500)
      .json({ error: "Failed to update affiliate payment information" });
  }
});

// DELETE affiliate
Adminrouter.delete("/affiliates/:id", async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    await Affiliate.findByIdAndDelete(req.params.id);

    res.json({ message: "Affiliate deleted successfully" });
  } catch (error) {
    console.error("Error deleting affiliate:", error);
    res.status(500).json({ error: "Failed to delete affiliate" });
  }
});

// ==================== COMMISSION STRUCTURE ROUTES ====================

// GET commission structure settings
Adminrouter.get("/affiliates/commission-structure", async (req, res) => {
  try {
    // Get default commission structure from settings or return default values
    const defaultCommission = {
      revenue_share: {
        defaultRate: 0.1,
        minRate: 0.01,
        maxRate: 0.5,
      },
      cpa: {
        defaultRate: 0,
        minRate: 0,
        maxRate: 1000,
      },
      hybrid: {
        revenueShareRate: 0.05,
        cpaRate: 50,
      },
      tiers: [
        {
          level: 1,
          name: "Bronze",
          minReferrals: 0,
          commissionRate: 0.1,
        },
        {
          level: 2,
          name: "Silver",
          minReferrals: 10,
          commissionRate: 0.15,
        },
        {
          level: 3,
          name: "Gold",
          minReferrals: 25,
          commissionRate: 0.2,
        },
        {
          level: 4,
          name: "Platinum",
          minReferrals: 50,
          commissionRate: 0.25,
        },
      ],
    };

    res.json(defaultCommission);
  } catch (error) {
    console.error("Error fetching commission structure:", error);
    res.status(500).json({ error: "Failed to fetch commission structure" });
  }
});

// PUT update commission structure
Adminrouter.put("/affiliates/commission-structure", async (req, res) => {
  try {
    const { revenue_share, cpa, hybrid, tiers } = req.body;

    // Here you would typically save this to a settings collection
    // For now, we'll just return the updated structure

    const updatedStructure = {
      revenue_share: revenue_share || {
        defaultRate: 0.1,
        minRate: 0.01,
        maxRate: 0.5,
      },
      cpa: cpa || {
        defaultRate: 0,
        minRate: 0,
        maxRate: 1000,
      },
      hybrid: hybrid || {
        revenueShareRate: 0.05,
        cpaRate: 50,
      },
      tiers: tiers || [
        {
          level: 1,
          name: "Bronze",
          minReferrals: 0,
          commissionRate: 0.1,
        },
      ],
    };

    res.json({
      message: "Commission structure updated successfully",
      commissionStructure: updatedStructure,
    });
  } catch (error) {
    console.error("Error updating commission structure:", error);
    res.status(500).json({ error: "Failed to update commission structure" });
  }
});

// ==================== PAYOUT MANAGEMENT ROUTES ====================

// GET all payouts with filtering and pagination
Adminrouter.get("/affiliates/payouts", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      affiliateId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (paymentMethod && paymentMethod !== "all") {
      filter.paymentMethod = paymentMethod;
    }

    if (affiliateId) {
      filter.affiliate = affiliateId;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get payouts with pagination
    const payouts = await Payout.find(filter)
      .populate("affiliate", "firstName lastName email affiliateCode")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Payout.countDocuments(filter);

    // Get summary statistics
    const totalAmount = await Payout.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const statusCounts = await Payout.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      payouts,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      statusCounts,
    });
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ error: "Failed to fetch payouts" });
  }
});

// POST create manual payout
Adminrouter.post("/affiliates/payouts/manual", async (req, res) => {
  try {
    const { affiliateId, amount, notes } = req.body;

    if (!affiliateId || !amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Valid affiliate ID and amount are required" });
    }

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    if (amount > affiliate.pendingEarnings) {
      return res
        .status(400)
        .json({ error: "Payout amount exceeds pending earnings" });
    }

    if (amount < affiliate.minimumPayout) {
      return res.status(400).json({
        error: `Payout amount must be at least ${affiliate.minimumPayout}`,
      });
    }

    // Process payout using the affiliate method
    await affiliate.processPayout(amount, `MANUAL-${Date.now()}`);

    res.json({
      message: "Manual payout processed successfully",
      payout: {
        affiliate: affiliate._id,
        amount,
        paymentMethod: affiliate.paymentMethod,
        status: "completed",
      },
    });
  } catch (error) {
    console.error("Error creating manual payout:", error);
    res.status(500).json({ error: "Failed to create manual payout" });
  }
});

// PUT update payout status
Adminrouter.put("/affiliates/payouts/:id/status", async (req, res) => {
  try {
    const { status, transactionId, adminNotes } = req.body;

    if (
      !status ||
      !["pending", "processing", "completed", "failed", "cancelled"].includes(
        status
      )
    ) {
      return res.status(400).json({ error: "Valid status is required" });
    }

    const payout = await Payout.findById(req.params.id);
    if (!payout) {
      return res.status(404).json({ error: "Payout not found" });
    }

    payout.status = status;
    if (transactionId) payout.transactionId = transactionId;
    if (adminNotes) payout.adminNotes = adminNotes;

    if (status === "completed" || status === "failed") {
      payout.processedAt = new Date();
    }

    await payout.save();

    res.json({
      message: "Payout status updated successfully",
      payout,
    });
  } catch (error) {
    console.error("Error updating payout status:", error);
    res.status(500).json({ error: "Failed to update payout status" });
  }
});

// ==================== REFERRAL TRACKING ROUTES ====================

// GET referral tracking data
Adminrouter.get("/affiliates/referral-tracking", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      affiliateId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (affiliateId) {
      filter.affiliate = affiliateId;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get earnings records (which track referrals)
    const referrals = await Earnings.find(filter)
      .populate("affiliate", "firstName lastName affiliateCode")
      .populate("referredUser", "username player_id email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Earnings.countDocuments(filter);

    res.json({
      referrals,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching referral tracking data:", error);
    res.status(500).json({ error: "Failed to fetch referral tracking data" });
  }
});

// GET click tracking data
Adminrouter.get("/affiliates/click-tracking", async (req, res) => {
  try {
    const { page = 1, limit = 10, affiliateId, startDate, endDate } = req.query;

    let filter = {};

    if (affiliateId) {
      filter._id = affiliateId;
    }

    // For click tracking, we'll get affiliates with their click counts
    const affiliates = await Affiliate.find(filter)
      .select(
        "firstName lastName email affiliateCode clickCount conversionRate"
      )
      .sort({ clickCount: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Affiliate.countDocuments(filter);

    res.json({
      affiliates,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching click tracking data:", error);
    res.status(500).json({ error: "Failed to fetch click tracking data" });
  }
});

// ==================== PERFORMANCE REPORTS ROUTES ====================

// GET affiliate performance reports
Adminrouter.get("/affiliates/performance-reports", async (req, res) => {
  try {
    const {
      period = "month", // day, week, month, year
      startDate,
      endDate,
      affiliateId,
    } = req.query;

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    let affiliateFilter = {};
    if (affiliateId) {
      affiliateFilter._id = affiliateId;
    }

    // Get overall affiliate stats
    const overallStats = await Affiliate.getStats();

    // Get top performers
    const topPerformers = await Affiliate.getTopPerformers(10);

    // Get performance trends
    const performanceTrends = await Earnings.aggregate([
      {
        $match: {
          ...dateFilter,
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            affiliate: "$affiliate",
            period: {
              $dateToString: {
                format:
                  period === "day"
                    ? "%Y-%m-%d"
                    : period === "week"
                    ? "%Y-%U"
                    : period === "month"
                    ? "%Y-%m"
                    : "%Y",
                date: "$createdAt",
              },
            },
          },
          totalEarnings: { $sum: "$amount" },
          referralCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "affiliates",
          localField: "_id.affiliate",
          foreignField: "_id",
          as: "affiliateInfo",
        },
      },
      {
        $unwind: "$affiliateInfo",
      },
      {
        $project: {
          period: "$_id.period",
          affiliateName: {
            $concat: [
              "$affiliateInfo.firstName",
              " ",
              "$affiliateInfo.lastName",
            ],
          },
          affiliateCode: "$affiliateInfo.affiliateCode",
          totalEarnings: 1,
          referralCount: 1,
        },
      },
      { $sort: { period: 1, totalEarnings: -1 } },
    ]);

    res.json({
      overallStats,
      topPerformers,
      performanceTrends,
      period,
    });
  } catch (error) {
    console.error("Error generating performance reports:", error);
    res.status(500).json({ error: "Failed to generate performance reports" });
  }
});

// GET individual affiliate performance report
Adminrouter.get("/affiliates/:id/performance-report", async (req, res) => {
  try {
    const { id } = req.params;
    const { period = "month", startDate, endDate } = req.query;

    const affiliate = await Affiliate.findById(id).select(
      "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken"
    );

    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get earnings history for the affiliate
    const earningsHistory = await Earnings.aggregate([
      {
        $match: {
          affiliate: affiliate._id,
          ...dateFilter,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format:
                period === "day"
                  ? "%Y-%m-%d"
                  : period === "week"
                  ? "%Y-%U"
                  : period === "month"
                  ? "%Y-%m"
                  : "%Y",
              date: "$createdAt",
            },
          },
          totalEarnings: { $sum: "$amount" },
          completedEarnings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0] },
          },
          pendingEarnings: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0] },
          },
          referralCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get referral details
    const referralDetails = await Earnings.find({
      affiliate: affiliate._id,
      ...dateFilter,
    })
      .populate("referredUser", "username player_id email createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      affiliate,
      earningsHistory,
      referralDetails,
      performanceMetrics: {
        conversionRate: affiliate.conversionRate,
        averageEarningPerReferral: affiliate.averageEarningPerReferral,
        clickCount: affiliate.clickCount,
        earningsThisMonth: affiliate.earningsThisMonth,
      },
    });
  } catch (error) {
    console.error("Error generating affiliate performance report:", error);
    res
      .status(500)
      .json({ error: "Failed to generate affiliate performance report" });
  }
});

// ==================== MARKETING MATERIALS ROUTES ====================

// GET marketing materials
Adminrouter.get("/affiliates/marketing-materials", async (req, res) => {
  try {
    // This would typically come from a MarketingMaterials model
    const marketingMaterials = {
      banners: [
        {
          id: 1,
          name: "Leaderboard Banner",
          size: "728x90",
          formats: ["PNG", "JPG"],
          downloadUrl:
            "/api/affiliates/marketing-materials/banners/leaderboard",
        },
        {
          id: 2,
          name: "Square Banner",
          size: "250x250",
          formats: ["PNG", "JPG"],
          downloadUrl: "/api/affiliates/marketing-materials/banners/square",
        },
        {
          id: 3,
          name: "Skyscraper Banner",
          size: "160x600",
          formats: ["PNG", "JPG"],
          downloadUrl: "/api/affiliates/marketing-materials/banners/skyscraper",
        },
      ],
      links: [
        {
          id: 1,
          type: "Registration Link",
          url: "https://yoursite.com/register?ref={affiliate_code}",
          description: "Direct registration link with affiliate tracking",
        },
        {
          id: 2,
          type: "Promotional Link",
          url: "https://yoursite.com/promo?ref={affiliate_code}",
          description: "Promotional page with bonus offers",
        },
      ],
      textAds: [
        {
          id: 1,
          title: "Join Our Platform Today!",
          description:
            "Experience the best gaming platform with amazing rewards. Sign up now!",
          trackingUrl: "https://yoursite.com/register?ref={affiliate_code}",
        },
      ],
      socialMedia: {
        facebook: {
          template: `Join our amazing platform and get exclusive rewards!
          
Sign up now: https://yoursite.com/register?ref={affiliate_code}
          
#Gaming #Rewards #Exclusive`,
          imageFormats: ["Square", "Story"],
        },
        twitter: {
          template: `🎮 Join the ultimate gaming experience! 
          
Sign up now and claim your bonus: https://yoursite.com/register?ref={affiliate_code}
          
#Gaming #Bonus #JoinNow`,
          imageFormats: ["Banner", "Square"],
        },
      },
    };

    res.json(marketingMaterials);
  } catch (error) {
    console.error("Error fetching marketing materials:", error);
    res.status(500).json({ error: "Failed to fetch marketing materials" });
  }
});

// POST generate custom affiliate link
Adminrouter.post("/affiliates/generate-link", async (req, res) => {
  try {
    const { affiliateId, linkType, customParameters } = req.body;

    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({ error: "Affiliate not found" });
    }

    const baseUrl = "https://yoursite.com";
    let generatedLink = "";

    switch (linkType) {
      case "registration":
        generatedLink = `${baseUrl}/register?ref=${affiliate.affiliateCode}`;
        break;
      case "promotional":
        generatedLink = `${baseUrl}/promo?ref=${affiliate.affiliateCode}`;
        break;
      case "custom":
        generatedLink = `${baseUrl}${customParameters}?ref=${affiliate.affiliateCode}`;
        break;
      default:
        generatedLink = `${baseUrl}/?ref=${affiliate.affiliateCode}`;
    }

    res.json({
      message: "Affiliate link generated successfully",
      link: generatedLink,
      affiliateCode: affiliate.affiliateCode,
    });
  } catch (error) {
    console.error("Error generating affiliate link:", error);
    res.status(500).json({ error: "Failed to generate affiliate link" });
  }
});

// ==================== AFFILIATE STATISTICS ROUTES ====================

// GET affiliate dashboard statistics
Adminrouter.get("/affiliates/dashboard/stats", async (req, res) => {
  try {
    const totalAffiliates = await Affiliate.countDocuments();
    const activeAffiliates = await Affiliate.countDocuments({
      status: "active",
    });
    const pendingAffiliates = await Affiliate.countDocuments({
      status: "pending",
    });
    const suspendedAffiliates = await Affiliate.countDocuments({
      status: "suspended",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newAffiliatesToday = await Affiliate.countDocuments({
      createdAt: { $gte: today },
    });

    // Get overall stats from the static method
    const overallStats = await Affiliate.getStats();

    // Get pending payouts total
    const pendingPayouts = await Affiliate.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: null,
          totalPending: { $sum: "$pendingEarnings" },
        },
      },
    ]);

    // Get affiliate registration trend for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const registrationTrend = await Affiliate.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      summary: {
        totalAffiliates,
        activeAffiliates,
        pendingAffiliates,
        suspendedAffiliates,
        newAffiliatesToday,
      },
      financial: {
        ...overallStats,
        pendingPayouts:
          pendingPayouts.length > 0 ? pendingPayouts[0].totalPending : 0,
      },
      registrationTrend,
    });
  } catch (error) {
    console.error("Error fetching affiliate dashboard stats:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch affiliate dashboard statistics" });
  }
});

// GET recent affiliate activities
Adminrouter.get("/affiliates/recent-activities", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent affiliates
    const recentAffiliates = await Affiliate.find()
      .select("firstName lastName email status createdAt")
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent payouts
    const recentPayouts = await Payout.find()
      .populate("affiliate", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(limit);

    // Get recent earnings
    const recentEarnings = await Earnings.find()
      .populate("affiliate", "firstName lastName")
      .populate("referredUser", "username")
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      recentAffiliates,
      recentPayouts,
      recentEarnings,
    });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({ error: "Failed to fetch recent activities" });
  }
});
// ==================== ADMIN PAYOUT ROUTES ====================

// Get all payout requests (Admin)
Adminrouter.get("/payouts", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      startDate,
      endDate,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const payouts = await Payout.find(query)
      .populate("affiliate", "firstName lastName email affiliateCode")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payout.countDocuments(query);

    // Payout statistics for admin
    const stats = await Payout.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    res.json({
      success: true,
      payouts,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin get payouts error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Process payout (Admin)
Adminrouter.post("/payouts/:id/process", async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, processorNotes, estimatedCompletionDate } = req.body;

    const payout = await Payout.findById(id).populate("affiliate");
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found",
      });
    }

    if (payout.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending payouts can be processed",
      });
    }

    // Update payout status to processing
    await payout.updateStatus("processing", processorNotes, req.user._id);

    // Set transaction ID and estimated completion date
    if (transactionId) {
      const paymentDetails = payout.paymentDetails;
      switch (payout.paymentMethod) {
        case "bkash":
        case "nagad":
        case "rocket":
          paymentDetails[payout.paymentMethod].transactionId = transactionId;
          break;
        case "binance":
        case "crypto":
          paymentDetails[payout.paymentMethod].transactionHash = transactionId;
          break;
        case "bank_transfer":
          paymentDetails.bank_transfer.referenceNumber = transactionId;
          break;
      }
      payout.paymentDetails = paymentDetails;
    }

    if (estimatedCompletionDate) {
      payout.estimatedCompletionDate = new Date(estimatedCompletionDate);
    }

    await payout.save();

    res.json({
      success: true,
      message: "Payout is now being processed",
      payout: {
        id: payout._id,
        status: payout.status,
        processedAt: payout.processedAt,
        estimatedCompletionDate: payout.estimatedCompletionDate,
      },
    });
  } catch (error) {
    console.error("Admin process payout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Complete payout (Admin)
Adminrouter.post("/payouts/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { finalAmount, fees, processorNotes } = req.body;

    const payout = await Payout.findById(id).populate("affiliate");
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found",
      });
    }

    if (payout.status !== "processing") {
      return res.status(400).json({
        success: false,
        message: "Only processing payouts can be completed",
      });
    }

    // Update fees and net amount if provided
    if (fees) {
      payout.fees = { ...payout.fees, ...fees };
      payout.netAmount = payout.amount - payout.totalFees;
    }

    if (finalAmount && finalAmount !== payout.amount) {
      payout.amount = finalAmount;
      payout.netAmount = finalAmount - payout.totalFees;
    }

    // Update payout status to completed
    await payout.updateStatus("completed", processorNotes, req.user._id);

    // Update affiliate's earnings and create transaction records
    const affiliate = payout.affiliate;

    // Mark earnings as paid
    for (let earning of payout.includedEarnings) {
      const earningRecord = affiliate.earningsHistory.id(earning.earningId);
      if (earningRecord) {
        earningRecord.status = "paid";
        earningRecord.paidAt = new Date();
        earningRecord.payoutId = payout._id;
      }
    }

    // Update affiliate totals
    affiliate.paidEarnings += payout.netAmount;
    affiliate.lastPayoutDate = new Date();
    await affiliate.save();

    // Send notification to affiliate
    await payout.markAsNotified("affiliate");

    res.json({
      success: true,
      message: "Payout completed successfully",
      payout: {
        id: payout._id,
        status: payout.status,
        completedAt: payout.completedAt,
        netAmount: payout.netAmount,
      },
    });
  } catch (error) {
    console.error("Admin complete payout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Reject payout (Admin)
Adminrouter.post("/payouts/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, failureReason } = req.body;

    const payout = await Payout.findById(id).populate("affiliate");
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found",
      });
    }

    if (!["pending", "processing"].includes(payout.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or processing payouts can be rejected",
      });
    }

    // Update payout status to failed
    await payout.updateStatus("failed", reason, req.user._id);

    if (failureReason) {
      payout.failureReason = failureReason;
      payout.failureDetails = reason;
    }

    await payout.save();

    // Restore affiliate's pending earnings
    const affiliate = payout.affiliate;
    for (let earning of payout.includedEarnings) {
      const earningRecord = affiliate.earningsHistory.id(earning.earningId);
      if (earningRecord) {
        earningRecord.status = "pending";
        earningRecord.payoutId = undefined;
      }
    }

    affiliate.pendingEarnings += payout.amount;
    await affiliate.save();

    res.json({
      success: true,
      message: "Payout rejected successfully",
    });
  } catch (error) {
    console.error("Admin reject payout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Retry failed payout (Admin)
Adminrouter.post("/payouts/:id/retry", async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const payout = await Payout.findById(id);
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found",
      });
    }

    if (!payout.canRetry()) {
      return res.status(400).json({
        success: false,
        message: "Payout cannot be retried",
      });
    }

    await payout.retry(notes);

    res.json({
      success: true,
      message: "Payout retry initiated successfully",
      payout: {
        id: payout._id,
        status: payout.status,
        retryAttempt: payout.retryAttempt,
      },
    });
  } catch (error) {
    console.error("Admin retry payout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Helper function to calculate next payout date
function calculateNextPayoutDate(payoutSchedule) {
  const now = new Date();

  switch (payoutSchedule) {
    case "weekly":
      return new Date(now.setDate(now.getDate() + 7));
    case "bi_weekly":
      return new Date(now.setDate(now.getDate() + 14));
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    default:
      return null;
  }
}
// ==================== AFFILIATE PAYOUT ROUTES ====================

// POST create or update affiliate payout configuration
Adminrouter.post("/affiliate-payouts", async (req, res) => {
  try {
    const { affilaiteamount, masteraffiliateamount } = req.body;

    // Validation
    if (!affilaiteamount || affilaiteamount < 0) {
      return res.status(400).json({
        success: false,
        error: "Valid affiliate amount is required and must be non-negative",
      });
    }

    if (!masteraffiliateamount || masteraffiliateamount < 0) {
      return res.status(400).json({
        success: false,
        error:
          "Valid master affiliate amount is required and must be non-negative",
      });
    }

    // Check if payout configuration already exists
    const existingPayout = await Affilaitepayout.findOne();

    let payout;
    let message;

    if (existingPayout) {
      // Update existing payout configuration
      existingPayout.affilaiteamount = parseFloat(affilaiteamount);
      existingPayout.masteraffiliateamount = parseFloat(masteraffiliateamount);
      payout = await existingPayout.save();
      message = "Affiliate payout configuration updated successfully";
    } else {
      // Create new payout configuration
      const payoutData = {
        affilaiteamount: parseFloat(affilaiteamount),
        masteraffiliateamount: parseFloat(masteraffiliateamount),
      };
      payout = new Affilaitepayout(payoutData);
      await payout.save();
      message = "Affiliate payout configuration created successfully";
    }

    res.status(200).json({
      success: true,
      message: message,
      data: payout,
    });
  } catch (error) {
    console.error("Error creating/updating affiliate payout:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create/update affiliate payout configuration",
    });
  }
});

// GET current affiliate payout configuration
Adminrouter.get("/affiliate-payouts", async (req, res) => {
  try {
    const payout = await Affilaitepayout.findOne();

    if (!payout) {
      return res.json({
        error: "No affiliate payout configuration found",
      });
    }

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    console.error("Error fetching affiliate payout:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch affiliate payout configuration",
    });
  }
});
// Get all master affiliates created by a specific super affiliate
Adminrouter.get("/all-master-affiliate/:id", async (req, res) => {
  try {
    const masterAffiliates = await MasterAffiliate.find({
      createdBy: req.params.id,
      role: "master_affiliate",
    }).select(
      "-password -resetPasswordToken -resetPasswordExpires -emailVerificationToken"
    );

    res.json({
      success: true,
      count: masterAffiliates.length,
      data: masterAffiliates,
    });
  } catch (error) {
    console.error("Error fetching master affiliates:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// PUT update affiliate payout configuration
Adminrouter.put("/affiliate-payouts", async (req, res) => {
  try {
    const { affilaiteamount, masteraffiliateamount } = req.body;

    // Validation
    if (affilaiteamount === undefined && masteraffiliateamount === undefined) {
      return res.status(400).json({
        success: false,
        error:
          "At least one field (affilaiteamount or masteraffiliateamount) is required for update",
      });
    }

    if (affilaiteamount !== undefined && affilaiteamount < 0) {
      return res.status(400).json({
        success: false,
        error: "Affiliate amount must be non-negative",
      });
    }

    if (masteraffiliateamount !== undefined && masteraffiliateamount < 0) {
      return res.status(400).json({
        success: false,
        error: "Master affiliate amount must be non-negative",
      });
    }

    const payout = await Affilaitepayout.findOne();

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: "No affiliate payout configuration found to update",
      });
    }

    // Update fields
    if (affilaiteamount !== undefined) {
      payout.affilaiteamount = parseFloat(affilaiteamount);
    }

    if (masteraffiliateamount !== undefined) {
      payout.masteraffiliateamount = parseFloat(masteraffiliateamount);
    }

    await payout.save();

    res.json({
      success: true,
      message: "Affiliate payout configuration updated successfully",
      data: payout,
    });
  } catch (error) {
    console.error("Error updating affiliate payout:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update affiliate payout configuration",
    });
  }
});

// DELETE affiliate payout configuration
Adminrouter.delete("/affiliate-payouts", async (req, res) => {
  try {
    const payout = await Affilaitepayout.findOne();

    if (!payout) {
      return res.status(404).json({
        success: false,
        error: "No affiliate payout configuration found to delete",
      });
    }

    await Affilaitepayout.deleteOne({ _id: payout._id });

    res.json({
      success: true,
      message: "Affiliate payout configuration deleted successfully",
      data: {
        id: payout._id,
        affilaiteamount: payout.affilaiteamount,
        masteraffiliateamount: payout.masteraffiliateamount,
      },
    });
  } catch (error) {
    console.error("Error deleting affiliate payout:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete affiliate payout configuration",
    });
  }
});

// ---------------admin-route--------------------------
Adminrouter.get("/betting-history",async(req,res)=>{
  try {
    const bettinghistory=await BettingHistory.find();
    if(!bettinghistory){
    return res.send({success:false,message:"no data found!"})
    }
     return res.send({success:true,data:bettinghistory})
  } catch (error) {
    console.log(error);
  }
})

// ------------------------deposit-method----------------------
// Multer setup for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

/**
 * @route   POST /api/deposit-method/manual
 * @desc    Create new manual deposit method
 */

Adminrouter.post("/manual-payment", upload.single("image"), async (req, res) => {
  try {
    const {
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      depositInstruction,
      accountType,
      accountNumber,
      createdbyid,
      youtubeLink,
      referelcode,
      userData, // userData is now a plain object, no need to parse
    } = req.body;
    console.log(req.body)
    // Ensure userData is in the correct format (already parsed from frontend if needed)
    const parsedUserData = Array.isArray(userData) ? userData : JSON.parse(userData);

    const newMethod = new Depositmethod({
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      accountType,
      accountNumber,
      depositInstruction,
      image: req.file.filename,
      userData: parsedUserData,
      createdbyid,
      youtubeLink:youtubeLink,
      referelcode
    });

    await newMethod.save();
    res.status(201).json({ message: "Manual deposit method added successfully." });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: "Failed to add manual deposit method." });
  }
});
/**
 * @route   GET /api/deposit-method/manual
 * @desc    Get all manual deposit methods
 */
Adminrouter.get("/deposit-methods", async (req, res) => {
  try {
    const methods = await Depositmethod.find().sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch manual deposit methods." });
  }
});
Adminrouter.get("/deposit-methods/:id", async (req, res) => {
  try {
    const methods = await Depositmethod.find({createdbyid:req.params.id}).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch manual deposit methods." });
  }
});
// -------------enabled deposit method------------------
Adminrouter.get("/enabled-deposit-methods", async (req, res) => {
  try {
    const methods = await Depositmethod.find({enabled:true}).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch manual deposit methods." });
  }
});
/**
 * @route   PUT /api/deposit-method/manual/:id
 * @desc    Update a manual deposit method
 */
Adminrouter.put("/deposit-methods/:id", upload.single("image"), async (req, res) => {
  try {
    const {
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      depositInstruction,
      userData,
      youtubeLink
    } = req.body;
    
    const updatedData = {
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      depositInstruction,
      youtubeLink,
      userData: JSON.parse(userData),
      
    };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    await Depositmethod.findByIdAndUpdate(req.params.id, updatedData);
    res.json({ message: "Manual deposit method updated successfully." });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Failed to update manual deposit method." });
  }
});

/**
 * @route   DELETE /api/deposit-method/manual/:id
 * @desc    Delete a manual deposit method
 */
Adminrouter.delete("/deposit-methods/:id", async (req, res) => {
  try {
    await Depositmethod.findByIdAndDelete(req.params.id);
    res.json({ message: "Manual deposit method deleted successfully." });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete manual deposit method." });
  }
});
/**
 * @route   PUT /api/deposit-method/manual/status/:id
 * @desc    Update the status of a manual deposit method (enable/disable)
 */
Adminrouter.put("/manual/status/:id", async (req, res) => {
  try {
    // Get the 'enabled' status from the request body (true for enable, false for disable)
    const { enabled } = req.body;

    // Validate that 'enabled' is a boolean
    if (typeof enabled !== "boolean") {
      return res.status(400).json({ message: "'enabled' should be a boolean value." });
    }

    // Find and update the status of the deposit method
    const updatedMethod = await Depositmethod.findByIdAndUpdate(
      req.params.id,
      { enabled },
      { new: true }  // Return the updated document
    );

    // If the method is not found, return a 404 error
    if (!updatedMethod) {
      return res.status(404).json({ message: "Manual deposit method not found." });
    }

    // Send a success response
    res.json({
      message: `Manual deposit method ${enabled ? "enabled" : "disabled"} successfully.`,
      updatedMethod
    });
  } catch (error) {
    console.error("Status Update Error:", error);
    res.status(500).json({ message: "Failed to update status of the manual deposit method." });
  }
});

// --- Create Withdraw Method ---
Adminrouter.post("/manual-withdraw", upload.single("image"), async (req, res) => {
  try {
    const {
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      depositInstruction,
      referelcode,
      createdbyid,
      youtubeLink,
      userData, // userData is now a plain object, no need to parse
    } = req.body;

    // Ensure userData is in the correct format (already parsed from frontend if needed)
    const parsedUserData = Array.isArray(userData) ? userData : JSON.parse(userData);
 console.log(req.body)
    const newMethod = new Withdrawmethod({
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      depositInstruction:depositInstruction,
      image: req.file.filename,
      userData: parsedUserData,
      createdbyid,
      referelcode:referelcode,
           youtubeLink:youtubeLink,
    });

    await newMethod.save();
    res.status(201).json({ message: "Manual deposit method added successfully." });
  } catch (error) {
    console.error("Create Error:", error);
    res.status(500).json({ message: "Failed to add manual deposit method." });
  }
});

// --- Get All Withdraw Methods ---
Adminrouter.get("/withdraw-methods", async (req, res) => {
  try {
    const methods = await Withdrawmethod.find().sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error("Fetch Withdraw Error:", error);
    res.status(500).json({ message: "Failed to fetch manual withdraw methods." });
  }
});
Adminrouter.get("/withdraw-methods/:id", async (req, res) => {
  try {
    const methods = await Withdrawmethod.find({createdbyid:req.params.id}).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error("Fetch Withdraw Error:", error);
    res.status(500).json({ message: "Failed to fetch manual withdraw methods." });
  }
});
// ----------enabled-withdraw-method------------------
Adminrouter.get("/enabled-withdraw-methods", async (req, res) => {
  try {
    const methods = await Withdrawmethod.find({enabled:true}).sort({ createdAt: -1 });
    res.json(methods);
  } catch (error) {
    console.error("Fetch Withdraw Error:", error);
    res.status(500).json({ message: "Failed to fetch manual withdraw methods." });
  }
});
// --- Update Withdraw Method ---
Adminrouter.put("/withdraw-methods/:id", upload.single("image"), async (req, res) => {
  try {
    const {
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      withdrawInstruction,
      userData,
            youtubeLink
    } = req.body;
     
    const updatedData = {
      gatewayName,
      currencyName,
      minAmount,
      maxAmount,
      fixedCharge,
      percentCharge,
      rate,
      withdrawInstruction,
      userData: JSON.parse(userData),
            youtubeLink
    };

    if (req.file) {
      updatedData.image = req.file.path;
    }

    await Withdrawmethod.findByIdAndUpdate(req.params.id, updatedData);
    res.json({ message: "Manual withdraw method updated successfully." });
  } catch (error) {
    console.error("Update Withdraw Error:", error);
    res.status(500).json({ message: "Failed to update manual withdraw method." });
  }
});

// --- Delete Withdraw Method ---
Adminrouter.delete("/withdraw-methods/:id", async (req, res) => {
  try {
    await Withdrawmethod.findByIdAndDelete(req.params.id);
    res.json({ message: "Manual withdraw method deleted successfully." });
  } catch (error) {
    console.error("Delete Withdraw Error:", error);
    res.status(500).json({ message: "Failed to delete manual withdraw method." });
  }
});

// --- Enable/Disable Withdraw Method ---
Adminrouter.put("/manual-withdraw/status/:id", async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({ message: "'enabled' should be a boolean value." });
    }

    const updatedMethod = await Withdrawmethod.findByIdAndUpdate(
      req.params.id,
      { enabled },
      { new: true }
    );

    if (!updatedMethod) {
      return res.status(404).json({ message: "Manual withdraw method not found." });
    }

    res.json({
      message: `Manual withdraw method ${enabled ? "enabled" : "disabled"} successfully.`,
      updatedMethod,
    });
  } catch (error) {
    console.error("Status Update Withdraw Error:", error);
    res.status(500).json({ message: "Failed to update status of the manual withdraw method." });
  }
});

// ==================== MASTER AFFILIATE BASIC CRUD ROUTES ====================

// GET all master affiliates
Adminrouter.get("/master-affiliates", async (req, res) => {
  try {
    const masterAffiliates = await MasterAffiliate.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: masterAffiliates,
      count: masterAffiliates.length
    });
  } catch (error) {
    console.error("Error fetching master affiliates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch master affiliates"
    });
  }
});

// GET single master affiliate by ID
Adminrouter.get("/master-affiliates/:id", async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findById(req.params.id)
      .populate("createdBy", "firstName lastName email")
      .populate("subAffiliates.affiliate", "firstName lastName email affiliateCode")
      .populate("earningsHistory.sourceAffiliate", "firstName lastName email");

    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        error: "Master affiliate not found"
      });
    }

    res.json({
      success: true,
      data: masterAffiliate
    });
  } catch (error) {
    console.error("Error fetching master affiliate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch master affiliate"
    });
  }
});

// PUT update master affiliate
Adminrouter.put("/master-affiliates/:id", async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      company,
      website,
      promoMethod,
      commissionRate,
      depositRate,
      commissionType,
      cpaRate,
      status,
      verificationStatus,
      paymentMethod,
      minimumPayout,
      payoutSchedule,
      autoPayout,
      notes,
      tags,
      assignedManager
    } = req.body;

    const masterAffiliate = await MasterAffiliate.findById(req.params.id);
    
    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        error: "Master affiliate not found"
      });
    }

    // Update basic information
    if (firstName) masterAffiliate.firstName = firstName;
    if (lastName) masterAffiliate.lastName = lastName;
    if (phone) masterAffiliate.phone = phone;
    if (company !== undefined) masterAffiliate.company = company;
    if (website !== undefined) masterAffiliate.website = website;
    if (promoMethod) masterAffiliate.promoMethod = promoMethod;

    // Update commission settings
    if (commissionRate !== undefined) masterAffiliate.commissionRate = commissionRate;
    if (depositRate !== undefined) masterAffiliate.depositRate = depositRate;
    if (commissionType) masterAffiliate.commissionType = commissionType;
    if (cpaRate !== undefined) masterAffiliate.cpaRate = cpaRate;

    // Update status and verification
    if (status) masterAffiliate.status = status;
    if (verificationStatus) masterAffiliate.verificationStatus = verificationStatus;

    // Update payment settings
    if (paymentMethod) masterAffiliate.paymentMethod = paymentMethod;
    if (minimumPayout !== undefined) masterAffiliate.minimumPayout = minimumPayout;
    if (payoutSchedule) masterAffiliate.payoutSchedule = payoutSchedule;
    if (autoPayout !== undefined) masterAffiliate.autoPayout = autoPayout;

    // Update administrative fields
    if (notes !== undefined) masterAffiliate.notes = notes;
    if (tags !== undefined) masterAffiliate.tags = tags;
    if (assignedManager !== undefined) masterAffiliate.assignedManager = assignedManager;

    await masterAffiliate.save();

    // Remove sensitive data before sending response
    const masterAffiliateResponse = masterAffiliate.toJSON();

    res.json({
      success: true,
      message: "Master affiliate updated successfully",
      data: masterAffiliateResponse
    });
  } catch (error) {
    console.error("Error updating master affiliate:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update master affiliate"
    });
  }
});

// DELETE master affiliate
Adminrouter.delete("/master-affiliates/:id", async (req, res) => {
  try {
    const masterAffiliate = await MasterAffiliate.findById(req.params.id);

    if (!masterAffiliate) {
      return res.status(404).json({
        success: false,
        error: "Master affiliate not found"
      });
    }

    await MasterAffiliate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Master affiliate deleted successfully",
      data: {
        id: masterAffiliate._id,
        name: `${masterAffiliate.firstName} ${masterAffiliate.lastName}`,
        email: masterAffiliate.email
      }
    });
  } catch (error) {
    console.error("Error deleting master affiliate:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete master affiliate"
    });
  }
});


const SocialLink = require("../models/SocialLink");

// ==================== SOCIAL LINK ROUTES ====================

// GET all social links
Adminrouter.get("/social-links", async (req, res) => {
  try {
    const { isActive } = req.query;
    
    let filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const socialLinks = await SocialLink.find(filter).sort({ order: 1, createdAt: 1 });
    
    res.json({
      success: true,
      data: socialLinks,
      count: socialLinks.length
    });
  } catch (error) {
    console.error("Error fetching social links:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch social links" 
    });
  }
});

// GET single social link
Adminrouter.get("/social-links/:id", async (req, res) => {
  try {
    const socialLink = await SocialLink.findById(req.params.id);
    
    if (!socialLink) {
      return res.status(404).json({
        success: false,
        error: "Social link not found"
      });
    }
    
    res.json({
      success: true,
      data: socialLink
    });
  } catch (error) {
    console.error("Error fetching social link:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch social link"
    });
  }
});

// POST create new social link
Adminrouter.post("/social-links", async (req, res) => {
  try {
    const {
      platform,
      url,
      displayName,
      backgroundColor,
      order,
      isActive,
      opensInNewTab
    } = req.body;

    // Validation
    if (!platform || !url || !displayName) {
      return res.status(400).json({
        success: false,
        error: "Platform, URL, and display name are required"
      });
    }

    // Check if platform already exists
    const existingLink = await SocialLink.findOne({ platform });
    if (existingLink) {
      return res.status(400).json({
        success: false,
        error: "Social link for this platform already exists"
      });
    }

    const socialLinkData = {
      platform,
      url,
      displayName,
      backgroundColor: backgroundColor || '#6B7280',
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      opensInNewTab: opensInNewTab !== undefined ? opensInNewTab : true
    };

    const newSocialLink = new SocialLink(socialLinkData);
    const savedSocialLink = await newSocialLink.save();

    res.status(201).json({
      success: true,
      message: "Social link created successfully",
      data: savedSocialLink
    });
  } catch (error) {
    console.error("Error creating social link:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create social link"
    });
  }
});

// PUT update social link
Adminrouter.put("/social-links/:id", async (req, res) => {
  try {
    const {
      url,
      displayName,
      backgroundColor,
      order,
      isActive,
      opensInNewTab
    } = req.body;

    const socialLink = await SocialLink.findById(req.params.id);
    
    if (!socialLink) {
      return res.status(404).json({
        success: false,
        error: "Social link not found"
      });
    }

    // Update fields
    if (url !== undefined) socialLink.url = url;
    if (displayName !== undefined) socialLink.displayName = displayName;
    if (backgroundColor !== undefined) socialLink.backgroundColor = backgroundColor;
    if (order !== undefined) socialLink.order = order;
    if (isActive !== undefined) socialLink.isActive = isActive;
    if (opensInNewTab !== undefined) socialLink.opensInNewTab = opensInNewTab;

    await socialLink.save();

    res.json({
      success: true,
      message: "Social link updated successfully",
      data: socialLink
    });
  } catch (error) {
    console.error("Error updating social link:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update social link"
    });
  }
});

// PUT update social link status
Adminrouter.put("/social-links/:id/status", async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: "Valid isActive status is required"
      });
    }

    const socialLink = await SocialLink.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!socialLink) {
      return res.status(404).json({
        success: false,
        error: "Social link not found"
      });
    }

    res.json({
      success: true,
      message: `Social link ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: socialLink
    });
  } catch (error) {
    console.error("Error updating social link status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update social link status"
    });
  }
});

// DELETE social link
Adminrouter.delete("/social-links/:id", async (req, res) => {
  try {
    const socialLink = await SocialLink.findById(req.params.id);
    
    if (!socialLink) {
      return res.status(404).json({
        success: false,
        error: "Social link not found"
      });
    }

    await SocialLink.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Social link deleted successfully",
      data: {
        id: socialLink._id,
        platform: socialLink.platform,
        displayName: socialLink.displayName
      }
    });
  } catch (error) {
    console.error("Error deleting social link:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete social link"
    });
  }
});

// PUT update social link order (bulk update)
Adminrouter.put("/social-links/order/update", async (req, res) => {
  try {
    const { socialLinks } = req.body;

    if (!socialLinks || !Array.isArray(socialLinks)) {
      return res.status(400).json({
        success: false,
        error: "Social links array is required"
      });
    }

    const bulkOps = socialLinks.map((link, index) => ({
      updateOne: {
        filter: { _id: link._id },
        update: { $set: { order: index } }
      }
    }));

    await SocialLink.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: "Social link order updated successfully"
    });
  } catch (error) {
    console.error("Error updating social link order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update social link order"
    });
  }
});

// POST initialize default social links
Adminrouter.post("/social-links/initialize-defaults", async (req, res) => {
  try {
    await SocialLink.initializeDefaults();
    
    const socialLinks = await SocialLink.find().sort({ order: 1 });
    
    res.json({
      success: true,
      message: "Default social links initialized successfully",
      data: socialLinks
    });
  } catch (error) {
    console.error("Error initializing default social links:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initialize default social links"
    });
  }
});

// GET active social links for frontend
Adminrouter.get("/social-links/active", async (req, res) => {
  try {
    const socialLinks = await SocialLink.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .select('platform url displayName backgroundColor opensInNewTab');

    // Format URLs for frontend
    const formattedLinks = socialLinks.map(link => ({
      ...link.toObject(),
      formattedUrl: link.url.startsWith('http') ? link.url : `https://${link.url}`,
      isGradient: link.backgroundColor.includes('gradient')
    }));

    res.json({
      success: true,
      data: formattedLinks
    });
  } catch (error) {
    console.error("Error fetching active social links:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active social links"
    });
  }
});

module.exports = Adminrouter;
