const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const affiliateSchema = new mongoose.Schema({
  // Personal Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\+?[0-9\s\-\(\)]{10,}$/, 'Please enter a valid phone number']
  },
 // Role Information
  role: {
    type: String,
    enum: ['affiliate', 'super_affiliate', 'master_affiliate'],
    default: 'super_affiliate'
  },
  createdBy:{
    type: String,
  },
  // Business Information
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\..+$/, 'Please enter a valid website URL']
  },
  promoMethod: {
    type: String,
    enum: ['website', 'social_media', 'youtube', 'blog', 'email_marketing', 'other'],
    required: true
  },
  socialMediaProfiles: {
    facebook: String,
    youtube: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Bangladesh'
    },
    zipCode: String
  },
  
  // Commission & Earnings
  commissionRate: {
    type: Number,
    default: 0, // 10% default for bet
  },
  depositRate: {
    type: Number,
    default: 0, // Default 0% for deposit
  },
  commissionType: {
    type: String,
    enum: ['revenue_share', 'cpa', 'hybrid'],
    default: 'revenue_share'
  },
  cpaRate: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  paidEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  lastPayoutDate: {
    type: Date,
    default: null
  },
  
  // Earnings History Array - Track all commission earnings
  earningsHistory: [{
    // Basic earning info
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['deposit_commission', 'bet_commission', 'withdrawal_commission', 'registration_bonus', 'cpa', 'other'],
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending'
    },
    
    // Source information
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true // This can be depositId, betId, withdrawalId, etc.
    },
    sourceType: {
      type: String,
      enum: ['deposit', 'bet', 'withdrawal', 'registration', 'other'],
      required: true
    },
    
    // Commission calculation details
    commissionRate: {
      type: Number,
      required: true,
      min: 0
    },
    sourceAmount: {
      type: Number,
      required: true,
      min: 0 // Original amount that commission was calculated from
    },
    calculatedAmount: {
      type: Number,
      required: true,
      min: 0 // Actual commission amount
    },
    
    // Timestamps
    earnedAt: {
      type: Date,
      default: Date.now
    },
    paidAt: {
      type: Date,
      default: null
    },
    payoutId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payout',
      default: null
    },
    
    // Additional metadata
    metadata: {
      betType: String, // For bet commissions
      gameType: String, // For bet commissions
      depositMethod: String, // For deposit commissions
      withdrawalMethod: String, // For withdrawal commissions
      currency: {
        type: String,
        default: 'BDT'
      },
      notes: String
    }
  }],
  
  // Affiliate Identification
  affiliateCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    sparse: true
  },
  customAffiliateCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    sparse: true,
    maxlength: 20
  },
  
  // Referral Tracking
  referralCount: {
    type: Number,
    default: 0,
    min: 0
  },
  activeReferrals: {
    type: Number,
    default: 0,
    min: 0
  },
  referredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    earnedAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    userStatus: {
      type: String,
      enum: ['active', 'inactive', 'banned'],
      default: 'active'
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status & Verification
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned','inactive'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'unverified'
  },
  verificationDocuments: [{
    documentType: String,
    documentUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'binance', 'bank_transfer'],
    default: 'bkash'
  },
  paymentDetails: {
    // Mobile financial services (Bangladesh)
    bkash: {
      phoneNumber: String,
      accountType: {
        type: String,
        enum: ['personal', 'merchant'],
        default: 'personal'
      }
    },
    nagad: {
      phoneNumber: String,
      accountType: {
        type: String,
        enum: ['personal', 'merchant'],
        default: 'personal'
      }
    },
    rocket: {
      phoneNumber: String,
      accountType: {
        type: String,
        enum: ['personal', 'merchant'],
        default: 'personal'
      }
    },
    
    // Cryptocurrency
    binance: {
      email: String,
      binanceId: String,
      walletAddress: String
    },
    
    // Bank Transfer
    bank_transfer: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      branchName: String,
      routingNumber: String,
      swiftCode: String
    }
  },
  
  // Payout Settings
  minimumPayout: {
    type: Number,
    default: 1000,
    min: 1000
  },
  payoutSchedule: {
    type: String,
    enum: ['weekly', 'bi_weekly', 'monthly', 'manual'],
    default: 'manual'
  },
  autoPayout: {
    type: Boolean,
    default: false
  },
  
  // Security & Tracking
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerificationToken: String,
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Performance Metrics
  clickCount: {
    type: Number,
    default: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  averageEarningPerReferral: {
    type: Number,
    default: 0
  },
  
  // Administrative
  notes: String,
  tags: [String],
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registrationSource: {
    type: String,
    enum: ['direct', 'invite', 'partner', 'other'],
    default: 'direct'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
affiliateSchema.index({ email: 1 });
affiliateSchema.index({ affiliateCode: 1 });
affiliateSchema.index({ customAffiliateCode: 1 }, { sparse: true });
affiliateSchema.index({ status: 1 });
affiliateSchema.index({ 'paymentDetails.bkash.phoneNumber': 1 });
affiliateSchema.index({ 'paymentDetails.nagad.phoneNumber': 1 });
affiliateSchema.index({ 'paymentDetails.rocket.phoneNumber': 1 });
affiliateSchema.index({ 'referredUsers.user': 1 });
affiliateSchema.index({ 'earningsHistory.referredUser': 1 });
affiliateSchema.index({ 'earningsHistory.sourceId': 1 });
affiliateSchema.index({ 'earningsHistory.type': 1 });
affiliateSchema.index({ 'earningsHistory.earnedAt': -1 });
affiliateSchema.index({ createdAt: -1 });
affiliateSchema.index({ totalEarnings: -1 });
affiliateSchema.index({ referralCount: -1 });

// Virtuals
affiliateSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

affiliateSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

affiliateSchema.virtual('earningsThisMonth').get(function() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  return this.earningsHistory
    .filter(earning => earning.earnedAt >= startOfMonth && earning.status !== 'cancelled')
    .reduce((total, earning) => total + earning.amount, 0);
});

affiliateSchema.virtual('pendingEarningsCount').get(function() {
  return this.earningsHistory.filter(earning => earning.status === 'pending').length;
});

affiliateSchema.virtual('formattedPaymentDetails').get(function() {
  const method = this.paymentMethod;
  const details = this.paymentDetails;
  
  switch (method) {
    case 'bkash':
      return {
        method: 'bKash',
        phoneNumber: details.bkash?.phoneNumber,
        accountType: details.bkash?.accountType
      };
    case 'nagad':
      return {
        method: 'Nagad',
        phoneNumber: details.nagad?.phoneNumber,
        accountType: details.nagad?.accountType
      };
    case 'rocket':
      return {
        method: 'Rocket',
        phoneNumber: details.rocket?.phoneNumber,
        accountType: details.rocket?.accountType
      };
    case 'binance':
      return {
        method: 'Binance',
        email: details.binance?.email,
        binanceId: details.binance?.binanceId,
        walletAddress: details.binance?.walletAddress
      };
    case 'bank_transfer':
      return {
        method: 'Bank Transfer',
        bankName: details.bank_transfer?.bankName,
        accountName: details.bank_transfer?.accountName,
        accountNumber: details.bank_transfer?.accountNumber
      };
    default:
      return { method: 'Not specified' };
  }
});

// Pre-save middleware
affiliateSchema.pre('save', async function(next) {
  // Hash password
  if (this.isModified('password')) {
    try {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    } catch (error) {
      return next(error);
    }
  }
  
  // Generate affiliate code if not present
  if (this.isNew && !this.affiliateCode) {
    try {
      this.affiliateCode = await this.constructor.generateUniqueAffiliateCode();
    } catch (error) {
      return next(error);
    }
  }
  
  // Calculate performance metrics
  if (this.isModified('referredUsers') || this.isModified('clickCount')) {
    this.conversionRate = this.clickCount > 0 ? (this.referralCount / this.clickCount) * 100 : 0;
    this.averageEarningPerReferral = this.referralCount > 0 ? this.totalEarnings / this.referralCount : 0;
    this.activeReferrals = this.referredUsers.filter(user => user.userStatus === 'active').length;
  }
  
  next();
});

// Instance Methods
affiliateSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }
  
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  
  if (!isMatch) {
    await this.incrementLoginAttempts();
    throw new Error('Invalid password');
  }
  
  // Reset login attempts on successful login
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  await this.save();
  
  return true;
};

