const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const masterAffiliateSchema = new mongoose.Schema({
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
  totalClicks:{
 type: Number,
    deafult:0,
  },
   total_earning:{
    type: Number,
    deafult:0,
   },
  // Role & Hierarchy Information
  role: {
    type: String,
    enum: ['master_affiliate'],
    default: 'master_affiliate'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Affiliate',
    required: true,
    index: true
  },
  createdByRole: {
    type: String,
    enum: ['super_affiliate', 'admin'],
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
  
  // Master Affiliate Earnings (from sub-affiliates)
  masterEarnings: {
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
    overrideCommission: {
      type: Number,
      default: 5, // 5% override on sub-affiliate earnings
      min: 0,
      max: 100
    }
  },
  
  // Sub-Affiliates Management
  subAffiliates: [{
    affiliate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    customCommissionRate: {
      type: Number,
      min: 0,
      max: 100
    },
    customDepositRate: {
      type: Number,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended'],
      default: 'active'
    },
    totalEarned: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Master Affiliate Earnings History
  earningsHistory: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['override_commission', 'bonus', 'incentive', 'other'],
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      default: 'pending'
    },
    
    // Source information (which sub-affiliate generated this earning)
    sourceAffiliate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: true
    },
    sourceType: {
      type: String,
      enum: ['bet_commission', 'deposit_commission', 'withdrawal_commission', 'registration', 'other'],
      required: true
    },
    sourceAmount: {
      type: Number,
      required: true,
      min: 0
    },
    overrideRate: {
      type: Number,
      required: true,
      min: 0
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
      subAffiliateEarningId: mongoose.Schema.Types.ObjectId,
      notes: String
    }
  }],
  
  // Affiliate Identification
  masterCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    sparse: true
  },
  customMasterCode: {
    type: String,
    unique: true,
    uppercase: true,
    trim: true,
    sparse: true,
    maxlength: 20
  },
  
  // Performance Metrics
  totalSubAffiliates: {
    type: Number,
    default: 0,
    min: 0
  },
  activeSubAffiliates: {
    type: Number,
    default: 0,
    min: 0
  },
  totalReferrals: {
    type: Number,
    default: 0,
    min: 0
  },
  conversionRate: {
    type: Number,
    default: 0
  },
  
  // Status & Verification
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'banned', 'inactive'],
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
    bkash: { phoneNumber: String, accountType: { type: String, enum: ['personal', 'merchant'], default: 'personal' } },
    nagad: { phoneNumber: String, accountType: { type: String, enum: ['personal', 'merchant'], default: 'personal' } },
    rocket: { phoneNumber: String, accountType: { type: String, enum: ['personal', 'merchant'], default: 'personal' } },
    binance: { email: String, binanceId: String, walletAddress: String },
    bank_transfer: { bankName: String, accountName: String, accountNumber: String, branchName: String, routingNumber: String, swiftCode: String }
  },
  
  // Payout Settings
  minimumPayout: {
    type: Number,
    default: 2000,
    min: 2000
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
  
  // Administrative
  notes: String,
  tags: [String],
  assignedManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  registrationSource: {
    type: String,
    enum: ['super_affiliate', 'admin', 'other'],
    default: 'super_affiliate'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
masterAffiliateSchema.index({ email: 1 });
masterAffiliateSchema.index({ masterCode: 1 });
masterAffiliateSchema.index({ customMasterCode: 1 }, { sparse: true });
masterAffiliateSchema.index({ status: 1 });
masterAffiliateSchema.index({ createdBy: 1 });
masterAffiliateSchema.index({ 'subAffiliates.affiliate': 1 });
masterAffiliateSchema.index({ 'earningsHistory.sourceAffiliate': 1 });
masterAffiliateSchema.index({ totalSubAffiliates: -1 });
masterAffiliateSchema.index({ 'masterEarnings.totalEarnings': -1 });

// Virtuals
masterAffiliateSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

masterAffiliateSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

masterAffiliateSchema.virtual('earningsThisMonth').get(function() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  return this.earningsHistory
    .filter(earning => earning.earnedAt >= startOfMonth && earning.status !== 'cancelled')
    .reduce((total, earning) => total + earning.amount, 0);
});

masterAffiliateSchema.virtual('formattedPaymentDetails').get(function() {
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
masterAffiliateSchema.pre('save', async function(next) {
  // Hash password
//   if (this.isModified('password')) {
//     try {
//       const saltRounds = 12;
//       this.password = await bcrypt.hash(this.password, saltRounds);
//     } catch (error) {
//       return next(error);
//     }
//   }
  
  // Generate master code if not present
  if (this.isNew && !this.masterCode) {
    try {
      this.masterCode = await this.constructor.generateUniqueMasterCode();
    } catch (error) {
      return next(error);
    }
  }
  
  // Calculate performance metrics
  if (this.isModified('subAffiliates')) {
    this.totalSubAffiliates = this.subAffiliates.length;
    this.activeSubAffiliates = this.subAffiliates.filter(sub => sub.status === 'active').length;
    this.totalReferrals = this.subAffiliates.reduce((total, sub) => total + (sub.totalEarned || 0), 0);
  }
  
  next();
});

// Instance Methods
masterAffiliateSchema.methods.comparePassword = async function(candidatePassword) {
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

masterAffiliateSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + (2 * 60 * 60 * 1000) };
  }
  
  return await this.updateOne(updates);
};

// Add sub-affiliate to master
masterAffiliateSchema.methods.addSubAffiliate = async function(
  affiliateId, 
  customCommissionRate = null, 
  customDepositRate = null
) {
  const existingSub = this.subAffiliates.find(sub => 
    sub.affiliate.toString() === affiliateId.toString()
  );
  
  if (existingSub) {
    throw new Error('Affiliate is already added as sub-affiliate');
  }
  
  this.subAffiliates.push({
    affiliate: affiliateId,
    customCommissionRate: customCommissionRate || this.commissionSettings.defaultAffiliateCommission,
    customDepositRate: customDepositRate || this.commissionSettings.defaultDepositCommission,
    status: 'active',
    joinedAt: new Date()
  });
  
  this.totalSubAffiliates = this.subAffiliates.length;
  this.activeSubAffiliates = this.subAffiliates.filter(sub => sub.status === 'active').length;
  
  return await this.save();
};

// Remove sub-affiliate
masterAffiliateSchema.methods.removeSubAffiliate = async function(affiliateId) {
  this.subAffiliates = this.subAffiliates.filter(sub => 
    sub.affiliate.toString() !== affiliateId.toString()
  );
  
  this.totalSubAffiliates = this.subAffiliates.length;
  this.activeSubAffiliates = this.subAffiliates.filter(sub => sub.status === 'active').length;
  
  return await this.save();
};

// Add override commission from sub-affiliate earnings
masterAffiliateSchema.methods.addOverrideCommission = async function(
  amount,
  sourceAffiliate,
  sourceType,
  sourceAmount,
  overrideRate = null,
  description = 'Override commission',
  metadata = {}
) {
  if (amount <= 0) {
    throw new Error('Commission amount must be positive');
  }
  
  const rate = overrideRate || this.masterEarnings.overrideCommission;
  
  // Create earning history record
  const earningRecord = {
    amount: amount,
    type: 'override_commission',
    description: description,
    status: 'pending',
    sourceAffiliate: sourceAffiliate,
    sourceType: sourceType,
    sourceAmount: sourceAmount,
    overrideRate: rate,
    earnedAt: new Date(),
    metadata: metadata
  };
  
  // Add to earnings history
  this.earningsHistory.push(earningRecord);
  
  // Update master earnings totals
  this.masterEarnings.pendingEarnings += amount;
  this.masterEarnings.totalEarnings += amount;
  
  // Update sub-affiliate's total earned
  const subAffiliate = this.subAffiliates.find(sub => 
    sub.affiliate.toString() === sourceAffiliate.toString()
  );
  
  if (subAffiliate) {
    subAffiliate.totalEarned += amount;
    subAffiliate.lastActivity = new Date();
  }
  
  return await this.save();
};

// Process payout for master affiliate
masterAffiliateSchema.methods.processPayout = async function(amount, transactionId = null, notes = '') {
  if (amount > this.masterEarnings.pendingEarnings) {
    throw new Error('Insufficient pending earnings');
  }
  
  if (amount < this.minimumPayout) {
    throw new Error(`Payout amount must be at least ${this.minimumPayout}`);
  }
  
  // Create payout record
  const Payout = mongoose.model('Payout');
  const payout = await Payout.create({
    masterAffiliate: this._id,
    amount: amount,
    paymentMethod: this.paymentMethod,
    paymentDetails: this.formattedPaymentDetails,
    transactionId: transactionId,
    status: 'completed',
    notes: notes,
    type: 'master_affiliate'
  });
  
  // Update earnings history - mark pending earnings as paid
  let amountProcessed = 0;
  
  for (let earning of this.earningsHistory) {
    if (earning.status === 'pending' && amountProcessed < amount) {
      const remainingAmount = amount - amountProcessed;
      const earningAmount = Math.min(earning.amount, remainingAmount);
      
      earning.status = 'paid';
      earning.paidAt = new Date();
      earning.payoutId = payout._id;
      
      amountProcessed += earningAmount;
    }
    
    if (amountProcessed >= amount) break;
  }
  
  // Update master earnings totals
  this.masterEarnings.pendingEarnings -= amount;
  this.masterEarnings.paidEarnings += amount;
  
  return await this.save();
};

// Get performance stats
masterAffiliateSchema.methods.getPerformanceStats = function() {
  const stats = {
    totalSubAffiliates: this.totalSubAffiliates,
    activeSubAffiliates: this.activeSubAffiliates,
    totalEarnings: this.masterEarnings.totalEarnings,
    pendingEarnings: this.masterEarnings.pendingEarnings,
    paidEarnings: this.masterEarnings.paidEarnings,
    averageEarningPerSub: this.totalSubAffiliates > 0 ? 
      this.masterEarnings.totalEarnings / this.totalSubAffiliates : 0
  };
  
  return stats;
};

// Generate reset token
masterAffiliateSchema.methods.generateResetToken = async function() {
  const crypto = require('crypto');
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000;
  return await this.save();
};

// Static Methods
masterAffiliateSchema.statics.generateUniqueMasterCode = async function() {
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'MAST';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  let code = generateCode();
  let attempts = 0;

  while (attempts < 10) {
    const existingMaster = await this.findOne({ 
      $or: [
        { masterCode: code },
        { customMasterCode: code }
      ]
    });
    
    if (!existingMaster) {
      return code;
    }
    
    code = generateCode();
    attempts++;
  }

  throw new Error('Could not generate unique master code');
};

masterAffiliateSchema.statics.findByCode = function(code) {
  return this.findOne({
    $or: [
      { masterCode: code.toUpperCase() },
      { customMasterCode: code.toUpperCase() }
    ],
    status: 'active'
  });
};

masterAffiliateSchema.statics.getTopMasters = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'masterEarnings.totalEarnings': -1 })
    .limit(limit);
};

masterAffiliateSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: null,
        totalMasters: { $sum: 1 },
        totalEarnings: { $sum: '$masterEarnings.totalEarnings' },
        pendingPayouts: { $sum: '$masterEarnings.pendingEarnings' },
        totalSubAffiliates: { $sum: '$totalSubAffiliates' },
        averageOverrideRate: { $avg: '$masterEarnings.overrideCommission' }
      }
    }
  ]);
  
  return stats[0] || {
    totalMasters: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    totalSubAffiliates: 0,
    averageOverrideRate: 0
  };
};

// JSON transform to remove sensitive information
masterAffiliateSchema.methods.toJSON = function() {
  const master = this.toObject();
  delete master.password;
  delete master.resetPasswordToken;
  delete master.resetPasswordExpires;
  delete master.emailVerificationToken;
  delete master.loginAttempts;
  delete master.lockUntil;
  return master;
};

module.exports = mongoose.model('MasterAffiliate', masterAffiliateSchema);