affiliateSchema.methods.incrementLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if we've reached max attempts and it's not already locked
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) }; // 2 hours
  }
  
  return await this.updateOne(updates);
};

// New method to add commission earnings with history tracking
affiliateSchema.methods.addCommission = async function(
  amount, 
  referredUser, 
  sourceId, 
  sourceType, 
  commissionRate, 
  sourceAmount,
  type = 'bet_commission',
  description = '',
  metadata = {}
) {
  if (amount <= 0) {
    throw new Error('Commission amount must be positive');
  }
  
  // Create earning history record
  const earningRecord = {
    amount: amount,
    type: type,
    description: description,
    status: 'pending',
    referredUser: referredUser,
    sourceId: sourceId,
    sourceType: sourceType,
    commissionRate: commissionRate,
    sourceAmount: sourceAmount,
    calculatedAmount: amount,
    earnedAt: new Date(),
    metadata: metadata
  };
  
  // Add to earnings history
  this.earningsHistory.push(earningRecord);
  
  // Update total earnings
  this.pendingEarnings += amount;
  this.totalEarnings += amount;
  
  // Update referred user's earned amount
  const referredUserEntry = this.referredUsers.find(u => u.user.toString() === referredUser.toString());
  if (referredUserEntry) {
    referredUserEntry.earnedAmount += amount;
    referredUserEntry.lastActivity = new Date();
  } else {
    this.referredUsers.push({
      user: referredUser,
      earnedAmount: amount,
      lastActivity: new Date()
    });
    this.referralCount += 1;
  }
  
  return await this.save();
};

// Method to add deposit commission
affiliateSchema.methods.addDepositCommission = async function(
  referredUser, 
  depositId, 
  depositAmount, 
  commissionRate = null,
  description = 'Deposit commission',
  metadata = {}
) {
  const rate = commissionRate || this.depositRate;
  const commissionAmount = depositAmount * rate;
  
  return await this.addCommission(
    commissionAmount,
    referredUser,
    depositId,
    'deposit',
    rate,
    depositAmount,
    'deposit_commission',
    description,
    { ...metadata, depositMethod: metadata.depositMethod || 'unknown' }
  );
};

// Method to add bet commission
affiliateSchema.methods.addBetCommission = async function(
  referredUser, 
  betId, 
  betAmount, 
  commissionRate = null,
  description = 'Bet commission',
  metadata = {}
) {
  const rate = commissionRate || this.commissionRate;
  const commissionAmount = betAmount * rate;
  
  return await this.addCommission(
    commissionAmount,
    referredUser,
    betId,
    'bet',
    rate,
    betAmount,
    'bet_commission',
    description,
    { ...metadata, betType: metadata.betType || 'unknown', gameType: metadata.gameType || 'unknown' }
  );
};

// Method to add withdrawal commission
affiliateSchema.methods.addWithdrawalCommission = async function(
  referredUser, 
  withdrawalId, 
  withdrawalAmount, 
  commissionRate,
  description = 'Withdrawal commission',
  metadata = {}
) {
  const commissionAmount = withdrawalAmount * commissionRate;
  
  return await this.addCommission(
    commissionAmount,
    referredUser,
    withdrawalId,
    'withdrawal',
    commissionRate,
    withdrawalAmount,
    'withdrawal_commission',
    description,
    { ...metadata, withdrawalMethod: metadata.withdrawalMethod || 'unknown' }
  );
};

// Method to add registration bonus
affiliateSchema.methods.addRegistrationBonus = async function(
  referredUser, 
  registrationId, 
  bonusAmount,
  description = 'Registration bonus',
  metadata = {}
) {
  return await this.addCommission(
    bonusAmount,
    referredUser,
    registrationId,
    'registration',
    1, // 100% of bonus amount
    bonusAmount,
    'registration_bonus',
    description,
    metadata
  );
};

// Method to process payout and update earnings history
affiliateSchema.methods.processPayout = async function(amount, transactionId = null, notes = '') {
  if (amount > this.pendingEarnings) {
    throw new Error('Insufficient pending earnings');
  }
  
  if (amount < this.minimumPayout) {
    throw new Error(`Payout amount must be at least ${this.minimumPayout}`);
  }
  
  // Create payout record
  const Payout = mongoose.model('Payout');
  const payout = await Payout.create({
    affiliate: this._id,
    amount: amount,
    paymentMethod: this.paymentMethod,
    paymentDetails: this.formattedPaymentDetails,
    transactionId: transactionId,
    status: 'completed',
    notes: notes
  });
  
  // Update earnings history - mark pending earnings as paid
  let amountProcessed = 0;
  const paidEarnings = [];
  
  for (let earning of this.earningsHistory) {
    if (earning.status === 'pending' && amountProcessed < amount) {
      const remainingAmount = amount - amountProcessed;
      const earningAmount = Math.min(earning.amount, remainingAmount);
      
      earning.status = 'paid';
      earning.paidAt = new Date();
      earning.payoutId = payout._id;
      
      amountProcessed += earningAmount;
      paidEarnings.push(earning._id);
    }
    
    if (amountProcessed >= amount) break;
  }
  
  // Update affiliate earnings totals
  this.pendingEarnings -= amount;
  this.paidEarnings += amount;
  this.lastPayoutDate = new Date();
  
  return await this.save();
};

// Method to get earnings history with filters
affiliateSchema.methods.getEarningsHistory = function(filters = {}) {
  let earnings = this.earningsHistory;
  
  if (filters.type) {
    earnings = earnings.filter(earning => earning.type === filters.type);
  }
  
  if (filters.status) {
    earnings = earnings.filter(earning => earning.status === filters.status);
  }
  
  if (filters.startDate) {
    earnings = earnings.filter(earning => earning.earnedAt >= new Date(filters.startDate));
  }
  
  if (filters.endDate) {
    earnings = earnings.filter(earning => earning.earnedAt <= new Date(filters.endDate));
  }
  
  if (filters.referredUser) {
    earnings = earnings.filter(earning => earning.referredUser.toString() === filters.referredUser.toString());
  }
  
  // Sort by earned date (newest first)
  return earnings.sort((a, b) => new Date(b.earnedAt) - new Date(a.earnedAt));
};

// Method to get earnings summary by type
affiliateSchema.methods.getEarningsSummary = function() {
  const summary = {
    total: 0,
    pending: 0,
    paid: 0,
    byType: {}
  };
  
  this.earningsHistory.forEach(earning => {
    summary.total += earning.amount;
    
    if (earning.status === 'pending') {
      summary.pending += earning.amount;
    } else if (earning.status === 'paid') {
      summary.paid += earning.amount;
    }
    
    if (!summary.byType[earning.type]) {
      summary.byType[earning.type] = {
        total: 0,
        count: 0
      };
    }
    
    summary.byType[earning.type].total += earning.amount;
    summary.byType[earning.type].count += 1;
  });
  
  return summary;
};

affiliateSchema.methods.trackClick = async function() {
  this.clickCount += 1;
  return await this.save();
};

affiliateSchema.methods.generateResetToken = async function() {
  const crypto = require('crypto');
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return await this.save();
};

// Static Methods
affiliateSchema.statics.generateUniqueAffiliateCode = async function() {
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  let code = generateCode();
  let attempts = 0;

  while (attempts < 10) {
    const existingAffiliate = await this.findOne({ 
      $or: [
        { affiliateCode: code },
        { customAffiliateCode: code }
      ]
    });
    
    if (!existingAffiliate) {
      return code;
    }
    
    code = generateCode();
    attempts++;
  }

  throw new Error('Could not generate unique affiliate code');
};

affiliateSchema.statics.findByCode = function(code) {
  return this.findOne({
    $or: [
      { affiliateCode: code.toUpperCase() },
      { customAffiliateCode: code.toUpperCase() }
    ],
    status: 'active'
  });
};

affiliateSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ totalEarnings: -1 })
    .limit(limit);
};

affiliateSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: null,
        totalAffiliates: { $sum: 1 },
        totalEarnings: { $sum: '$totalEarnings' },
        pendingPayouts: { $sum: '$pendingEarnings' },
        totalReferrals: { $sum: '$referralCount' },
        averageCommissionRate: { $avg: '$commissionRate' }
      }
    }
  ]);
  
  return stats[0] || {
    totalAffiliates: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    totalReferrals: 0,
    averageCommissionRate: 0
  };
};

// JSON transform to remove sensitive information
affiliateSchema.methods.toJSON = function() {
  const affiliate = this.toObject();
  delete affiliate.password;
  delete affiliate.resetPasswordToken;
  delete affiliate.resetPasswordExpires;
  delete affiliate.emailVerificationToken;
  delete affiliate.loginAttempts;
  delete affiliate.lockUntil;
  return affiliate;
};

module.exports = mongoose.model('Affiliate', affiliateSchema);